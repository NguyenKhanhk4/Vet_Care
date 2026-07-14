export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  address?: string;
}

export interface Clinic {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

export interface DoctorProfile {
  _id: string;
  user: User;
  clinic: Clinic;
  specialization?: string;
  experience?: number;
  bio?: string;
  isActive: boolean;
}

export interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  weight?: number;
  color?: string;
  image?: string;
  vaccineStatus?: string;
  owner?: string | User;
}

export interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export interface Appointment {
  _id: string;
  customer: User;
  pet: Pet;
  clinic: Clinic;
  doctor: string | DoctorProfile;
  services: Service[];
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'paid';
  notes?: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
}

export interface MedicalRecord {
  _id: string;
  appointmentId: string | Appointment;
  pet: string | Pet;
  doctor: string | DoctorProfile;
  customer: string | User;
  date: string;
  diagnosis: string;
  symptoms?: string;
  treatment?: string;
  prescription?: string;
  doctorNotes?: string;
  cost: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface ScheduleStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
}

export interface ScheduleDay {
  date: string;
  dayName?: string;
  appointments: Appointment[];
  stats?: ScheduleStats;
}

export interface WeeklySchedule {
  weekStart: string;
  weekEnd: string;
  schedule: ScheduleDay[];
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  WeeklySchedule: undefined;
  AppointmentDetail: { id: string };
  MedicalRecordDoctor: { appointmentId: string; existingRecord?: any };
  MedicalHistoryDoctor: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
};
