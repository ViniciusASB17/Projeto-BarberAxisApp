import Constants from 'expo-constants';

import {
  mockAppointments,
  mockBarbers,
  mockBarbershops,
  mockShopProducts,
  mockShopServices,
  mockUsers,
} from '@/src/data/mockBackend';
import type {
  Appointment,
  Barber,
  Barbershop,
  BookingPayload,
  HomePayload,
  ServicesPayload,
  ShopProduct,
  ShopService,
  User,
} from '@/src/types/barberAxis';

function resolveApiBaseUrl() {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri ??
    null;
  const host = debuggerHost?.split(':')[0] ?? 'localhost';

  return `http://${host}:3000`;
}

const API_BASE_URL = resolveApiBaseUrl();
const ENABLE_REMOTE_BACKEND = true;
const REQUEST_TIMEOUT_MS = 1200;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    throw new Error('Erro ao comunicar com o backend.');
  }

  return response.json() as Promise<T>;
}

function delay<T>(value: T, time = 350): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), time);
  });
}

async function loginWithFallback(email: string, password: string) {
  const found = mockUsers.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );

  if (!found) {
    throw new Error('Usuario ou senha invalidos.');
  }

  return delay(found);
}

async function registerWithFallback(name: string, email: string, password: string) {
  const exists = mockUsers.some((user) => user.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    throw new Error('Ja existe um usuario com esse e-mail.');
  }

  const newUser: User = {
    id: `u${Date.now()}`,
    name,
    email,
    password,
  };

  mockUsers.push(newUser);
  return delay(newUser);
}

async function loadHomeWithFallback() {
  const payload: HomePayload = {
    barbershops: mockBarbershops,
    barbers: mockBarbers,
    highlights: {
      totalBarbershops: mockBarbershops.length,
      totalBarbers: mockBarbers.length,
      availableToday: mockBarbers.filter((barber) => barber.availableToday).length,
    },
  };

  return delay(payload);
}

async function createAppointmentWithFallback(
  payload: Omit<Appointment, 'id'>
): Promise<Appointment> {
  const newAppointment: Appointment = {
    id: `a${Date.now()}`,
    ...payload,
  };

  mockAppointments.push(newAppointment);
  return delay(newAppointment);
}

async function loadBookingWithFallback(userId?: string) {
  const appointments = userId
    ? mockAppointments.filter((appointment) => appointment.userId === userId)
    : mockAppointments;

  const payload: BookingPayload = {
    barbershops: mockBarbershops,
    barbers: mockBarbers,
    appointments,
  };

  return delay(payload);
}

async function loadServicesWithFallback() {
  const payload: ServicesPayload = {
    barbershops: mockBarbershops,
    services: mockShopServices,
    products: mockShopProducts,
  };

  return delay(payload);
}

export const api = {
  async login(email: string, password: string) {
    if (!ENABLE_REMOTE_BACKEND) {
      return loginWithFallback(email, password);
    }

    try {
      const users = await request<User[]>(
        `/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      );

      if (!users.length) {
        throw new Error('Usuario ou senha invalidos.');
      }

      return users[0];
    } catch {
      return loginWithFallback(email, password);
    }
  },

  async register(name: string, email: string, password: string) {
    if (!ENABLE_REMOTE_BACKEND) {
      return registerWithFallback(name, email, password);
    }

    try {
      const existingUsers = await request<User[]>(
        `/users?email=${encodeURIComponent(email)}`
      );

      if (existingUsers.length) {
        throw new Error('Ja existe um usuario com esse e-mail.');
      }

      return request<User>('/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    } catch {
      return registerWithFallback(name, email, password);
    }
  },

  async getHomeData() {
    if (!ENABLE_REMOTE_BACKEND) {
      return loadHomeWithFallback();
    }

    try {
      const [barbershops, barbers] = await Promise.all([
        request<Barbershop[]>('/barbershops'),
        request<Barber[]>('/barbers'),
      ]);

      const payload: HomePayload = {
        barbershops,
        barbers,
        highlights: {
          totalBarbershops: barbershops.length,
          totalBarbers: barbers.length,
          availableToday: barbers.filter((barber) => barber.availableToday).length,
        },
      };

      return payload;
    } catch {
      return loadHomeWithFallback();
    }
  },

  async createAppointment(payload: Omit<Appointment, 'id'>) {
    if (!ENABLE_REMOTE_BACKEND) {
      return createAppointmentWithFallback(payload);
    }

    try {
      return request<Appointment>('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return createAppointmentWithFallback(payload);
    }
  },

  async getBookingData(userId?: string) {
    if (!ENABLE_REMOTE_BACKEND) {
      return loadBookingWithFallback(userId);
    }

    try {
      const [barbershops, barbers, appointments] = await Promise.all([
        request<Barbershop[]>('/barbershops'),
        request<Barber[]>('/barbers'),
        userId
          ? request<Appointment[]>(`/appointments?userId=${encodeURIComponent(userId)}`)
          : request<Appointment[]>('/appointments'),
      ]);

      return {
        barbershops,
        barbers,
        appointments,
      } satisfies BookingPayload;
    } catch {
      return loadBookingWithFallback(userId);
    }
  },

  async getServicesData() {
    if (!ENABLE_REMOTE_BACKEND) {
      return loadServicesWithFallback();
    }

    try {
      const [barbershops, services, products] = await Promise.all([
        request<Barbershop[]>('/barbershops'),
        request<ShopService[]>('/services'),
        request<ShopProduct[]>('/products'),
      ]);

      return {
        barbershops,
        services,
        products,
      } satisfies ServicesPayload;
    } catch {
      return loadServicesWithFallback();
    }
  },
};

export const backendConfig = {
  apiBaseUrl: API_BASE_URL,
  enableRemoteBackend: ENABLE_REMOTE_BACKEND,
  requestTimeoutMs: REQUEST_TIMEOUT_MS,
  logoPlaceholderNote:
    'Substitua o componente LogoPlaceholder pela logo oficial quando quiser.',
};
