import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, where, limit, orderBy, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Download,
  Wallet,
  Share2,
  Plus,
  FileText,
  Search,
  X,
  CreditCard,
  Image as ImageIcon,
  Hash,
  MapPin,
  Phone,
  Mail,
  Zap,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, managedClinicId } = useAuth();
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('Todos');
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    newPatients: 0,
    revenue: 0,
    noShows: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  
  const clinicId = managedClinicId || (profile?.clinicRoles ? Object.keys(profile.clinicRoles)[0] : null);

  useEffect(() => {
    if (!clinicId) return;

    // Real-time stats
    const unsubAppointments = onSnapshot(
      collection(db, 'clinics', clinicId, 'appointments'),
      (snapshot) => {
        setStats(prev => ({ ...prev, appointmentsToday: snapshot.size }));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `clinics/${clinicId}/appointments`)
    );

    const unsubPatients = onSnapshot(
      collection(db, 'clinics', clinicId, 'patients'),
      (snapshot) => {
        setStats(prev => ({ ...prev, newPatients: snapshot.size }));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `clinics/${clinicId}/patients`)
    );

    // Recent Appointments
    const q = query(
      collection(db, 'clinics', clinicId, 'appointments'),
      orderBy('startTime', 'desc'),
      limit(5)
    );
    const unsubRecent = onSnapshot(q, (snapshot) => {
      setRecentAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubAppointments();
      unsubPatients();
      unsubRecent();
    };
  }, [clinicId]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-slate-900">Bom dia, {profile?.displayName?.split(' ')[0] || 'Usuário'}</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Bem-vindo ao Clinic Flow – Gestão Completa para Clínicas Multiprofissionais.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <button 
            onClick={() => alert('Central de Relatórios em desenvolvimento...')}
            className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <FileText size={18} /> <span className="md:inline">Relatórios</span>
          </button>
          <button 
            onClick={() => navigate('/app/agenda')}
            className="flex-1 md:flex-none px-6 py-3 bg-accent-600 text-white rounded-2xl text-sm font-bold hover:bg-accent-700 transition-all shadow-lg shadow-accent-200/50 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <Plus size={18} /> <span className="md:inline">Novo Agendamento</span>
          </button>
        </div>
      </header>

      {/* Onboarding Checklist */}
      <OnboardingChecklist clinicId={clinicId} />

      {/* Hoje na Clínica Section */}
      {recentAppointments.length > 0 && (
        <section className="bg-white border border-primary-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 blur-[100px] -z-10" />
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Zap size={20} />
             </div>
             <h2 className="text-xl font-bold font-display tracking-tight text-[#0F172A]">Atendimentos Próximos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {recentAppointments.slice(0, 3).map(appt => (
               <div key={appt.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Clock size={14} className="text-primary-500" /> Próximo Atendimento
                  </p>
                  <div>
                     <p className="text-lg font-bold text-[#0F172A]">{appt.patientName}</p>
                     <p className="text-sm text-slate-500">{appt.type || 'Consulta'} • {appt.time}</p>
                  </div>
                  <button onClick={() => navigate('/app/agenda')} className="text-xs font-bold text-primary-500 hover:underline">Ver Detalhes</button>
               </div>
             ))}
          </div>
        </section>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Calendar} 
          label="Agenda Hoje" 
          value={stats.appointmentsToday} 
          trend="" 
          trendType="up" 
          color="bg-primary-500" 
          onClick={() => navigate('/app/agenda')}
        />
        <StatCard 
          icon={Users} 
          label="Novo Paciente" 
          value={stats.newPatients} 
          trend="" 
          trendType="up" 
          color="bg-emerald-500" 
          onClick={() => setIsPatientModalOpen(true)}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Faturamento Mês" 
          value={`R$ ${stats.revenue.toLocaleString()}`} 
          trend="" 
          trendType="up" 
          color="bg-blue-600" 
          onClick={() => navigate('/app/financeiro')}
        />
        <StatCard 
          icon={AlertCircle} 
          label="No-show" 
          value={stats.noShows} 
          trend="" 
          trendType="down" 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Appointments */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold font-display">Transações Recentes</h3>
                <div className="flex bg-slate-200/50 p-1 rounded-xl">
                  {['Todos', 'Entradas', 'Saídas'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setFilterType(tab)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
             </div>
             <div className="p-12 text-center text-slate-400">
                Nenhuma transação {filterType !== 'Todos' ? `de ${filterType.toLowerCase()}` : ''} encontrada.
             </div>
             <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <button 
                  onClick={() => navigate('/app/financeiro')}
                  className="text-primary-600 font-bold hover:underline flex items-center justify-center gap-2"
                >
                   Ver faturamento completo <ArrowUpRight size={16} />
                </button>
             </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-slate-900 border-l-4 border-primary-600 pl-4">Next Step</h2>
            <button 
              onClick={() => navigate('/app/agenda')}
              className="text-sm font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest"
            >
              Agenda Completa
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {recentAppointments.length > 0 ? recentAppointments.map((app: any) => (
                <AppointmentRow 
                  key={app.id}
                  time={app.time} 
                  patient={app.patientName}
                  service={app.type || 'Consulta'} 
                  status={app.status || 'Confirmado'} 
                />
              )) : (
                <div className="p-10 text-center text-slate-400">Nenhum atendimento agendado para hoje.</div>
              )}
            </div>
          </div>
        </section>

        {/* Reminders / Activity */}
        <section className="space-y-6">
           <div className="bg-primary-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-600 blur-[80px] opacity-20" />
              <h4 className="text-lg font-bold mb-6 font-display uppercase tracking-tight">Módulo Master</h4>
              <div className="space-y-4">
                 <QuickActionButton icon={Download} label="Exportar Relatórios" onClick={() => alert('Exportando todos os relatórios...') } />
                 <QuickActionButton icon={Wallet} label="Conciliação Bancária" onClick={() => alert('Iniciando conciliação automática...')} />
                 <QuickActionButton icon={Share2} label="Gerar Link Pagamento" onClick={() => alert('Link gerado: c-flow.link/pay/demo')} />
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">Base de Pacientes</h4>
                <button 
                  onClick={() => alert('Exportando base completa de pacientes (CSV)...')}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                  title="Exportar Pacientes"
                >
                  <Download size={20} />
                </button>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl text-center border-2 border-dashed border-slate-200 group-hover:border-primary-200 transition-colors">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  Clique em "Novo Paciente" para iniciar sua gestão de prontuários.
                </p>
              </div>
           </div>

          <h2 className="text-xl font-bold font-display text-slate-900 pt-4">Logs do Fluxo</h2>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <ActivityItem 
              icon={Clock} 
              text="Agenda sincronizada com sucesso" 
              time="Agora" 
            />
            <ActivityItem 
              icon={Users} 
              text="Módulo multi-unidade operacional" 
              time="Há pouco" 
            />
          </div>
        </section>
      </div>

      {/* Patient Modal Expanded */}
      <AnimatePresence>
        {isPatientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl w-full bg-white rounded-[3rem] shadow-3xl overflow-hidden overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                 <h2 className="text-2xl font-bold font-display tracking-tight">Novo Cadastro Completo</h2>
                 <button onClick={() => setIsPatientModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                 </button>
              </div>
              
              <div className="p-10 space-y-10">
                 <section className="space-y-6">
                    <h3 className="text-xs font-bold text-primary-600 uppercase tracking-[0.2em] border-b border-primary-100 pb-2">Identificação Civil</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                          <input required type="text" placeholder="Nome Completo do Paciente" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Documento (CPF)</label>
                          <input type="text" placeholder="000.000.000-00" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
                          <input type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h3 className="text-xs font-bold text-primary-600 uppercase tracking-[0.2em] border-b border-primary-100 pb-2">Contato & Endereço</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Telefone/WhatsApp</label>
                          <input type="text" placeholder="(00) 00000-0000" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                          <input type="email" placeholder="email@exemplo.com" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                       </div>
                       <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Endereço Residencial</label>
                          <input type="text" placeholder="Rua, Número, Bairro, Cidade" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h3 className="text-xs font-bold text-primary-600 uppercase tracking-[0.2em] border-b border-primary-100 pb-2">Faturamento & Convênio</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Área de Atendimento</label>
                          <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold">
                             <option>Fisioterapia</option>
                             <option>Psicologia</option>
                             <option>Ortopedia</option>
                             <option>Outros</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Forma de Pagamento</label>
                          <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold">
                             <option>Particular</option>
                             <option>Plano de Saúde (Convênio)</option>
                          </select>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                             <TrendingUp size={14} /> Operadora
                          </label>
                          <input placeholder="Ex: Unimed, Cassi" className="w-full p-3 bg-white border border-slate-100 rounded-xl" />
                       </div>
                       <div className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                             <Hash size={14} /> Nº Carteirinha
                          </label>
                          <input placeholder="000000000" className="w-full p-3 bg-white border border-slate-100 rounded-xl" />
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h3 className="text-xs font-bold text-primary-600 uppercase tracking-[0.2em] border-b border-primary-100 pb-2">Responsável Legal (Opcional)</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Responsável</label>
                          <input type="text" placeholder="Nome completo" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Telefone do Responsável</label>
                          <input type="text" placeholder="(00) 00000-0000" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h3 className="text-xs font-bold text-primary-600 uppercase tracking-[0.2em] border-b border-primary-100 pb-2">Anexos & Mídia</h3>
                    <div className="grid grid-cols-2 gap-6">
                       <button className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-primary-300 hover:text-primary-600 transition-all bg-slate-50/50">
                          <ImageIcon size={32} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Fotos do Paciente</span>
                       </button>
                       <button className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-primary-300 hover:text-primary-600 transition-all bg-slate-50/50">
                          <Plus size={32} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Documentos (PDF/IMG)</span>
                       </button>
                    </div>
                 </section>

                 <div className="pt-10 flex gap-4">
                    <button 
                      onClick={() => setIsPatientModalOpen(false)}
                      className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-bold text-lg shadow-2xl transition-all uppercase tracking-widest active:scale-95"
                    >
                       Salvar Registro
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OnboardingChecklist({ clinicId }: { clinicId: string | null }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([
    { id: 1, key: 'clinicData', text: 'Configurar dados da clínica', done: false },
    { id: 2, key: 'staff', text: 'Cadastrar primeiro profissional', done: false },
    { id: 3, key: 'whatsapp', text: 'Verificar conexão WhatsApp API', done: false },
    { id: 4, key: 'patient', text: 'Cadastrar primeiro paciente', done: false },
  ]);

  useEffect(() => {
    if (!clinicId) return;

    // 1. Check Clinic Data
    const clinicRef = doc(db, 'clinics', clinicId);
    const unsubClinic = onSnapshot(clinicRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const isConfigured = !!(data.name && data.contactEmail);
        updateStatus('clinicData', isConfigured);
        if (data.whatsappEnabled) updateStatus('whatsapp', true);
      }
    });

    // 2. Check Staff
    const unsubStaff = onSnapshot(collection(db, 'clinics', clinicId, 'staff'), (snap) => {
      updateStatus('staff', snap.size > 0);
    });

    // 3. Check Patients
    const unsubPatients = onSnapshot(collection(db, 'clinics', clinicId, 'patients'), (snap) => {
      updateStatus('patient', snap.size > 0);
    });

    return () => {
      unsubClinic();
      unsubStaff();
      unsubPatients();
    };
  }, [clinicId]);

  const updateStatus = (key: string, done: boolean) => {
    setItems(prev => prev.map(item => item.key === key ? { ...item, done } : item));
  };

  const allDone = items.every(i => i.done);
  if (allDone) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] border border-primary-100 shadow-xl shadow-primary-500/5 relative overflow-hidden"
    >
       <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 blur-[100px] -z-0" />
       <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-md text-center md:text-left">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                <Plus size={12} /> Comece Aqui
             </div>
             <h3 className="text-xl font-bold font-display tracking-tight mb-2 text-slate-900">Seu Onboarding Clinic Flow</h3>
             <p className="text-slate-500 text-sm font-medium">Complete os passos abaixo para configurar sua estrutura de atendimento.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-3">
             {items.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => {
                    if (item.key === 'clinicData') navigate('/app/configuracoes');
                    if (item.key === 'staff') navigate('/app/equipe');
                    if (item.key === 'patient') navigate('/app/pacientes');
                    if (item.key === 'whatsapp') navigate('/app/configuracoes');
                  }}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 shadow-sm ${item.done ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-100 text-slate-500 hover:border-primary-200'}`}
                >
                   {item.done ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                   <span className="text-xs font-bold uppercase tracking-widest">{item.text}</span>
                </button>
             ))}
          </div>
       </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, trend, trendType, color, onClick }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:border-primary-200' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl text-white ${color} shadow-lg shadow-current/20`}>
          <Icon size={22} />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
          trendType === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
        }`}>
          {trendType === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend}
        </div>
      </div>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1 font-display tracking-tight">{value}</p>
    </motion.div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }: any) {
   return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group"
    >
       <span className="text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">{label}</span>
       <Icon size={18} className="text-primary-400" />
    </button>
   );
}

function AppointmentRow({ time, patient, service, status }: any) {
  const statusColors: any = {
    'Confirmed': 'text-emerald-600 bg-emerald-50',
    'Pending': 'text-amber-600 bg-amber-50',
    'Checked-In': 'text-blue-600 bg-blue-50',
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group cursor-pointer">
      <div className="text-sm font-bold text-slate-900 w-12">{time}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{patient}</p>
        <p className="text-xs text-slate-500">{service}</p>
      </div>
      <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${statusColors[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, text, time }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-700 leading-snug">{text}</p>
        <p className="text-[10px] text-slate-400 font-medium mt-1">{time}</p>
      </div>
    </div>
  );
}
