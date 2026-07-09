/**
 * Shared TypeScript Type Definitions
 * Types used across the entire application
 */

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string | null;
  role: 'customer' | 'admin' | 'doctor';
  createdAt: string;
  updatedAt: string;
}

// Pet Types
export interface Pet {
  _id: string;
  owner: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
  breed: string;
  gender: 'male' | 'female' | 'unknown';
  age: number;
  weight: number;
  color: string;
  vaccineStatus: 'up-to-date' | 'overdue' | 'not-vaccinated' | 'unknown';
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Clinic Types
export interface Clinic {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  description: string;
  images: string[];
  openingHours: string;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
}

// Doctor Types
export interface Doctor {
  _id: string;
  user: User;
  clinic: Clinic;
  specialization: string;
  experience: number;
  bio: string;
  avatar?: string | null;
  rating: number;
  totalReviews: number;
  availableSlots: AvailableSlot[];
  isActive: boolean;
  createdAt: string;
}

export interface AvailableSlot {
  day: string;
  startTime: string;
  endTime: string;
}

// Service Types
export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  clinic: Clinic;
  category: 'checkup' | 'vaccination' | 'surgery' | 'grooming' | 'dental' | 'emergency' | 'laboratory' | 'other';
  image?: string | null;
  isActive: boolean;
  createdAt: string;
}

// Appointment Types
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'paid';

export interface Appointment {
  _id: string;
  customer: string | User;
  pet: Pet;
  clinic: Clinic;
  doctor: Doctor;
  service: Service;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Medical Record Types
export interface MedicalRecord {
  _id: string;
  appointment: Appointment;
  pet: Pet;
  doctor: Doctor;
  customer: string;
  diagnosis: string;
  symptoms: string;
  prescription: string;
  doctorNotes: string;
  cost: number;
  date: string;
  createdAt: string;
}

// Payment Types
export type PaymentMethod = 'vnpay' | 'momo' | 'cash';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  _id: string;
  appointment: Appointment;
  customer: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
}

// Notification Types
export type NotificationType = 'booking' | 'payment' | 'reminder' | 'completion';

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

// Review Types
export interface Review {
  _id: string;
  appointment: Appointment;
  customer: string;
  doctor: Doctor;
  clinic: Clinic;
  rating: number;
  comment: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  unreadCount?: number;
}

// Auth Response
export interface AuthResponse {
  user: User;
  token: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface PetFormData {
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  age?: number;
  weight?: number;
  color?: string;
  vaccineStatus?: string;
}

export interface BookingFormData {
  clinic: string;
  doctor: string;
  service: string;
  pet: string;
  date: string;
  time: string;
  notes?: string;
}
