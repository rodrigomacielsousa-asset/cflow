import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, query, orderBy, serverTimestamp, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Activity,
  ArrowLeft,
  Plus,
  X,
  ShieldCheck,
  Database,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  FileCheck,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdmin() {
  const { user, setManagedClinicId, setImpersonatedRole, impersonatedRole, managedClinicId } = useAuth();
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'seed' | 'delete_confirm' | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [clinicToDelete, setClinicToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    personType: 'PJ',
    cnpj: '',
    cpf: '',
    contactEmail: '',
    plan: 'Clínica Médio Porte',
    status: 'active',
    hasReceitaSaude: false
  });

  const SUPER_ADMIN_EMAIL = 'contatocflow@gmail.com';

  useEffect(() => {
    if (user?.email !== SUPER_ADMIN_EMAIL) {
      navigate('/');
      return;
    }

    const unsubClinics = onSnapshot(collection(db, 'clinics'), (snapshot) => {
      setClinics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'clinics'));

    return unsubClinics;
  }, [user, navigate]);

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const clinicId = `clinic-${Math.random().toString(36).substring(7)}`;
      await setDoc(doc(db, 'clinics', clinicId), {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setModalType(null);
      setFormData({ 
        name: '', 
        businessName: '',
        personType: 'PJ',
        cnpj: '',
        cpf: '',
        contactEmail: '', 
        plan: 'Clínica Médio Porte', 
        status: 'active', 
        hasReceitaSaude: false 
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'clinics');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'clinics', selectedClinic.id), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setModalType(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clinics/${selectedClinic.id}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!clinicToDelete) return;
    setLoading(true);
    try {
       await deleteDoc(doc(db, 'clinics', clinicToDelete.id));
       alert(`Unidade "${clinicToDelete.name}" excluída com sucesso.`);
       setModalType(null);
       setClinicToDelete(null);
    } catch (err) {
       console.error("Erro ao excluir unidade:", err);
       alert("Não foi possível excluir a unidade. Verifique sua conexão ou permissões.");
       handleFirestoreError(err, OperationType.DELETE, `clinics/${clinicToDelete.id}`);
    } finally {
       setLoading(false);
    }
  };

  const handleDeleteClinic = (id: string, name: string) => {
    setClinicToDelete({ id, name });
    setModalType('delete_confirm');
  };

  const handleSeedTestAccounts = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      const clinicId = 'clinica-focus-master';
      const clinicRef = doc(db, 'clinics', clinicId);
      
      batch.set(clinicRef, {
        name: 'CLINICA FOCUS',
        plan: 'Clínica Médio Porte',
        contactEmail: 'contato@cflow.com.br',
        status: 'active',
        logoUrl: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Roles mapping for testing
      const testUsers = [
        { email: 'gestor@clinicflow.com', role: 'gestor', name: 'Gestor Flow' },
        { email: 'admin@clinicflow.com', role: 'usuario', name: 'Administrativo Flow' },
        { email: 'doutor@clinicflow.com', role: 'profissional', name: 'Dr. Ricardo Flow' },
        { email: 'paciente@clinicflow.com', role: 'paciente', name: 'Maria das Flores' }
      ];

      for (const u of testUsers) {
        const userId = `test-${u.role}`;
        const userRef = doc(db, 'users', userId);
        batch.set(userRef, {
          displayName: u.name,
          email: u.email,
          clinicRoles: {
            [clinicId]: u.role
          },
          updatedAt: serverTimestamp()
        });

        // Add to staff if relevant
        if (u.role !== 'paciente') {
          const staffRef = doc(db, `clinics/${clinicId}/staff`, userId);
          batch.set(staffRef, {
            name: u.name,
            role: u.role,
            email: u.email,
            specialty: u.role === 'profissional' ? 'Geral' : '',
            createdAt: serverTimestamp()
          });
        }
      }

      await batch.commit();
      alert('Contas de teste criadas/atualizadas!\n\nUtilize os emails:\ngestor@clinicflow.com\nadmin@clinicflow.com\ndoutor@clinicflow.com\npaciente@clinicflow.com\n\nSenha para todos: 123');
      setModalType(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed-test');
    } finally {
      setLoading(false);
    }
  };

   const filteredClinics = clinics.filter(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
   );

  if (user?.email !== SUPER_ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/app')}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight uppercase">Master Panel</h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">C-Flow Platform Governance</p>
            </div>
          </div>

          <div className="flex flex-1 max-w-md mx-4 relative group">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
             <input 
              type="text" 
              placeholder="Pesquisar Unidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium placeholder:text-slate-600"
             />
          </div>

          <div className="flex gap-4">
             <button 
              onClick={() => setModalType('seed')}
              className="px-6 py-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold flex items-center gap-2 hover:bg-amber-500 hover:text-white transition-all uppercase text-xs tracking-widest"
             >
                <Database size={18} />
                Seed Demo
             </button>
             <button 
              onClick={() => {
                setModalType('create');
                setFormData({ 
                  name: '', 
                  businessName: '',
                  personType: 'PJ',
                  cnpj: '',
                  cpf: '',
                  contactEmail: '', 
                  plan: 'Clínica Médio Porte', 
                  status: 'active', 
                  hasReceitaSaude: false 
                });
              }}
              className="px-6 py-3 rounded-2xl bg-primary-600 text-white font-bold flex items-center gap-2 hover:bg-primary-700 transition-all shadow-2xl shadow-slate-950 uppercase text-xs tracking-widest"
             >
                <Plus size={18} />
                Nova Unidade
             </button>
          </div>
        </header>

        {/* Global Overview - Tiny Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
           <StatCard icon={Building2} label="Unidades" value={clinics.length.toString()} color="text-blue-400" size="tiny" />
           <StatCard icon={Users} label="Sessões" value={(clinics.reduce((acc, c) => acc + (c.appointmentsCount || 0), 0) + (clinics.length * 14)).toString()} color="text-indigo-400" size="tiny" />
           <StatCard icon={DollarSign} label="MRR" value={`R$ ${(clinics.length * 497).toLocaleString()}`} color="text-emerald-400" size="tiny" />
           <StatCard icon={FileCheck} label="Fiscal" value={clinics.filter(c => c.hasReceitaSaude).length.toString()} color="text-fiscal-400" size="tiny" />
           <StatCard icon={Activity} label="SLA" value="99.9%" color="text-amber-400" size="tiny" />
        </div>

        {/* Rapid Impersonation - Compact List View */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-wrap items-center gap-4">
           <div className="flex items-center gap-2 mr-2">
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Simulação Rápida:</span>
             <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
           </div>
           
           {[
             { role: 'gestor', label: 'Gestor (Nivel IV)', icon: ShieldCheck },
             { role: 'usuario', label: 'Admin (Nivel II)', icon: Users },
             { role: 'profissional', label: 'Saúde (Nivel III)', icon: Activity },
             { role: 'paciente', label: 'Paciente (Nivel I)', icon: User }
           ].map(sim => (
             <button
               key={sim.role}
               onClick={() => {
                 setImpersonatedRole(sim.role);
                 setManagedClinicId(clinics[0]?.id || 'demo');
                 navigate('/app');
               }}
               className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-primary-600/20 border border-white/10 hover:border-primary-500/50 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all active:scale-95 group"
             >
               <sim.icon size={12} className="group-hover:text-primary-400" />
               {sim.label}
             </button>
           ))}

            {/* Exit impersonation if active */}
            {(impersonatedRole || managedClinicId) && (
              <button
                onClick={() => {
                  setImpersonatedRole(null);
                  setManagedClinicId(null);
                }}
                className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-[10px] font-bold text-rose-400 transition-all uppercase tracking-widest"
              >
                <X size={12} />
                Sair da Simulação
              </button>
            )}
        </div>

        {/* Main Base - Total Focus */}
        <div className="bg-[#0F172A] border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden flex-1">
           <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-xs font-bold tracking-widest uppercase flex items-center gap-3">
                 <ShieldCheck size={16} className="text-primary-500" />
                 Base Operacional C-Flow
              </h2>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-white/5 text-slate-500 text-[9px] uppercase font-bold tracking-[0.2em]">
                       <th className="p-5 pl-8 underline decoration-slate-800 underline-offset-8">Unidade Parceira</th>
                       <th className="p-5">Plano</th>
                       <th className="p-5 text-center">RS</th>
                       <th className="p-5">Status</th>
                       <th className="p-5 text-right pr-8">Operações</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredClinics.map(clinic => (
                      <tr key={clinic.id} className="hover:bg-white/5 transition-all group">
                         <td className="p-5 pl-8">
                            <div className="font-bold text-base font-display group-hover:text-primary-400 transition-colors">{clinic.name}</div>
                            <div className="text-[9px] text-slate-600 font-mono opacity-60 tracking-wider uppercase">ID: {clinic.id}</div>
                         </td>
                         <td className="p-5">
                            <span className="px-3 py-1 bg-primary-900/40 rounded-lg border border-primary-500/30 text-[9px] font-bold uppercase tracking-[0.1em] text-primary-200">
                               {clinic.plan.replace('Clínica ', '')}
                            </span>
                         </td>
                         <td className="p-5">
                              <div className={`mx-auto flex items-center justify-center w-6 h-6 rounded-full ${clinic.hasReceitaSaude ? 'bg-fiscal-500/20 text-fiscal-500' : 'bg-white/5 text-slate-700'}`}>
                                 <FileCheck size={12} />
                              </div>
                         </td>
                         <td className="p-5">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${clinic.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-red-400'}`} />
                               <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{clinic.status === 'active' ? 'ON' : 'OFF'}</span>
                            </div>
                         </td>
                         <td className="p-5 text-right pr-8">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                onClick={() => {
                                  setSelectedClinic(clinic);
                                  setFormData({
                                    name: clinic.name,
                                    businessName: clinic.businessName || '',
                                    personType: clinic.personType || 'PJ',
                                    cnpj: clinic.cnpj || '',
                                    cpf: clinic.cpf || '',
                                    contactEmail: clinic.contactEmail || '',
                                    plan: clinic.plan || 'Clínica Médio Porte',
                                    status: clinic.status || 'active',
                                    hasReceitaSaude: clinic.hasReceitaSaude || false
                                  });
                                  setModalType('edit');
                                }}
                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shadow-lg"
                                title="Configurar"
                               >
                                  <Edit2 size={14} />
                               </button>
                               <button 
                                onClick={() => handleDeleteClinic(clinic.id, clinic.name)}
                                className="p-2.5 bg-white/5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all shadow-lg"
                                title="Remover"
                               >
                                  <Trash2 size={14} />
                               </button>
                               <button 
                                onClick={() => {
                                  setManagedClinicId(clinic.id);
                                  navigate('/app');
                                }}
                                className="ml-2 py-2 px-4 bg-primary-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-950/20"
                               >
                                  Acessar
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full bg-[#0F172A] border border-white/10 rounded-[3rem] p-10 shadow-3xl relative"
            >
              <button 
                onClick={() => setModalType(null)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              {modalType === 'seed' ? (
                <div className="text-center space-y-8">
                   <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20">
                      <Database size={32} />
                   </div>
                   <div>
                      <h2 className="text-3xl font-bold font-display tracking-tight mb-2">Simulador de Acessos</h2>
                      <p className="text-slate-400 leading-relaxed">Esta ação criará as 4 contas de teste (Gestor, Admin, Doutor, Usuário) e uma clínica base para você testar as diferentes permissões do sistema.</p>
                   </div>
                   <button 
                    onClick={handleSeedTestAccounts}
                    disabled={loading}
                    className="w-full py-5 rounded-2xl bg-amber-600 text-white font-bold text-lg shadow-2xl shadow-amber-900/40 hover:bg-amber-700 transition-all uppercase tracking-widest"
                   >
                    {loading ? 'Processando...' : 'Confirmar Geração'}
                   </button>
                </div>
              ) : modalType === 'delete_confirm' ? (
                <div className="text-center space-y-8">
                   <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
                      <Trash2 size={32} />
                   </div>
                   <div>
                      <h2 className="text-3xl font-bold font-display tracking-tight mb-2">Confirmar Exclusão</h2>
                      <p className="text-slate-400 leading-relaxed">
                        Você está prestes a excluir a unidade <span className="text-white font-bold">"{clinicToDelete?.name}"</span>. 
                        Esta ação é irreversível e removerá todos os dados base da configuração da clínica.
                      </p>
                   </div>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => setModalType(null)}
                        className="flex-1 py-5 rounded-2xl bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition-all uppercase tracking-widest"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={confirmDelete}
                        disabled={loading}
                        className="flex-1 py-5 rounded-2xl bg-red-600 text-white font-bold shadow-2xl shadow-red-900/40 hover:bg-red-700 transition-all uppercase tracking-widest"
                      >
                        {loading ? 'Excluindo...' : 'Excluir Agora'}
                      </button>
                   </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold font-display tracking-tight mb-8">
                     {modalType === 'create' ? 'Novo Cadastro Mestre' : 'Editor de Contrato'}
                  </h2>
                  <form onSubmit={modalType === 'create' ? handleCreateClinic : handleUpdateClinic} className="space-y-6">
                    <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo de Cadastro</label>
                            <div className="flex gap-4">
                               {['PJ', 'PF'].map(type => (
                                 <button
                                   key={type}
                                   type="button"
                                   onClick={() => setFormData({...formData, personType: type})}
                                   className={`flex-1 py-4 rounded-2xl font-bold transition-all border ${formData.personType === type ? 'bg-primary-600 border-primary-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}
                                 >
                                   {type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                                 </button>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{formData.personType === 'PJ' ? 'Razão Social' : 'Nome do Profissional'}</label>
                            <input 
                              required
                              type="text" 
                              value={formData.businessName || ''}
                              onChange={e => setFormData({...formData, businessName: e.target.value})}
                              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" 
                              placeholder={formData.personType === 'PJ' ? 'Empresa Ltda' : 'Dr. Nome Completo'}
                            />
                         </div>
                         <div className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Fantasia (Exibição)</label>
                             <input 
                               required
                               type="text" 
                               value={formData.name}
                               onChange={e => setFormData({...formData, name: e.target.value})}
                               className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" 
                               placeholder="Clínica Exemplo"
                             />
                          </div>
                          {formData.personType === 'PJ' ? (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">CNPJ</label>
                              <input 
                                required
                                type="text" 
                                value={formData.cnpj || ''}
                                onChange={e => setFormData({...formData, cnpj: e.target.value})}
                                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" 
                                placeholder="00.000.000/0001-00"
                              />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">CPF</label>
                              <input 
                                required
                                type="text" 
                                value={formData.cpf || ''}
                                onChange={e => setFormData({...formData, cpf: e.target.value})}
                                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" 
                                placeholder="000.000.000-00"
                              />
                            </div>
                          )}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Inscrição Estadual / Registro</label>
                            <input 
                              type="text" 
                              value={formData.stateTaxId || ''}
                              onChange={e => setFormData({...formData, stateTaxId: e.target.value})}
                              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" 
                              placeholder="Isento ou CRM/CRP"
                            />
                         </div>
                         <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Endereço Completo</label>
                            <input 
                              required
                              type="text" 
                              value={formData.address || ''}
                              onChange={e => setFormData({...formData, address: e.target.value})}
                              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" 
                              placeholder="Av. Exemplo, 123 - Centro"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail de Contrato</label>
                            <input 
                              required
                              type="email" 
                              value={formData.contactEmail}
                              onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" 
                              placeholder="gestao@parceiro.com"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone/WhatsApp</label>
                            <input 
                              required
                              type="text" 
                              value={formData.phone || ''}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" 
                              placeholder="(xx) 99999-9999"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Plano Comercial</label>
                            <select 
                              value={formData.plan}
                              onChange={e => setFormData({...formData, plan: e.target.value})}
                              className="w-full p-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-bold"
                            >
                              <option>Profissional Autônomo</option>
                              <option>Clínica Médio Porte</option>
                              <option>Clínica Enterprise</option>
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Status Global</label>
                            <select 
                              value={formData.status}
                              onChange={e => setFormData({...formData, status: e.target.value})}
                              className="w-full p-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-bold"
                            >
                              <option value="active">Operational (Ativo)</option>
                              <option value="suspended">Suspension (Inativo)</option>
                              <option value="pending">Review (Pendente)</option>
                            </select>
                         </div>

                         <div className="md:col-span-2 p-6 bg-white/[0.02] rounded-3xl border border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-fiscal-500/10 text-fiscal-400 rounded-xl flex items-center justify-center">
                               <FileCheck size={20} />
                             </div>
                             <div>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Módulo Receita Saúde</p>
                               <p className="text-[10px] text-slate-600">Libera emissão de documentos com estética premium</p>
                             </div>
                           </div>
                           <button 
                             type="button"
                             onClick={() => setFormData({...formData, hasReceitaSaude: !formData.hasReceitaSaude})}
                             className={`w-12 h-6 rounded-full transition-all relative ${formData.hasReceitaSaude ? 'bg-fiscal-500' : 'bg-white/10'}`}
                           >
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.hasReceitaSaude ? 'left-7' : 'left-1'}`} />
                           </button>
                         </div>
                      </div>
                    </div>
                    <div className="pt-6 flex gap-4">
                       <button 
                        type="button"
                        onClick={() => setModalType(null)}
                        className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                       >
                          Fechar
                       </button>
                       <button 
                        disabled={loading}
                        type="submit" 
                        className="flex-[2] py-5 bg-white text-slate-900 rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-100 transition-all shadow-2xl shadow-white/10"
                       >
                          {loading ? 'Sincronizando...' : 'Confirmar Dados'}
                       </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, size = 'normal' }: any) {
  if (size === 'tiny') {
    return (
      <div className="bg-[#0F172A] border border-white/5 p-4 rounded-2xl flex items-center gap-3 group hover:border-primary-500/30 transition-all">
        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
           <Icon size={16} />
        </div>
        <div className="text-left">
           <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none">{label}</p>
           <p className="text-sm font-bold text-white mt-1 leading-none">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-primary-500/30 transition-colors text-center md:text-left">
       <div className={`p-4 rounded-2xl bg-white/5 inline-block mb-6 shadow-inner ${color}`}>
          <Icon size={28} />
       </div>
       <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{label}</p>
       <p className="text-4xl font-bold font-display tracking-tight mt-1">{value}</p>
    </div>
  );
}

function ImpersonateCard({ role, title, desc, icon: Icon, onClick }: any) {
  return (
    <button 
      onClick={() => onClick(role)}
      className="bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-primary-500/30 hover:bg-primary-500/5 transition-all text-left flex flex-col items-start gap-4 active:scale-95"
    >
       <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
          <Icon size={32} />
       </div>
       <div>
          <h3 className="font-bold text-xl text-white group-hover:text-primary-400 transition-colors font-display">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">{desc}</p>
       </div>
       <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Acessar Agora <ArrowRight size={12} />
       </div>
    </button>
  );
}
