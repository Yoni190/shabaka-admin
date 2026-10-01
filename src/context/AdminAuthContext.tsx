import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ADMIN_TOKEN_KEY, api } from "../lib/axios";
import type { AdminLoginPayload, AdminUser } from "../types";

export interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AdminLoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AdminAuthContext = createContext<
  AdminAuthContextValue | undefined
>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the admin session on mount.
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        // Change to "/user" if your backend shares a single user endpoint.
        const { data } = await api.get<AdminUser>("/admin/user");

        if (data.role !== "admin") {
          // Token belongs to a non-admin — reject.
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          if (!cancelled) setUser(null);
        } else if (!cancelled) {
          setUser(data);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: AdminLoginPayload) => {
    // Change to "/login" if you share the client login endpoint.
    const { data } = await api.post("/admin/login", credentials);

    const token: string | undefined = data?.token;
    if (!token) {
      throw new Error("Login response did not include a token.");
    }

    const admin: AdminUser | undefined = data?.user;
    if (admin && admin.role !== "admin") {
      throw new Error("This account does not have admin access.");
    }

    localStorage.setItem(ADMIN_TOKEN_KEY, token);

    try {
      if (admin) {
        setUser(admin);
      } else {
        const { data: fetched } = await api.get<AdminUser>("/admin/user");
        if (fetched.role !== "admin") {
          throw new Error("This account does not have admin access.");
        }
        setUser(fetched);
      }
    } catch (error) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Fire-and-forget; token is cleared regardless of the result.
      await api.post("/admin/logout");
    } catch {
      /* ignore */
    } finally {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setUser(null);
    }
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}