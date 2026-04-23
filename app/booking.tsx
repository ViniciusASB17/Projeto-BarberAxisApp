import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { appAssets } from '@/src/constants/appAssets';
import { palette, shadowPresets } from '@/src/constants/palette';
import { useAuth } from '@/src/context/AuthContext';
import { api } from '@/src/services/barberAxisApi';
import type { Appointment, Barber, BookingPayload, ServiceOption } from '@/src/types/barberAxis';

const serviceOptions = [
  { id: 'corte-barba', title: 'Corte + barba', priceLabel: 'R$39,90', duration: '50 min' },
  { id: 'corte-social', title: 'Corte social', priceLabel: 'R$29,90', duration: '35 min' },
  { id: 'barba-premium', title: 'Barba premium', priceLabel: 'R$24,90', duration: '30 min' },
  { id: 'acabamento', title: 'Acabamento', priceLabel: 'R$19,90', duration: '20 min' },
] as const satisfies readonly ServiceOption[];

const weekDayFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const dayFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

function buildDateOptions() {
  const baseDate = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const current = new Date(baseDate);
    current.setDate(baseDate.getDate() + index);

    const label = index === 0 ? 'Hoje' : index === 1 ? 'Amanha' : weekDayFormat.format(current);
    const normalizedLabel = label.replace('.', '');
    const value = current.toISOString().slice(0, 10);

    return {
      label: normalizedLabel.charAt(0).toUpperCase() + normalizedLabel.slice(1),
      value,
      fullLabel: dayFormat.format(current),
    };
  });
}

function buildTimeSlots(dateValue: string, barber?: Barber) {
  const day = new Date(`${dateValue}T12:00:00`).getDay();
  const weekendSlots = ['09:00', '10:30', '12:00', '13:30'];
  const defaultSlots = barber?.availableToday
    ? ['10:00', '11:30', '14:00', '15:30', '17:00']
    : ['09:30', '11:00', '13:30', '16:00', '18:00'];

  return day === 0 || day === 6 ? weekendSlots : defaultSlots;
}

