export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Barbershop = {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  rating: number;
  description: string;
  barberIds: string[];
};

export type Barber = {
  id: string;
  name: string;
  specialty: string;
  basePrice: number;
  barbershopId: string;
  availableToday: boolean;
};

export type Appointment = {
  id: string;
  userId: string;
  barbershopId: string;
  barberId: string;
  service: string;
  date: string;
  notes?: string;
};

export type HomePayload = {
  barbershops: Barbershop[];
  barbers: Barber[];
  highlights: {
    totalBarbershops: number;
    totalBarbers: number;
    availableToday: number;
  };
};

export type BookingPayload = {
  barbershops: Barbershop[];
  barbers: Barber[];
  appointments: Appointment[];
};

export type ShopService = {
  id: string;
  barbershopId: string;
  name: string;
  description: string;
  price: number;
  duration: string;
};

export type ShopProduct = {
  id: string;
  barbershopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

export type ServicesPayload = {
  barbershops: Barbershop[];
  services: ShopService[];
  products: ShopProduct[];
};

export type ServiceOption = {
  id: string;
  title: string;
  priceLabel: string;
  duration: string;
};
