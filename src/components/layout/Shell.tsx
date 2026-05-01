import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  User,
  FileText,
  FileCheck,
  Wallet, 
  LogOut,
  ChevronRight,
  Plus,
  X,
  Shield,
  ShieldCheck,
  Activity,
  ArrowLeft,
  Settings as SettingsIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Shell() {
  const { profile, loading, user, managedClinicId, setManagedClinicId, isMaster, isGestor, isUsuario, isProfissional, isPaciente, impersonatedRole } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-primary-200 rounded-xl mb-4" />
        <div className="h-4 w-32 bg-slate-200 rounded" />
      </div>
    </div>
  );

  const clinics = profile?.clinicRoles ? Object.keys(profile.clinicRoles) : [];
  const hasClinic = clinics.length > 0;
  const clinicId = managedClinicId || clinics[0];

  useEffect(() => {
    if (isPaciente(clinicId) && window.location.pathname === '/app') {
      navigate('/app/portal');
    }
  }, [clinicId, isPaciente, navigate]);

  if (!hasClinic && profile && !isMaster && !managedClinicId) {
    return <Onboarding />;
  }

  const getSimulatedLabel = (role: string) => {
    const labels: Record<string, string> = {
      gestor: 'Gestor (Sim)',
      usuario: 'Admin (Sim)',
      profissional: 'Saúde (Sim)',
      paciente: 'Paciente (Sim)'
    };
    return labels[role] || role;
  };

  const roleLabel = impersonatedRole 
    ? getSimulatedLabel(impersonatedRole) 
    : isMaster 
      ? 'Master' 
      : isGestor(clinicId) 
        ? 'Gestor' 
        : isUsuario(clinicId) 
          ? 'Admin' 
          : isProfissional(clinicId) 
            ? 'Saúde' 
            : isPaciente(clinicId) 
              ? 'Paciente' 
              : 'Equipe';

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden text-slate-900 relative">
      {/* Simulation Master Controller - Floating Bar */}
      {isMaster && managedClinicId && (
        <div className="fixed top-2 md:top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-1 md:gap-2 bg-[#020617]/90 backdrop-blur-xl border border-white/10 px-2 md:px-4 py-2 rounded-2xl shadow-2xl scale-[0.8] md:scale-100 whitespace-nowrap">
           <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-primary-600/20 rounded-lg border border-primary-500/30">
              <ShieldCheck size={14} className="text-primary-400" />
              <span className="text-[9px] md:text-[10px] font-black uppercase text-primary-400 tracking-widest">Master</span>
           </div>
           
           <div className="h-4 w-px bg-white/10 mx-1" />
           
           {[
             { role: 'gestor', label: 'Gestor', icon: ShieldCheck },
             { role: 'usuario', label: 'Admin', icon: Users },
             { role: 'profissional', label: 'Saúde', icon: Activity },
             { role: 'paciente', label: 'Paciente', icon: User }
           ].map(sim => (
             <button
               key={sim.role}
               onClick={() => setImpersonatedRole(sim.role)}
               className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${impersonatedRole === sim.role ? 'bg-white text-[#020617]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
             >
                <sim.icon size={12} />
                <span className="hidden sm:inline">{sim.label}</span>
             </button>
           ))}

           <div className="h-4 w-px bg-white/10 mx-1" />

           <button 
             onClick={() => {
               setImpersonatedRole(null);
               setManagedClinicId(null);
               navigate('/super-admin');
             }}
             className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
           >
              <X size={12} />
              <span className="hidden sm:inline">Sair</span>
           </button>
        </div>
      )}
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between z-[110]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
            CF
          </div>
          <span className="text-lg font-bold font-display tracking-tight text-[#0F172A]">C-Flow</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
        </button>
      </div>

      {/* Impersonation Banner */}
      {managedClinicId && isMaster && (
        <div className="fixed top-0 left-0 md:left-64 right-0 z-[100] bg-primary-600 text-white px-4 py-2 text-[10px] font-bold flex justify-between items-center shadow-lg uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <Shield size={12} />
            <span className="hidden sm:inline">Simulação Ativa: {roleLabel}</span>
            <span className="sm:hidden">{roleLabel}</span>
          </div>
          <button 
            onClick={() => {
              setManagedClinicId(null);
              setImpersonatedRole(null);
              navigate('/super-admin');
            }}
            className="bg-white/20 hover:bg-white/40 px-3 py-1 rounded-lg transition-colors border border-white/20 text-[9px]"
          >
            Sair
          </button>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className={cn(
        "fixed inset-0 z-[105] bg-white transition-transform md:relative md:translate-x-0 md:flex md:w-64 md:bg-white md:border-r md:border-slate-100 flex flex-col shrink-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 hidden md:block">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20 font-display hover:scale-105 transition-transform">
              CF
            </NavLink>
            <span className="text-xl font-bold font-display tracking-tight text-[#0F172A]">C-Flow</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-10 md:pt-2">
          {/* NIVEL IV (Gestor) */}
          {isGestor(clinicId) && !isPaciente(clinicId) && (
            <NavItem to="/app" icon={LayoutDashboard} label="Dashboard Gestor" end onClick={() => setIsMobileMenuOpen(false)} />
          )}

          {/* NIVEL II (Administrativo) */}
          {isUsuario(clinicId) && !isGestor(clinicId) && !isPaciente(clinicId) && (
            <NavItem to="/app" icon={LayoutDashboard} label="Painel Adm" end onClick={() => setIsMobileMenuOpen(false)} />
          )}

          {/* NIVEL I (Paciente) */}
          {isPaciente(clinicId) && (
            <>
              <NavItem to="/app/portal" icon={User} label="Minha Área" onClick={() => setIsMobileMenuOpen(false)} />
              <NavItem to="/app/pacientes/meus-documentos" icon={FileText} label="Meus Documentos" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="px-2 pt-2">
                <button 
                  onClick={() => {
                    navigate('/app/portal?book=true');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-accent-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-700 transition-all shadow-lg active:scale-95 text-center justify-center"
                >
                  <Plus size={14} /> Marcar Consulta
                </button>
              </div>
            </>
          )}
          
          {/* NIVEL II, III, IV (Agenda Clínica) */}
          {(isGestor(clinicId) || isUsuario(clinicId) || isProfissional(clinicId)) && !isPaciente(clinicId) && (
            <NavItem to="/app/agenda" icon={Calendar} label="Agenda Clínica" onClick={() => setIsMobileMenuOpen(false)} />
          )}

          {/* NIVEL II, III, IV (Pacientes & Prontuários) */}
          {(isGestor(clinicId) || isUsuario(clinicId) || isProfissional(clinicId)) && !isPaciente(clinicId) && (
            <NavItem to="/app/pacientes" icon={Users} label="Base de Pacientes" onClick={() => setIsMobileMenuOpen(false)} />
          )}
          
          {/* NIVEL II, IV - Apenas Administrativo ou Gestor */}
          {(isGestor(clinicId) || isUsuario(clinicId)) && !isProfissional(clinicId) && !isPaciente(clinicId) && (
            <NavItem to="/app/equipe" icon={Shield} label="Time & Acessos" onClick={() => setIsMobileMenuOpen(false)} />
          )}
          
          {/* NIVEL II, IV (Financeiro/Controladoria) */}
          {(isGestor(clinicId) || isUsuario(clinicId)) && !isProfissional(clinicId) && !isPaciente(clinicId) && (
            <NavItem to="/app/financeiro" icon={Wallet} label="Controladoria" onClick={() => setIsMobileMenuOpen(false)} />
          )}

          {/* NIVEL III, IV (Recibo Rápido) */}
          {(isGestor(clinicId) || isProfissional(clinicId)) && !isPaciente(clinicId) && (
            <NavItem 
              to="/receita-saude/dashboard" 
              icon={FileCheck} 
              label="Recibo Rápido" 
              highlight 
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          <div className="pt-6 mt-6 border-t border-slate-100">
            {(isGestor(clinicId) || isUsuario(clinicId)) && !isPaciente(clinicId) && (
              <NavItem to="/app/configuracoes" icon={SettingsIcon} label="Ajustes" onClick={() => setIsMobileMenuOpen(false)} />
            )}
          </div>
          
          {managedClinicId && isMaster && (
            <div className="pt-4 mt-4 border-t border-slate-100">
               <button 
                onClick={() => {
                  setManagedClinicId(null);
                  navigate('/super-admin');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold text-primary-600 hover:bg-primary-50 transition-all group border border-dashed border-primary-200 uppercase tracking-widest"
              >
                <ArrowLeft size={16} />
                <span>Painel Master</span>
              </button>
            </div>
          )}

          {isMaster && !managedClinicId && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <NavItem to="/super-admin" icon={Shield} label="Master Panel" color="text-primary-600" onClick={() => setIsMobileMenuOpen(false)} />
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
             <div className="w-10 h-10 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center shrink-0">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt="" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
               ) : (
                 <span className="text-primary-600 font-bold text-sm">{profile?.displayName?.charAt(0)}</span>
               )}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold truncate text-[#0F172A] uppercase tracking-tight">{profile?.displayName}</p>
               <p className="text-[9px] text-slate-400 truncate uppercase tracking-[0.1em] font-black">{roleLabel}</p>
             </div>
             <button 
                onClick={() => auth.signOut()} 
                className="text-slate-400 hover:text-primary-600 transition-colors p-2"
                disabled={!user}
              >
               <LogOut size={16} />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, end, color, highlight }: any) {
  return (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all group tracking-tight",
        isActive 
          ? "bg-primary-50 text-primary-600" 
          : highlight 
            ? "bg-accent-50 text-accent-700 hover:bg-accent-100 border border-accent-200"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={cn(
            isActive ? "text-primary-600" : (highlight ? "text-accent-600" : (color || "text-slate-300 group-hover:text-slate-400"))
          )} />
          <span className={cn(highlight && !isActive && "font-black uppercase text-[10px] tracking-widest")}>{label}</span>
          {isActive && <div className="ml-auto w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(47,128,237,0.4)]" />}
          {highlight && !isActive && <span className="ml-auto w-1.5 h-1.5 bg-accent-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(30,58,138,0.3)]" />}
        </>
      )}
    </NavLink>
  );
}

function Onboarding() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleCreateClinic = async () => {
    if (!user || !name) return;
    setLoading(true);
    try {
      const clinicId = `clinic-${Math.random().toString(36).substring(7)}`;
      // 1. Create Clinic document
      await setDoc(doc(db, 'clinics', clinicId), {
        name: name,
        contactEmail: user.email,
        createdAt: new Date().toISOString(),
        plan: 'Profissional Autônomo' // Valor padrão comercial
      });

      // 2. Update User profile with role
      await setDoc(doc(db, 'users', user.uid), {
        clinicRoles: {
          [clinicId]: 'admin'
        }
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'clinic-creation');
      alert("Houve um erro ao configurar sua clínica. Verifique o console para detalhes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl text-center border border-slate-100"
      >
        <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center text-primary-600 mx-auto mb-6">
          <Plus size={40} />
        </div>
        <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight mb-4">Bem-vindo ao Clinic Flow</h2>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">Para começar, vamos configurar sua primeira clínica. É rápido e fácil.</p>
        
        <div className="space-y-4 text-left">
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nome da Clínica</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium mt-2" 
                placeholder="Ex: Clínica Equilíbrio" 
              />
           </div>
           <button 
            onClick={handleCreateClinic}
            disabled={loading || !name}
            className="w-full bg-accent-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-accent-950/20 hover:bg-accent-700 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
           >
            {loading ? 'Criando...' : 'Configurar Clínica'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
