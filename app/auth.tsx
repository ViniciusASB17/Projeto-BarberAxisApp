import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { LogoPlaceholder } from '@/src/components/LogoPlaceholder';
import { appAssetConfig, appAssets, appAssetPaths } from '@/src/constants/appAssets';
import { palette, shadowPresets } from '@/src/constants/palette';
import { useAuth } from '@/src/context/AuthContext';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('cliente@barberaxis.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const heroSource = mode === 'login' ? appAssets.loginHero : appAssets.registerHero;
  const showCustomHero =
    mode === 'login' ? appAssetConfig.useCustomLoginHero : appAssetConfig.useCustomRegisterHero;
  const heroLabel =
    mode === 'login' ? appAssetPaths.loginHero : appAssetPaths.registerHero;

  async function handleSubmit() {
    if (!email.trim() || !password.trim() || (mode === 'register' && !name.trim())) {
      Alert.alert('Campos obrigatorios', 'Preencha os dados antes de continuar.');
      return;
    }

    try {
      setLoading(true);

      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }

      router.replace('/home');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel concluir a autenticacao.';
      Alert.alert('Atencao', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.backgroundBlobTop} />

          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={18} color={palette.white} />
              <Text style={styles.backText}>Voltar</Text>
            </Pressable>
            <View style={styles.betaBadge}>
              <Text style={styles.betaBadgeText}>Beta</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.artworkFrame}>
              <View style={styles.artworkGlowLeft} />
              <View style={styles.artworkGlowRight} />
              {showCustomHero ? (
                <Image source={heroSource} contentFit="cover" style={styles.artworkImage} />
              ) : (
                <View style={styles.artworkPlaceholder}>
                  <LogoPlaceholder compact />
                  <Text style={styles.artworkPlaceholderTitle}>Espaco da ilustracao</Text>
                  <Text style={styles.artworkPlaceholderText}>{heroLabel}</Text>
                </View>
              )}
            </View>

            <View style={styles.formHeader}>
              <View>
                <Text style={styles.formTitle}>
                  {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                </Text>
                <Text style={styles.formCaption}>
                  {mode === 'login'
                    ? 'Entre para continuar sua experiencia.'
                    : 'Comece agora sem complicacao.'}
                </Text>
              </View>
              <View style={styles.switcher}>
                <Pressable
                  onPress={() => setMode('login')}
                  style={[styles.switchButton, mode === 'login' && styles.switchButtonActive]}>
                  <Text
                    style={[styles.switchText, mode === 'login' && styles.switchTextActive]}>
                    Login
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode('register')}
                  style={[styles.switchButton, mode === 'register' && styles.switchButtonActive]}>
                  <Text
                    style={[styles.switchText, mode === 'register' && styles.switchTextActive]}>
                    Cadastro
                  </Text>
                </Pressable>
              </View>
            </View>

            {mode === 'register' ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Seu nome</Text>
                <View style={styles.inputShell}>
                  <Ionicons name="person-outline" size={18} color={palette.textMuted} />
                  <TextInput
                    placeholder="@seunome"
                    placeholderTextColor={palette.textMuted}
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>
                {mode === 'login' ? 'Usuario ou e-mail' : 'Endereco de e-mail'}
              </Text>
              <View style={styles.inputShell}>
                <Ionicons
                  name={mode === 'login' ? 'person-outline' : 'mail-outline'}
                  size={18}
                  color={palette.textMuted}
                />
                <TextInput
                  placeholder={mode === 'login' ? 'Digite seu usuario' : 'seunome@gmail.com'}
                  placeholderTextColor={palette.textMuted}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType={mode === 'login' ? 'default' : 'email-address'}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <View style={styles.passwordRowHeader}>
                <Text style={styles.fieldLabel}>Senha</Text>
                {mode === 'register' ? <Text style={styles.passwordStrength}>Forte</Text> : null}
              </View>
              <View style={styles.passwordWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={palette.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Digite sua senha"
                  placeholderTextColor={palette.textMuted}
                  style={styles.passwordInput}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  style={styles.passwordToggle}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={palette.white}
                  />
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || loading) && styles.buttonPressed,
              ]}>
              {loading ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === 'login' ? 'Entrar' : 'Cadastrar'}
                </Text>
              )}
            </Pressable>

            <View style={styles.demoCard}>
              <View style={styles.demoDot} />
              <View style={styles.demoContent}>
                <Text style={styles.demoTitle}>
                  {mode === 'login' ? 'Acesso de teste' : 'Cadastro rapido'}
                </Text>
                <Text style={styles.helperText}>
                  {mode === 'login'
                    ? 'Use cliente@barberaxis.com com senha 123456 para testar.'
                    : 'Suas imagens e sua logo ja leem das pastas assets/app/auth e assets/app/branding.'}
                </Text>
              </View>
            </View>

            <View style={styles.orWrapper}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>
                {mode === 'login' ? 'Ou continue com' : 'Ou cadastre com'}
              </Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-google" size={18} color={palette.white} />
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-apple" size={18} color={palette.white} />
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={18} color={palette.white} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: palette.blueBlack,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 10,
    gap: 16,
  },
  backgroundBlobTop: {
    position: 'absolute',
    top: 40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: palette.accentGlowSolid,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.overlaySoft,
    borderWidth: 1,
    borderColor: palette.border,
  },
  backText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '700',
  },
  betaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surfaceGlass,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: palette.border,
  },
  betaBadgeText: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 14,
    ...shadowPresets.card,
  },
  artworkFrame: {
    height: 186,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#18131c',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  artworkGlowLeft: {
    position: 'absolute',
    left: -30,
    bottom: 18,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 117, 95, 0.18)',
  },
  artworkGlowRight: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: palette.accentGlowSolid,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.02 }],
  },
  artworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  artworkPlaceholderTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  artworkPlaceholderText: {
    color: palette.textMuted,
    fontSize: 12,
  },
  formHeader: {
    gap: 12,
  },
  formTitle: {
    color: palette.white,
    fontSize: 26,
    fontWeight: '800',
  },
  formCaption: {
    color: palette.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: palette.overlaySoft,
    borderRadius: 18,
    padding: 5,
    borderWidth: 1,
    borderColor: palette.border,
  },
  switchButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: palette.blueElectric,
    ...shadowPresets.glow,
  },
  switchText: {
    color: palette.textMuted,
    fontSize: 15,
    fontWeight: '700',
  },
  switchTextActive: {
    color: palette.white,
  },
  fieldBlock: {
    gap: 9,
  },
  fieldLabel: {
    color: palette.textMutedSoft,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  passwordRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordStrength: {
    color: '#6ef27a',
    fontSize: 10,
    fontWeight: '700',
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#201a24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: palette.white,
    paddingVertical: 16,
    fontSize: 15,
  },
  inputIcon: {
    marginLeft: 14,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#201a24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    color: palette.white,
    paddingVertical: 16,
    fontSize: 15,
  },
  passwordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  passwordToggleText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: '#2f5bff',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#1e2eff',
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },
  primaryButtonText: {
    color: palette.white,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  demoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.success,
    marginTop: 5,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    color: palette.textMutedSoft,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  helperText: {
    color: palette.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  orWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orText: {
    color: palette.textMuted,
    fontSize: 11,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e263f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
});
