export interface UserAddress {
  province: string;
  city: string;
  district: string;
  detail: string;
}

export interface User {
  id: string;
  email: string;
  password?: string; // Optional for response, required for DB
  full_name: string;
  address?: UserAddress;
  role: 'admin' | 'customer';
  refresh_tokens?: string[]; // Store active refresh tokens;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  full_name: string;
}