function formatAppointmentLabel(date: string) {
  const [dayPart, timePart] = date.split(' ');
  const [year, month, day] = dayPart.split('-');
  return `${day}/${month}/${year} | ${timePart}`;
}

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ barberId?: string; service?: string }>();
  const { user } = useAuth();

  const [payload, setPayload] = useState<BookingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(serviceOptions[0].id);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const dateOptions = useMemo(() => buildDateOptions(), []);

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }

    let active = true;

    async function loadBookingData() {
      try {
        const data = await api.getBookingData(user.id);

        if (!active) {
          return;
        }

        setPayload(data);

        const initialBarber =
          data.barbers.find((barber) => barber.id === params.barberId) ?? data.barbers[0];
        const initialShopId =
          initialBarber?.barbershopId ?? data.barbershops[0]?.id ?? '';
        const initialService =
          serviceOptions.find((service) => service.title === params.service)?.id ??
          serviceOptions[0].id;
        const initialDate = dateOptions[0]?.value ?? '';
        const initialSlots = buildTimeSlots(initialDate, initialBarber);

        setSelectedShopId(initialShopId);
        setSelectedBarberId(initialBarber?.id ?? '');
        setSelectedServiceId(initialService);
        setSelectedDate(initialDate);
        setSelectedTime(initialSlots[0] ?? '');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Nao foi possivel carregar o agendamento.';
        Alert.alert('Falha ao abrir agenda', message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBookingData();

    return () => {
      active = false;
    };
  }, [dateOptions, params.barberId, params.service, router, user]);

  const filteredBarbers = useMemo(
    () => payload?.barbers.filter((barber) => barber.barbershopId === selectedShopId) ?? [],
    [payload, selectedShopId]
  );

  const selectedBarber = useMemo(
    () => payload?.barbers.find((barber) => barber.id === selectedBarberId),
    [payload, selectedBarberId]
  );

  const selectedShop = useMemo(
    () => payload?.barbershops.find((shop) => shop.id === selectedShopId),
    [payload, selectedShopId]
  );

  const selectedService = useMemo(
    () => serviceOptions.find((service) => service.id === selectedServiceId) ?? serviceOptions[0],
    [selectedServiceId]
  );

  const timeSlots = useMemo(
    () => buildTimeSlots(selectedDate, selectedBarber),
    [selectedBarber, selectedDate]
  );

  const appointments = useMemo(
    () =>
      [...(payload?.appointments ?? [])].sort((first, second) =>
        second.date.localeCompare(first.date)
      ),
    [payload]
  );

  useEffect(() => {
    if (!filteredBarbers.length) {
      setSelectedBarberId('');
      return;
    }

    const currentBelongsToShop = filteredBarbers.some((barber) => barber.id === selectedBarberId);

    if (!currentBelongsToShop) {
      setSelectedBarberId(filteredBarbers[0].id);
    }
  }, [filteredBarbers, selectedBarberId]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    if (!timeSlots.includes(selectedTime)) {
      setSelectedTime(timeSlots[0] ?? '');
    }
  }, [selectedDate, selectedTime, timeSlots]);

  async function handleConfirmBooking() {
    if (!user || !selectedShop || !selectedBarber || !selectedDate || !selectedTime) {
      Alert.alert('Selecao incompleta', 'Escolha unidade, barbeiro, data e horario.');
      return;
    }

    try {
      setSaving(true);

      const appointment = await api.createAppointment({
        userId: user.id,
        barbershopId: selectedShop.id,
        barberId: selectedBarber.id,
        service: selectedService.title,
        date: `${selectedDate} ${selectedTime}`,
      });

      setPayload((current) =>
        current
          ? {
              ...current,
              appointments: [appointment, ...current.appointments],
            }
          : current
      );
      Alert.alert(
        'Agendamento confirmado',
        `Seu horario foi reservado para ${formatAppointmentLabel(appointment.date)}.`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel confirmar o agendamento.';
      Alert.alert('Falha ao agendar', message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={palette.white} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={18} color={palette.white} />
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/profile')} style={styles.headerAvatar}>
            <Image source={appAssets.profileIcon} contentFit="cover" style={styles.avatarImage} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>Agenda BarberAxis</Text>
              <Text style={styles.heroTitle}>Monte seu agendamento em poucos toques</Text>
            </View>
            <Image source={appAssets.logo} contentFit="contain" style={styles.heroLogo} />
          </View>

          <View style={styles.summaryStrip}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{payload?.barbershops.length ?? 0}</Text>
              <Text style={styles.summaryLabel}>Unidades</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{payload?.barbers.length ?? 0}</Text>
              <Text style={styles.summaryLabel}>Barbeiros</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{appointments.length}</Text>
              <Text style={styles.summaryLabel}>Reservas</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Escolha a unidade</Text>
          <View style={styles.choicesGrid}>
            {payload?.barbershops.map((shop) => {
              const active = shop.id === selectedShopId;

              return (
                <Pressable
                  key={shop.id}
                  onPress={() => setSelectedShopId(shop.id)}
                  style={[styles.choiceCard, active && styles.choiceCardActive]}>
                  <Text style={[styles.choiceTitle, active && styles.choiceTitleActive]}>
                    {shop.name}
                  </Text>
                  <Text style={styles.choiceSubtitle}>
                    {shop.neighborhood} - {shop.city}
                  </Text>
                  <Text style={styles.choiceMeta}>{shop.rating.toFixed(1)} de avaliacao</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Selecione o barbeiro</Text>
          <View style={styles.choicesGrid}>
            {filteredBarbers.map((barber) => {
              const active = barber.id === selectedBarberId;

              return (
                <Pressable
                  key={barber.id}
                  onPress={() => setSelectedBarberId(barber.id)}
                  style={[styles.choiceCard, active && styles.choiceCardActive]}>
                  <View style={styles.choiceRow}>
                    <Image
                      source={appAssets.profileIcon}
                      contentFit="cover"
                      style={styles.choiceAvatar}
                    />
                    <View style={styles.choiceContent}>
                      <Text style={[styles.choiceTitle, active && styles.choiceTitleActive]}>
                        {barber.name}
                      </Text>
                      <Text style={styles.choiceSubtitle}>{barber.specialty}</Text>
                    </View>
                  </View>
                  <Text style={styles.choiceMeta}>
                    {barber.availableToday ? 'Disponivel hoje' : 'Vagas a partir de amanha'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Servico</Text>
          <View style={styles.serviceColumn}>
            {serviceOptions.map((service) => {
              const active = service.id === selectedServiceId;

              return (
                <Pressable
                  key={service.id}
                  onPress={() => setSelectedServiceId(service.id)}
                  style={[styles.serviceRow, active && styles.serviceRowActive]}>
                  <View>
                    <Text style={[styles.serviceTitle, active && styles.choiceTitleActive]}>
                      {service.title}
                    </Text>
                    <Text style={styles.serviceMeta}>{service.duration}</Text>
                  </View>
                  <Text style={styles.servicePrice}>{service.priceLabel}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Data e horario</Text>
          <View style={styles.dateRow}>
            {dateOptions.map((option) => {
              const active = option.value === selectedDate;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSelectedDate(option.value)}
                  style={[styles.dateChip, active && styles.dateChipActive]}>
                  <Text style={[styles.dateChipLabel, active && styles.dateChipLabelActive]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.dateChipValue, active && styles.dateChipLabelActive]}>
                    {option.fullLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.timeRow}>
            {timeSlots.map((slot) => {
              const active = slot === selectedTime;

              return (
                <Pressable
                  key={slot}
                  onPress={() => setSelectedTime(slot)}
                  style={[styles.timeChip, active && styles.timeChipActive]}>
                  <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>
                    {slot}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.confirmCard}>
          <Text style={styles.sectionTitle}>Resumo da reserva</Text>

          <View style={styles.summaryList}>
            <Text style={styles.summaryLine}>Unidade: {selectedShop?.name ?? '--'}</Text>
            <Text style={styles.summaryLine}>Barbeiro: {selectedBarber?.name ?? '--'}</Text>
            <Text style={styles.summaryLine}>Servico: {selectedService.title}</Text>
            <Text style={styles.summaryLine}>
              Horario: {selectedDate && selectedTime ? formatAppointmentLabel(`${selectedDate} ${selectedTime}`) : '--'}
            </Text>
          </View>

          <Pressable
            onPress={handleConfirmBooking}
            disabled={saving}
            style={({ pressed }) => [
              styles.confirmButton,
              (pressed || saving) && styles.buttonPressed,
            ]}>
            {saving ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Text style={styles.confirmButtonText}>Confirmar agendamento</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.confirmHeader}>
            <Text style={styles.sectionTitle}>Seus agendamentos</Text>
            <Text style={styles.sectionCaption}>Historico recente</Text>
          </View>

          {appointments.length ? (
            <View style={styles.historyColumn}>
              {appointments.map((appointment: Appointment) => {
                const barber = payload?.barbers.find((item) => item.id === appointment.barberId);
                const shop = payload?.barbershops.find(
                  (item) => item.id === appointment.barbershopId
                );

                return (
                  <View key={appointment.id} style={styles.historyCard}>
                    <View style={styles.historyTopRow}>
                      <Text style={styles.historyService}>{appointment.service}</Text>
                      <Text style={styles.historyTime}>
                        {formatAppointmentLabel(appointment.date)}
                      </Text>
                    </View>
                    <Text style={styles.historyDetail}>
                      {barber?.name ?? 'Barbeiro'} - {shop?.neighborhood ?? 'Unidade'}
                    </Text>
                    {appointment.notes ? (
                      <Text style={styles.historyNotes}>{appointment.notes}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={22} color={palette.textMutedSoft} />
              <Text style={styles.emptyStateTitle}>Nenhum horario reservado ainda</Text>
              <Text style={styles.emptyStateText}>
                Assim que voce confirmar um agendamento, ele aparece aqui.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.blueBlack,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: palette.blueBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 16,
    backgroundColor: '#140b1f',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: palette.border,
  },
  backText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: palette.border,
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.white,
  },
  heroCard: {
    backgroundColor: '#241133',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    gap: 18,
    ...shadowPresets.card,
  },
  heroGlow: {
    position: 'absolute',
    top: -32,
    right: -24,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(79,95,255,0.24)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroEyebrow: {
    color: '#ffc44d',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '900',
    marginTop: 8,
    maxWidth: '85%',
  },
  heroLogo: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  summaryStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  summaryValue: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '900',
  },
  summaryLabel: {
    color: palette.textMutedSoft,
    fontSize: 11,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1b1028',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 14,
    ...shadowPresets.card,
  },
  sectionTitle: {
    color: palette.white,
    fontSize: 19,
    fontWeight: '800',
  },
  sectionCaption: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  choicesGrid: {
    gap: 12,
  },
  choiceCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  choiceCardActive: {
    borderColor: palette.borderStrong,
    backgroundColor: 'rgba(79,95,255,0.14)',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  choiceAvatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: palette.white,
  },
  choiceContent: {
    flex: 1,
  },
  choiceTitle: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  choiceTitleActive: {
    color: palette.white,
  },
  choiceSubtitle: {
    color: palette.textMutedSoft,
    fontSize: 12,
    lineHeight: 18,
  },
  choiceMeta: {
    color: '#ffc44d',
    fontSize: 11,
    fontWeight: '700',
  },
  serviceColumn: {
    gap: 10,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  serviceRowActive: {
    backgroundColor: 'rgba(47,91,255,0.16)',
    borderColor: palette.borderStrong,
  },
  serviceTitle: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  serviceMeta: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  servicePrice: {
    color: '#ffc44d',
    fontSize: 14,
    fontWeight: '800',
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dateChip: {
    minWidth: 82,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dateChipActive: {
    backgroundColor: palette.blueElectric,
    borderColor: palette.blueElectric,
  },
  dateChipLabel: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  dateChipValue: {
    color: palette.textMutedSoft,
    fontSize: 11,
    marginTop: 4,
  },
  dateChipLabelActive: {
    color: palette.white,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    minWidth: 78,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  timeChipActive: {
    backgroundColor: 'rgba(79,95,255,0.18)',
    borderColor: palette.borderStrong,
  },
  timeChipText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  timeChipTextActive: {
    color: palette.white,
  },
  confirmCard: {
    backgroundColor: '#28153a',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 14,
    ...shadowPresets.card,
  },
  confirmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  summaryList: {
    gap: 8,
  },
  summaryLine: {
    color: palette.textMutedSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  confirmButton: {
    marginTop: 4,
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.blueElectric,
    ...shadowPresets.glow,
  },
  confirmButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  historyColumn: {
    gap: 12,
  },
  historyCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyService: {
    flex: 1,
    color: palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
  historyTime: {
    color: '#ffc44d',
    fontSize: 11,
    fontWeight: '700',
  },
  historyDetail: {
    color: palette.textMutedSoft,
    fontSize: 12,
  },
  historyNotes: {
    color: palette.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyStateTitle: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyStateText: {
    color: palette.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
