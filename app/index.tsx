import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appAssets } from '@/src/constants/appAssets';
import { palette, shadowPresets } from '@/src/constants/palette';
import { useAuth } from '@/src/context/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [router, user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.glowTopLeft} />
          <View style={styles.glowBottomRight} />
          <View style={styles.sparkOne} />
          <View style={styles.sparkTwo} />
          <View style={styles.sparkThree} />

          <Image
            source={appAssets.welcomeHero}
            contentFit="cover"
            style={styles.heroImage}
          />

          <View style={styles.overlayPanel}>
            <Text style={styles.title}>Seja bem-vindo ao BarberAxis!</Text>
            <Text style={styles.subtitle}>
              Descubra uma nova forma de cuidar do seu visual. Agende cortes,
              escolha seu barbeiro e tenha controle total dos seus horarios com
              praticidade e estilo.
            </Text>

            <Pressable
              onPress={() => router.push('/auth')}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>Proximo</Text>
            </Pressable>
          </View>
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
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  card: {
    minHeight: 720,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#180f1f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    ...shadowPresets.floating,
  },
  glowTopLeft: {
    position: 'absolute',
    top: 28,
    left: 18,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(184, 71, 255, 0.35)',
  },
  glowBottomRight: {
    position: 'absolute',
    right: -10,
    bottom: 88,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(140, 69, 255, 0.28)',
  },
  sparkOne: {
    position: 'absolute',
    top: 84,
    right: 34,
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: 'rgba(224, 109, 255, 0.9)',
    transform: [{ rotate: '20deg' }],
  },
  sparkTwo: {
    position: 'absolute',
    top: 356,
    left: 28,
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(205, 91, 255, 0.85)',
    transform: [{ rotate: '18deg' }],
  },
  sparkThree: {
    position: 'absolute',
    bottom: 132,
    right: 44,
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: 'rgba(192, 86, 255, 0.85)',
    transform: [{ rotate: '22deg' }],
  },
  heroImage: {
    width: '100%',
    height: 420,
  },
  overlayPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 40,
    backgroundColor: 'rgba(47, 19, 58, 0.72)',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  title: {
    color: palette.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    alignSelf: 'center',
    minWidth: 238,
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#2f5bff',
    shadowColor: '#1e2eff',
    shadowOpacity: 0.34,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
