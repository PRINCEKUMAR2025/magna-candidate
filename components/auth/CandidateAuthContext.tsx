import React, { createContext, useContext, useEffect, useState } from 'react';
import { candidateMe, candidateLogin, candidateRegister, candidateLogout } from '@/lib/api';
import type { Candidate } from '@/types';

interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthContextValue {
  candidate: Candidate | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(payload: RegisterPayload): Promise<void>;
  logout(): Promise<void>;
}

const CandidateAuthContext = createContext<AuthContextValue>({
  candidate: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function CandidateAuthProvider({ children }: { children: React.ReactNode }) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    candidateMe()
      .then(setCandidate)
      .catch(() => setCandidate(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const c = await candidateLogin(email, password);
    setCandidate(c);
  };

  const register = async (payload: RegisterPayload) => {
    const c = await candidateRegister(payload);
    setCandidate(c);
  };

  const logout = async () => {
    await candidateLogout();
    setCandidate(null);
  };

  return (
    <CandidateAuthContext.Provider value={{ candidate, loading, login, register, logout }}>
      {children}
    </CandidateAuthContext.Provider>
  );
}

export function useCandidateAuth() {
  return useContext(CandidateAuthContext);
}
