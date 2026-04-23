import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { appAssets } from '@/src/constants/appAssets';
import { palette, shadowPresets } from '@/src/constants/palette';
import { api } from '@/src/services/barberAxisApi';
import type {
  Barbershop,
  ServicesPayload,
  ShopProduct,
  ShopService,
} from '@/src/types/barberAxis';

function formatPrice(price: number) {
  return `R$${price.toFixed(2).replace('.', ',')}`;
}

export default function ServicesScreen() {
  const router = useRouter();
  const [payload, setPayload] = useState<ServicesPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedShopId, setSelectedShopId] = useState('');

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        const data = await api.getServicesData();

        if (!active) {
          return;
        }

        setPayload(data);
        setSelectedShopId(data.barbershops[0]?.id ?? '');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  const selectedShop = useMemo<Barbershop | undefined>(
    () => payload?.barbershops.find((shop) => shop.id === selectedShopId),
    [payload, selectedShopId]
  );

  const shopServices = useMemo<ShopService[]>(
    () => payload?.services.filter((service) => service.barbershopId === selectedShopId) ?? [],
    [payload, selectedShopId]
  );

  const shopProducts = useMemo<ShopProduct[]>(
    () => payload?.products.filter((product) => product.barbershopId === selectedShopId) ?? [],
    [payload, selectedShopId]
  );

  function getShopImage(shopId: string) {
    return shopId === 's1' ? appAssets.shopGustavoCentro : appAssets.shopGustavoUrciano;
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={18} color={palette.white} />
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/profile')} style={styles.avatarButton}>
            <Image source={appAssets.profileIcon} contentFit="cover" style={styles.avatarImage} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroEyebrow}>Catalogo BarberAxis</Text>
              <Text style={styles.heroTitle}>Servicos e produtos das barbearias</Text>
            </View>
            <Image source={appAssets.logo} contentFit="contain" style={styles.heroLogo} />
          </View>

          <Text style={styles.heroText}>
            Consulte tudo o que cada unidade oferece antes de escolher sua reserva.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Escolha a barbearia</Text>
          <View style={styles.shopColumn}>
            {payload?.barbershops.map((shop) => {
              const active = shop.id === selectedShopId;

              return (
                <Pressable
                  key={shop.id}
                  onPress={() => setSelectedShopId(shop.id)}
                  style={[styles.shopCard, active && styles.shopCardActive]}>
                  <Image
                    source={getShopImage(shop.id)}
                    contentFit="cover"
                    style={styles.shopImage}
                  />
                  <View style={styles.shopBody}>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <Text style={styles.shopSubtitle}>
                      {shop.neighborhood} - {shop.city}
                    </Text>
                  </View>
                  <Text style={styles.shopRating}>★ {shop.rating.toFixed(1)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedShop ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Servicos da unidade</Text>
            <Text style={styles.sectionCaption}>{selectedShop.name}</Text>

            <View style={styles.listColumn}>
              {shopServices.map((service) => (
                <View key={service.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{service.name}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(service.price)}</Text>
                  </View>
                  <Text style={styles.itemDescription}>{service.description}</Text>
                  <Text style={styles.itemMeta}>Duracao media: {service.duration}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {selectedShop ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Produtos a venda</Text>
            <Text style={styles.sectionCaption}>Itens de cuidado e finalizacao</Text>

            <View style={styles.listColumn}>
              {shopProducts.map((product) => (
                <View key={product.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.productLabel}>
                      <Text style={styles.productLabelText}>{product.category}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{formatPrice(product.price)}</Text>
                  </View>
                  <Text style={styles.itemTitle}>{product.name}</Text>
                  <Text style={styles.itemDescription}>{product.description}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
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
  avatarButton: {
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
    gap: 14,
    ...shadowPresets.card,
  },
  heroGlow: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(79,95,255,0.24)',
  },
  heroTop: {
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
  heroText: {
    color: palette.textMutedSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  heroLogo: {
    width: 34,
    height: 34,
    borderRadius: 10,
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
  shopColumn: {
    gap: 12,
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  shopCardActive: {
    backgroundColor: 'rgba(79,95,255,0.14)',
    borderColor: palette.borderStrong,
  },
  shopImage: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: palette.white,
  },
  shopBody: {
    flex: 1,
  },
  shopName: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  shopSubtitle: {
    color: palette.textMutedSoft,
    fontSize: 12,
    marginTop: 4,
  },
  shopRating: {
    color: '#ffc44d',
    fontSize: 12,
    fontWeight: '800',
  },
  listColumn: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  itemTitle: {
    flex: 1,
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  itemPrice: {
    color: '#ffc44d',
    fontSize: 14,
    fontWeight: '800',
  },
  itemDescription: {
    color: palette.textMutedSoft,
    fontSize: 12,
    lineHeight: 18,
  },
  itemMeta: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  productLabel: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(47,91,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  productLabelText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
