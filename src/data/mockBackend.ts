import type {
  Appointment,
  Barber,
  Barbershop,
  ShopProduct,
  ShopService,
  User,
} from '@/src/types/barberAxis';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Cliente BarberAxis',
    email: 'cliente@barberaxis.com',
    password: '123456',
  },
];

export const mockBarbershops: Barbershop[] = [
  {
    id: 's1',
    name: 'Barbearia Gustavo Centro',
    city: 'Sao Paulo',
    neighborhood: 'Centro',
    rating: 4.9,
    description: 'Unidade com agenda intensa, foco em corte, barba e atendimento rapido.',
    barberIds: ['b1', 'b2', 'b3'],
  },
  {
    id: 's2',
    name: 'Barbearia Urciano',
    city: 'Sao Paulo',
    neighborhood: 'Urciano',
    rating: 4.8,
    description: 'Unidade reservada para atendimento objetivo e servicos essenciais.',
    barberIds: ['b4'],
  },
];

export const mockBarbers: Barber[] = [
  {
    id: 'b1',
    name: 'Rafael Cortez',
    specialty: 'Fade tecnico e acabamento navalhado',
    basePrice: 55,
    barbershopId: 's1',
    availableToday: true,
  },
  {
    id: 'b2',
    name: 'Leandro Nunes',
    specialty: 'Barba terapeutica e design classico',
    basePrice: 60,
    barbershopId: 's1',
    availableToday: false,
  },
  {
    id: 'b3',
    name: 'Matheus Silva',
    specialty: 'Corte social, freestyle e sobrancelha',
    basePrice: 50,
    barbershopId: 's1',
    availableToday: true,
  },
  {
    id: 'b4',
    name: 'Eduardo Vieira',
    specialty: 'Pacotes premium e atendimento executivo',
    basePrice: 75,
    barbershopId: 's2',
    availableToday: true,
  },
];

export const mockAppointments: Appointment[] = [];

export const mockShopServices: ShopService[] = [
  {
    id: 'svc1',
    barbershopId: 's1',
    name: 'Corte social',
    description: 'Corte classico com finalizacao alinhada e acabamento preciso.',
    price: 29.9,
    duration: '35 min',
  },
  {
    id: 'svc2',
    barbershopId: 's1',
    name: 'Corte + barba',
    description: 'Combo completo com navalha, toalha quente e finalizacao premium.',
    price: 39.9,
    duration: '50 min',
  },
  {
    id: 'svc3',
    barbershopId: 's1',
    name: 'Pigmentacao de barba',
    description: 'Correcao de falhas e definicao do contorno da barba.',
    price: 24.9,
    duration: '25 min',
  },
  {
    id: 'svc4',
    barbershopId: 's2',
    name: 'Barba premium',
    description: 'Modelagem detalhada com hidratacao e acabamento profissional.',
    price: 24.9,
    duration: '30 min',
  },
  {
    id: 'svc5',
    barbershopId: 's2',
    name: 'Acabamento',
    description: 'Pezinho, laterais e ajuste rapido para manter o visual em dia.',
    price: 19.9,
    duration: '20 min',
  },
  {
    id: 'svc6',
    barbershopId: 's2',
    name: 'Sobrancelha na navalha',
    description: 'Desenho sutil e alinhado para valorizar o rosto.',
    price: 14.9,
    duration: '15 min',
  },
];

export const mockShopProducts: ShopProduct[] = [
  {
    id: 'prd1',
    barbershopId: 's1',
    name: 'Pomada modeladora BarberAxis',
    description: 'Fixacao media com efeito natural para penteados do dia a dia.',
    price: 34.9,
    category: 'Finalizacao',
  },
  {
    id: 'prd2',
    barbershopId: 's1',
    name: 'Oleo para barba premium',
    description: 'Hidratacao leve com fragrancia amadeirada e toque seco.',
    price: 29.9,
    category: 'Barba',
  },
  {
    id: 'prd3',
    barbershopId: 's1',
    name: 'Shampoo antirresiduo',
    description: 'Limpeza profunda para preparar o cabelo antes da finalizacao.',
    price: 27.9,
    category: 'Cabelo',
  },
  {
    id: 'prd4',
    barbershopId: 's2',
    name: 'Balm pos-barba',
    description: 'Alivio imediato da pele com textura leve e refrescante.',
    price: 26.9,
    category: 'Barba',
  },
  {
    id: 'prd5',
    barbershopId: 's2',
    name: 'Pomada matte compacta',
    description: 'Controle rapido com acabamento seco para bolso ou mochila.',
    price: 24.9,
    category: 'Finalizacao',
  },
];

