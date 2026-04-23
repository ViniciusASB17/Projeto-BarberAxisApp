import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { appAssets } from '@/src/constants/appAssets';
import { palette, shadowPresets } from '@/src/constants/palette';
import { useAuth } from '@/src/context/AuthContext';
import { api } from '@/src/services/barberAxisApi';
import type { Appointment, Barber, Barbershop, HomePayload } from '@/src/types/barberAxis';

const categoryItems = [
  { icon: 'cut-outline', label: 'Cortes' },
  { icon: 'happy-outline', label: 'Barba' },
  { icon: 'color-wand-outline', label: 'Degrade' },
  { icon: 'star-outline', label: 'Infantil' },
] as const;

function formatAppointmentLabel(date: string) {
  const [dayPart, timePart] = date.split(' ');
  const [year, month, day] = dayPart.split('-');
  return `${day}/${month}/${year} | ${timePart}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [payload, setPayload] = useState<HomePayload | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [homeData, bookingData] = await Promise.all([
        api.getHomeData(),
        api.getBookingData(user?.id),
      ]);

      setPayload(homeData);
      setAppointments(bookingData.appointments);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel carregar a home.';
      Alert.alert('Erro ao carregar', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const featuredBarber = useMemo<Barber | undefined>(() => payload?.barbers[0], [payload]);
  const availableShops = useMemo<Barbershop[]>(
    () => payload?.barbershops.slice(0, 2) ?? [],
    [payload]
  );
  const nextAppointment = useMemo<Appointment | undefined>(
    () => [...appointments].sort((first, second) => first.date.localeCompare(second.date))[0],
    [appointments]
  );
  const nextAppointmentBarber = useMemo(
    () => payload?.barbers.find((barber) => barber.id === nextAppointment?.barberId),
    [nextAppointment?.barberId, payload]
  );
  const nextAppointmentShop = useMemo(
    () => payload?.barbershops.find((shop) => shop.id === nextAppointment?.barbershopId),
    [nextAppointment?.barbershopId, payload]
  );

  function getShopBarber(shopId: string) {
    return payload?.barbers.find((barber) => barber.barbershopId === shopId);
  }

  function getShopImage(shopId: string) {
    return shopId === 's1' ? appAssets.shopGustavoCentro : appAssets.shopGustavoUrciano;
  }

  function openBooking(barber?: Barber, service?: string) {
    if (!user || !featuredBarber) {
      return;
    }

    router.push({
      pathname: '/booking',
      params: {
        barberId: (barber ?? featuredBarber).id,
        service: service ?? 'Corte + barba',
      },
    });
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={palette.white}
          />
        }>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <Image source={appAssets.logo} contentFit="contain" style={styles.logoImage} />
            <Text style={styles.brandName}>BarberAxis</Text>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.iconButton}>
              <Ionicons name="notifications" size={16} color={palette.white} />
            </View>
            <Pressable onPress={() => router.push('/profile')} style={styles.avatarButton}>
              <Image
                source={appAssets.profileIcon}
                contentFit="cover"
                style={styles.avatarImage}
              />
              <View style={styles.badgeBubble}>
                <Text style={styles.badgeBubbleText}>2</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <Text style={styles.greeting}>Bom dia, {user?.name?.split(' ')[0]}</Text>

        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Corte + Barba</Text>
            <Text style={styles.promoSubtitle}>com desconto</Text>
            <Text style={styles.promoPrice}>So hoje por R$39,90</Text>

            <Pressable
              onPress={() => openBooking(featuredBarber, 'Corte + barba')}
              style={({ pressed }) => [styles.promoButton, pressed && styles.buttonPressed]}>
              <Text style={styles.promoButtonText}>Agendar agora</Text>
            </Pressable>
          </View>

          <Image
            source={appAssets.promoCharacter}
            contentFit="contain"
            style={styles.promoCharacter}
          />
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Barbearias disponiveis</Text>
          <View style={styles.chipsRow}>
            {categoryItems.map((item) => (
              <View key={item.label} style={styles.filterChip}>
                <Ionicons name={item.icon} size={12} color={palette.white} />
                <Text style={styles.filterChipText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {availableShops.map((shop) => {
          const shopBarber = getShopBarber(shop.id);

          return (
            <View key={shop.id} style={styles.highlightCard}>
              <Image
                source={getShopImage(shop.id)}
                contentFit="cover"
                style={styles.barberAvatar}
              />

              <View style={styles.highlightBody}>
                <Text style={styles.highlightName}>
                  {shop.name} <Text style={styles.highlightScore}>★ {shop.rating.toFixed(1)}</Text>
                </Text>
                <Text style={styles.highlightRole}>{shop.description}</Text>

                <Pressable
                  onPress={() => openBooking(shopBarber, 'Corte social')}
                  style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Ver agenda</Text>
                </Pressable>
              </View>

              <View style={styles.shopStatusWrap}>
                <View style={styles.shopStatusBadge}>
                  <Text style={styles.shopStatusBadgeText}>Aberta</Text>
                </View>
                <Text style={styles.shopStatusHours}>08:00 - 21:00</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seu proximo horario</Text>
          <Text style={styles.sectionAction}>Ver +</Text>
        </View>

        {nextAppointment ? (
          <View style={styles.nextCard}>
            <View style={styles.nextLeft}>
              <Image
                source={
                  nextAppointmentShop ? getShopImage(nextAppointmentShop.id) : appAssets.profileIcon
                }
                contentFit="contain"
                style={styles.nextLogo}
              />
              <View>
                <Text style={styles.nextTitle}>Seu proximo horario</Text>
                <Text style={styles.nextSubtitle}>
                  {nextAppointment
                    ? `${nextAppointmentBarber?.name ?? 'Barbeiro'} | ${formatAppointmentLabel(nextAppointment.date)}`
                    : featuredBarber.name}
                </Text>
                {nextAppointmentShop ? (
                  <Text style={styles.nextDetail}>{nextAppointmentShop.name}</Text>
                ) : null}
              </View>
            </View>

            <Pressable
              onPress={() => openBooking(nextAppointmentBarber, nextAppointment.service)}
              style={styles.remarkButton}>
              <Text style={styles.remarkButtonText}>Ver reserva</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomTabBar}>
        <View style={styles.tabItemActive}>
          <Ionicons name="home-outline" size={18} color={palette.white} />
          <Text style={styles.tabTextActive}>Inicio</Text>
        </View>
        <Pressable
          onPress={() => openBooking(featuredBarber, 'Corte + barba')}
          style={styles.tabItem}>
          <Ionicons name="calendar-outline" size={18} color={palette.textMuted} />
          <Text style={styles.tabText}>Agenda</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/services')} style={styles.tabItem}>
          <Ionicons name="cut-outline" size={18} color={palette.textMuted} />
          <Text style={styles.tabText}>Servicos</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/profile')} style={styles.tabItem}>
          <Ionicons name="person-outline" size={18} color={palette.textMuted} />
          <Text style={styles.tabText}>Perfil</Text>
        </Pressable>
      </View>
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
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 110,
    backgroundColor: '#1a0f25',
    gap: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 24,
    height: 24,
    borderRadius: 7,
  },
  brandName: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    position: 'relative',
    width: 34,
    height: 34,
    justifyContent: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: palette.white,
    backgroundColor: palette.white,
  },
  badgeBubble: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 13,
    height: 13,
    borderRadius: 8,
    paddingHorizontal: 2,
    backgroundColor: '#ff546d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBubbleText: {
    color: palette.white,
    fontSize: 8,
    fontWeight: '800',
  },
  greeting: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  promoCard: {
    position: 'relative',
    minHeight: 188,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#31133d',
    ...shadowPresets.card,
  },
  promoContent: {
    padding: 18,
    maxWidth: '50%',
    zIndex: 2,
  },
  promoTitle: {
    color: palette.white,
    fontSize: 28,
    fontWeight: '900',
  },
  promoSubtitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  promoPrice: {
    color: '#ffc44d',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
  },
  promoButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: '#2f5bff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#1e2eff',
    shadowOpacity: 0.32,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  promoButtonText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  promoCharacter: {
    position: 'absolute',
    right: 6,
    bottom: 0,
    width: 146,
    height: 146,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionTitle: {
    color: palette.white,
    fontSize: 22,
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterChipText: {
    color: palette.textMutedSoft,
    fontSize: 11,
    fontWeight: '700',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a1d46',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
    ...shadowPresets.card,
  },
  barberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  highlightBody: {
    flex: 1,
  },
  highlightName: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  highlightScore: {
    color: '#ffc44d',
    fontSize: 13,
  },
  highlightRole: {
    color: palette.textMutedSoft,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#2f5bff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
  shopStatusWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  shopStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(47,214,162,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(47,214,162,0.3)',
  },
  shopStatusBadgeText: {
    color: '#9df0cf',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  shopStatusHours: {
    color: palette.textMutedSoft,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionAction: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: '#2c1532',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  scheduleAvatar: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
  scheduleStars: {
    color: '#ffc44d',
    fontSize: 11,
    marginTop: 3,
  },
  scheduleRole: {
    color: palette.textMutedSoft,
    fontSize: 11,
    marginTop: 4,
  },
  scheduleMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  scheduleTime: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '700',
  },
  scheduleButton: {
    backgroundColor: '#2f5bff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  scheduleButtonText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
  nextCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#452040',
    borderRadius: 18,
    padding: 14,
  },
  nextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nextLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  nextTitle: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  nextSubtitle: {
    color: palette.textMutedSoft,
    fontSize: 12,
    marginTop: 3,
  },
  nextDetail: {
    color: palette.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  remarkButton: {
    backgroundColor: 'rgba(47,91,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  remarkButtonText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
  bottomTabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#211028',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tabItem: {
    alignItems: 'center',
    gap: 5,
  },
  tabItemActive: {
    alignItems: 'center',
    gap: 5,
  },
  tabText: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
