import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  displayName: string;
  email: string;
  clinicRoles: Record<string, string>;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  managedClinicId: string | null;
  setManagedClinicId: (id: string | null) => void;
  impersonatedRole: string | null;
  setImpersonatedRole: (role: string | null) => void;
  isMaster: boolean;
  isGestor: (clinicId: string) => boolean;
  isUsuario: (clinicId: string) => boolean;
  isProfissional: (clinicId: string) => boolean;
  isPaciente: (clinicId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [managedClinicId, setManagedClinicIdState] = useState<string | null>(localStorage.getItem('managedClinicId'));
  const [impersonatedRole, setImpersonatedRoleState] = useState<string | null>(localStorage.getItem('impersonatedRole'));

  const setManagedClinicId = (id: string | null) => {
    if (id) {
      localStorage.setItem('managedClinicId', id);
    } else {
      localStorage.removeItem('managedClinicId');
    }
    setManagedClinicIdState(id);
  };

  const setImpersonatedRole = (role: string | null) => {
    if (role) {
      localStorage.setItem('impersonatedRole', role);
    } else {
      localStorage.removeItem('impersonatedRole');
    }
    setImpersonatedRoleState(role);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setManagedClinicId(null);
        setImpersonatedRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile sync error:", error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  const isMaster = user?.email === 'contatocflow@gmail.com';
  
  const isGestor = React.useCallback((clinicId: string) => {
    if (isMaster && impersonatedRole) {
      return impersonatedRole === 'gestor';
    }
    if (isMaster) return true;
    const role = profile?.clinicRoles?.[clinicId];
    return role === 'gestor' || role === 'admin';
  }, [isMaster, impersonatedRole, profile]);

  const isUsuario = React.useCallback((clinicId: string) => {
    if (isMaster && impersonatedRole) {
      return impersonatedRole === 'usuario' || impersonatedRole === 'gestor';
    }
    if (isMaster) return true;
    const role = profile?.clinicRoles?.[clinicId];
    return ['usuario', 'gestor', 'admin'].includes(role || '');
  }, [isMaster, impersonatedRole, profile]);

  const isProfissional = React.useCallback((clinicId: string) => {
    if (isMaster && impersonatedRole) {
      return impersonatedRole === 'profissional' || impersonatedRole === 'gestor';
    }
    if (isMaster) return true;
    const role = profile?.clinicRoles?.[clinicId];
    return ['profissional', 'practitioner', 'gestor', 'admin'].includes(role || '');
  }, [isMaster, impersonatedRole, profile]);
    
  const isPaciente = React.useCallback((clinicId: string) => {
    if (isMaster) {
      if (impersonatedRole) return impersonatedRole === 'paciente';
      return false;
    }
    const role = profile?.clinicRoles?.[clinicId];
    return role === 'paciente';
  }, [isMaster, impersonatedRole, profile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      managedClinicId, 
      setManagedClinicId, 
      impersonatedRole,
      setImpersonatedRole,
      isMaster,
      isGestor, 
      isUsuario,
      isProfissional,
      isPaciente
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
