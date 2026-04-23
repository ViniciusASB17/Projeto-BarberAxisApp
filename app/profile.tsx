import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { appAssets } from '@/src/constants/appAssets';
import { palette, shadowPresets } from '@/src/constants/palette';
import { useAuth } from '@/src/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'Cliente', [user?.name]);

  async function handleSave() {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Campos obrigatorios', 'Preencha nome e e-mail para continuar.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
      });
      setPassword('');
      Alert.alert('Perfil atualizado', 'Seus dados foram salvos com sucesso.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/auth');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color={palette.white} />
            </Pressable>

            <Text style={styles.headerTitle}>Perfil</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <Image source={appAssets.profileIcon} contentFit="cover" style={styles.avatar} />

            <Text style={styles.heroTitle}>{firstName}, este e seu perfil</Text>
            <Text style={styles.heroSubtitle}>
              Atualize seus dados para manter sua conta pronta para os proximos agendamentos.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Informacoes da conta</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={palette.textMuted} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  placeholderTextColor={palette.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={palette.textMuted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seuemail@barberaxis.com"
                  placeholderTextColor={palette.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nova senha</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={palette.textMuted} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Deixe vazio para manter a atual"
                  placeholderTextColor={palette.textMuted}
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || saving) && styles.primaryButtonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>
                {saving ? 'Salvando...' : 'Salvar alteracoes'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="shield-checkmark-outline" size={18} color={palette.white} />
              <Text style={styles.infoTitle}>Conta ativa</Text>
            </View>
            <Text style={styles.infoText}>
              Seus dados ficam prontos para futuras integracoes com o ERP e historico de agenda.
            </Text>
          </View>

          <Pressable onPress={handleSignOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={18} color={palette.white} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.blueBlack,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 18,
    backgroundColor: '#130a1e',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    color: palette.white,
    fontSize: 19,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 38,
  },
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: '#241133',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...shadowPresets.card,
  },
  heroGlow: {
    position: 'absolute',
    top: -26,
    right: -18,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(79,95,255,0.16)',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  heroTitle: {
    marginTop: 16,
    color: palette.white,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: 8,
    color: palette.textMutedSoft,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  formCard: {
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
    fontSize: 18,
    fontWeight: '800',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: palette.textMutedSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    flex: 1,
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 4,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accent,
    ...shadowPresets.glow,
  },
  primaryButtonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: 'rgba(79,95,255,0.14)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(79,95,255,0.24)',
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  infoText: {
    color: palette.textMutedSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
