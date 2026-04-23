import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { appAssetConfig, appAssets } from '@/src/constants/appAssets';
import { palette } from '@/src/constants/palette';

type LogoPlaceholderProps = {
  compact?: boolean;
};

export function LogoPlaceholder({ compact = false }: LogoPlaceholderProps) {
  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <View style={[styles.logoFrame, compact && styles.logoFrameCompact]}>
        <View style={styles.logoGlow} />
        <View style={[styles.logoBox, compact && styles.logoBoxCompact]}>
          {appAssetConfig.useCustomLogo ? (
            <Image
              source={appAssets.logo}
              contentFit="contain"
              style={[styles.logoImage, compact && styles.logoImageCompact]}
            />
          ) : (
            <Text style={[styles.logoText, compact && styles.logoTextCompact]}>BA</Text>
          )}
        </View>
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.brand, compact && styles.brandCompact]}>BarberAxis</Text>
        <Text style={styles.caption}>
          Plataforma mobile para barbearias conectadas
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  wrapperCompact: {
    gap: 10,
  },
  logoFrame: {
    position: 'relative',
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFrameCompact: {
    width: 58,
    height: 58,
  },
  logoGlow: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 28,
    backgroundColor: palette.accentGlowSolid,
    transform: [{ rotate: '8deg' }],
  },
  logoBox: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: palette.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  logoBoxCompact: {
    width: 52,
    height: 52,
    borderRadius: 18,
  },
  logoText: {
    color: palette.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  logoTextCompact: {
    fontSize: 20,
  },
  logoImage: {
    width: 42,
    height: 42,
  },
  logoImageCompact: {
    width: 28,
    height: 28,
  },
  textBlock: {
    flexShrink: 1,
  },
  brand: {
    color: palette.white,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  brandCompact: {
    fontSize: 22,
  },
  caption: {
    color: palette.textMuted,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
