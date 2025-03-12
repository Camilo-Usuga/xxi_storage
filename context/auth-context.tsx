"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, databases, getCurrentUser, ID } from "@/lib/appwrite-config";
import type { Models } from "appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  checkAuthStatus: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
      return !!currentUser;
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      await checkAuthStatus();
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const id = ID.unique();
      await account.create(id, email, password, name);
      await login(email, password);
      const registerAccount = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_USERS!,
        id,
        {
          email: email,
          name: name,
          password: password,
        }
      );
      console.log(registerAccount);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []); //This was the line that needed to be updated.  The empty array [] was causing the issue.

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        checkAuthStatus,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
