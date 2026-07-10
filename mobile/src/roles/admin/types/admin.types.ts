export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: 'admin';
  isActive: boolean;
}

export interface AdminAuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: AdminUser;
    token: string;
  };
}
