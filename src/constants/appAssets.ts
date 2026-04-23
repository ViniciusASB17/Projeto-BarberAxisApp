export const appAssetConfig = {
  useCustomLogo: true,
  useCustomLoginHero: true,
  useCustomRegisterHero: true,
  useCustomWelcomeHero: true,
} as const;

export const appAssets = {
  logo: require('../../assets/app/branding/logo.png'),
  profileIcon: require('../../assets/app/branding/profile-icon.png'),
  loginHero: require('../../assets/app/auth/login-hero.png'),
  registerHero: require('../../assets/app/auth/register-hero.png'),
  welcomeHero: require('../../assets/app/welcome/welcome-hero.png'),
  promoCharacter: require('../../assets/app/promo-character.png'),
  shopGustavoCentro: require('../../assets/app/shops/gustavo-centro.png'),
  shopGustavoUrciano: require('../../assets/app/shops/gustavo-urciano.png'),
} as const;

export const appAssetPaths = {
  logo: 'assets/app/branding/logo.png',
  profileIcon: 'assets/app/branding/profile-icon.png',
  loginHero: 'assets/app/auth/login-hero.png',
  registerHero: 'assets/app/auth/register-hero.png',
  welcomeHero: 'assets/app/welcome/welcome-hero.png',
  promoCharacter: 'assets/app/promo-character.png',
  shopGustavoCentro: 'assets/app/shops/gustavo-centro.png',
  shopGustavoUrciano: 'assets/app/shops/gustavo-urciano.png',
} as const;
