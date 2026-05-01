import React, { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, collection, addDoc, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  Settings as SettingsIcon,
  Upload,
  Plus,
  Trash2,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  X,
  ArrowLeft,
  MessageSquare,
  Zap
} from 'lucide-react';

export default function Settings() {
  const { profile, managedClinicId } = useAuth();
  const [activeClinicId, setActiveClinicId] = useState<string | null>(managedClinicId || null);
  const [clinicData, setClinicData] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: 'practitioner', // practitioner ou receptionist
    specialty: ''
  });

  useEffect(() => {
    if (managedClinicId) {
      setActiveClinicId(managedClinicId);
    } else if (profile?.clinicRoles) {
      const ids = Object.keys(profile.clinicRoles);
      if (ids.length > 0 && !activeClinicId) {
        setActiveClinicId(ids[0]);
      }
    }
  }, [profile, activeClinicId, managedClinicId]);

  useEffect(() => {
    if (!activeClinicId) return;

    const unsubClinic = onSnapshot(doc(db, 'clinics', activeClinicId), (doc) => {
      setClinicData(doc.data());
    });

    const unsubStaff = onSnapshot(collection(db, 'clinics', activeClinicId, 'staff'), (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubClinic();
      unsubStaff();
    };
  }, [activeClinicId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulação de upload: Em um app real, aqui usaríamos Firebase Storage
    // Por enquanto, vamos usar FileReader para gerar um preview Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setClinicData({ ...clinicData, logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateClinic = async () => {
    if (!activeClinicId) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'clinics', activeClinicId), {
        name: clinicData.name,
        contactEmail: clinicData.contactEmail,
        logoUrl: clinicData.logoUrl,
        whatsappEnabled: clinicData.whatsappEnabled || false,
        whatsappApiKey: clinicData.whatsappApiKey || '',
        updatedAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clinics/${activeClinicId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClinicId) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'clinics', activeClinicId, 'staff'), {
        ...newStaff,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewStaff({ name: '', email: '', role: 'practitioner', specialty: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `clinics/${activeClinicId}/staff`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !clinicData) return (
    <div className="p-12 text-center animate-pulse text-slate-400 font-display">Carregando painel de configurações...</div>
  );

  if (!activeClinicId && !loading) return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
       <div className="w-20 h-20 bg-slate-100 rounded-3xl mx-auto mb-6 flex items-center justify-center text-slate-400">
         <SettingsIcon size={40} />
       </div>
       <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Nenhuma clínica ativa</h2>
       <p className="text-slate-500 mt-2 max-w-xs mx-auto">Você não está vinculado a uma unidade de saúde no momento para gerenciar configurações.</p>
       <button 
        onClick={() => window.history.back()}
        className="mt-8 text-primary-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2"
       >
         <ArrowLeft size={16} /> Voltar para o fluxo
       </button>
    </div>
  );

  if (!clinicData) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Configurações da Clínica</h1>
          <p className="text-slate-500 mt-1">Personalize sua unidade e gerencie sua equipe.</p>
        </div>
        <button 
          onClick={handleUpdateClinic}
          disabled={loading}
          className="flex items-center gap-2 bg-accent-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-accent-700 transition-all shadow-lg shadow-accent-950/20 disabled:opacity-50"
        >
          {saveSuccess ? <CheckCircle2 size={20} /> : <Save size={20} />}
          {loading ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="col-span-1 space-y-6">
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-100 rounded-3xl mb-6 flex items-center justify-center relative overflow-hidden border border-slate-100">
                {clinicData.logoUrl ? (
                  <img src={clinicData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={40} className="text-slate-300" />
                )}
                <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload size={20} />
                  <span className="text-[10px] font-bold uppercase mt-1">Alterar</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              <h2 className="text-xl font-bold font-display text-slate-900">{clinicData.name}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{clinicData.plan}</p>
           </div>
           
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                <SettingsIcon size={16} />
                Dados Gerais
             </h3>
             <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Logo da Clínica</label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                     <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                        {clinicData.logoUrl ? <img src={clinicData.logoUrl} className="w-full h-full object-contain" /> : <Upload size={14} />}
                     </div>
                     <span className="text-xs text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Fazer upload de imagem...</span>
                     <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                  <input 
                    type="text" 
                    value={clinicData.name}
                    onChange={e => setClinicData({...clinicData, name: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail de Contato</label>
                  <input 
                    type="email" 
                    value={clinicData.contactEmail}
                    onChange={e => setClinicData({...clinicData, contactEmail: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL da Logo (Link direto)</label>
                  <input 
                    type="text" 
                    value={clinicData.logoUrl}
                    onChange={e => setClinicData({...clinicData, logoUrl: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                    placeholder="https://sua-logo.com/imagem.png"
                  />
                </div>
             </div>
           </div>
        </div>

        {/* Staff Section */}
        <div className="col-span-2 space-y-6">
           <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Users size={16} />
                    Equipe & Acessos
                 </h3>
                 <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 text-primary-600 text-xs font-bold uppercase tracking-widest hover:text-primary-700"
                >
                    <Plus size={16} />
                    Adicionar Membro
                 </button>
              </div>
              <div className="divide-y divide-slate-100">
                 {staff.length > 0 ? staff.map((member) => (
                   <div key={member.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                           {member.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">{member.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                               {member.role === 'practitioner' ? 'Profissional de Saúde' : 'Secretaria / Recepção'}
                               {member.specialty && <span className="opacity-50">• {member.specialty}</span>}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${member.role === 'practitioner' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                           {member.role}
                         </span>
                         <button className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                 )) : (
                   <div className="p-12 text-center text-slate-400">Nenhum membro cadastrado. Cadastre o primeiro para iniciar.</div>
                 )}
              </div>
           </div>

           {/* Integrations Section */}
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                 <MessageSquare size={16} className="text-emerald-500" />
                 Integrações & Automação
              </h3>
              
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200/50">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-tight">WhatsApp Business API</h4>
                    <p className="text-xs text-emerald-600 mt-1">Habilite lembretes automáticos e agendamento via bot.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Status da Conexão</p>
                    <p className={`text-[10px] font-bold mt-0.5 ${clinicData.whatsappEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {clinicData.whatsappEnabled ? '● CONECTADO' : '○ DESCONECTADO'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setClinicData({...clinicData, whatsappEnabled: !clinicData.whatsappEnabled})}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${clinicData.whatsappEnabled ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200'}`}
                  >
                    {clinicData.whatsappEnabled ? 'Desconectar' : 'Conectar Agora'}
                  </button>
                </div>

                {clinicData.whatsappEnabled && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Chave da API (Token)</label>
                    <input 
                      type="password" 
                      value={clinicData.whatsappApiKey || ''}
                      onChange={e => setClinicData({...clinicData, whatsappApiKey: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-1 focus:ring-primary-500 font-mono text-sm"
                      placeholder="••••••••••••••••"
                    />
                    <p className="text-[10px] text-slate-400">Disponível no painel do desenvolvedor Meta.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Modal New Staff */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold font-display mb-6">Novo Membro da Equipe</h2>
              <form onSubmit={handleAddStaff} className="space-y-6">
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input 
                      required
                      type="text" 
                      value={newStaff.name}
                      onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cargo / Função</label>
                    <select 
                      value={newStaff.role}
                      onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-1 focus:ring-primary-500 appearance-none"
                    >
                      <option value="practitioner">Profissional (Saúde)</option>
                      <option value="receptionist">Secretaria / Recepção</option>
                    </select>
                  </div>
                  {newStaff.role === 'practitioner' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Especialidade</label>
                      <input 
                        type="text" 
                        value={newStaff.specialty}
                        onChange={e => setNewStaff({...newStaff, specialty: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Ex: Psicologia Infantil"
                      />
                    </div>
                  )}
                </div>
                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full bg-accent-600 text-white py-4 rounded-2xl font-bold hover:bg-accent-700 transition-all shadow-xl shadow-accent-900/20"
                >
                  {loading ? 'Salvando...' : 'Adicionar Membro'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
