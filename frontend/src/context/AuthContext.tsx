import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfileDto } from '../../../shared/types';

interface AuthUser {
  id: string;
  email: string;
  profileCompleted: boolean;
  currentStep: number;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfileDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  requestCode: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfileDto | null>;
  updateStep: (step: number, data: Record<string, any>, file?: File) => Promise<UserProfileDto>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Check initial authentication
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        await fetchProfile();
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async (): Promise<UserProfileDto | null> => {
    try {
      const res = await fetch('/profile');
      if (res.ok) {
        const data: UserProfileDto = await res.json();
        setProfile(data);
        if (!data.profileCompleted) {
          setIsProfileModalOpen(true);
        }
        return data;
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
    return null;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const requestCode = async (email: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/auth/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to request OTP code.');
    }
    return data;
  };

  const verifyCode = async (email: string, code: string): Promise<void> => {
    const res = await fetch('/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Verification failed.');
    }

    setUser(data.user);
    const updatedProfile = await fetchProfile();
    if (updatedProfile && !updatedProfile.profileCompleted) {
      setIsProfileModalOpen(true);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setProfile(null);
      setIsProfileModalOpen(false);
    }
  };

  const updateStep = async (
    step: number,
    data: Record<string, any>,
    file?: File
  ): Promise<UserProfileDto> => {
    let body: any;
    let headers: Record<string, string> = {};

    if (file) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
      formData.append('incomeProof', file);
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    }

    const res = await fetch(`/profile/step/${step}`, {
      method: 'PATCH',
      headers,
      body,
    });

    const resJson = await res.json();
    if (!res.ok) {
      throw new Error(resJson.error || `Failed to save Step ${step}.`);
    }

    const updatedProfile: UserProfileDto = resJson.profile;
    setProfile(updatedProfile);

    if (updatedProfile.profileCompleted) {
      setIsProfileModalOpen(false);
      if (user) {
        setUser({ ...user, profileCompleted: true });
      }
    }

    return updatedProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isLoading,
        isProfileModalOpen,
        setIsProfileModalOpen,
        requestCode,
        verifyCode,
        logout,
        refreshProfile: fetchProfile,
        updateStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
