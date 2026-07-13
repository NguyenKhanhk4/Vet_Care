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

export interface DoctorLoginFormData {
  email: string;
  password: string;
}
