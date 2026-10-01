export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin";
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export type AdminLoginFieldErrors = Partial<
  Record<keyof AdminLoginPayload, string>
>;