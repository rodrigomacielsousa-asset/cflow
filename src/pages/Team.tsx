import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2,
  Trash2,
  Eye,
  Mail, 
  Phone,
  Shield,
  Stethoscope,
  UserCog,
  X,
  Save,
  MapPin,
  ClipboardList,
  Calendar as CalendarIcon,
  CreditCard,
  Download,
  Upload,
  Camera,
  Coins
} from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot, query, serverTimestamp, addDoc, doc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function Team() {
  const { managedClinicId, profile } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'practitioner',
    specialty: '',
    professionalId: '', // CR (CRM, CRP, etc)
    cpf: '',
    startDate: '',
    address: '',
    observations: '',
    baseSalary: '',
    sessionValue: '',
    photo: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        alert("A imagem é muito grande. Favor selecionar uma imagem menor que 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(p => ({ ...p, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToCSV = () => {
    if (members.length === 0) return;
    
    const headers = ['Nome', 'Email', 'Celular', 'Função', 'Especialidade', 'Registro', 'Início'];
    const rows = members.map(m => [
      m.name,
      m.email,
      m.phone,
      m.role,
      m.specialty,
      m.professionalId,
      m.startDate
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `equipe_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentClinicId = managedClinicId || (profile?.clinicRoles ? Object.keys(profile.clinicRoles)[0] : null);

  useEffect(() => {
    if (!currentClinicId) return;

    const path = `clinics/${currentClinicId}/staff`;
    const q = query(collection(db, path), orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentClinicId]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'practitioner',
      specialty: '',
      professionalId: '',
      cpf: '',
      startDate: '',
      address: '',
      observations: '',
      baseSalary: '',
      sessionValue: '',
      photo: ''
    });
    setSelectedMember(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClinicId) return;
    
    setFormLoading(true);
    const path = `clinics/${currentClinicId}/staff`;
    
    try {
      const dataToSave = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        specialty: formData.specialty,
        professionalId: formData.professionalId,
        cpf: formData.cpf,
        startDate: formData.startDate,
        address: formData.address,
        observations: formData.observations,
        baseSalary: formData.baseSalary,
        sessionValue: formData.sessionValue,
        photo: formData.photo,
        updatedAt: serverTimestamp()
      };

      if (modalType === 'create') {
        await addDoc(collection(db, path), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
      } else if (modalType === 'edit' && selectedMember) {
        await updateDoc(doc(db, path, selectedMember.id), dataToSave);
      }
      setModalType(null);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, modalType === 'create' ? OperationType.CREATE : OperationType.UPDATE, path);
    } finally {
      setFormLoading(false);
    }
  };

  const openEdit = (member: any) => {
    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'practitioner',
      specialty: member.specialty || '',
      professionalId: member.professionalId || '',
      cpf: member.cpf || '',
      startDate: member.startDate || '',
      address: member.address || '',
      observations: member.observations || '',
      baseSalary: member.baseSalary || '',
      sessionValue: member.sessionValue || '',
      photo: member.photo || ''
    });
    setModalType('edit');
  };

  const openView = (member: any) => {
    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'practitioner',
      specialty: member.specialty || '',
      professionalId: member.professionalId || '',
      cpf: member.cpf || '',
      startDate: member.startDate || '',
      address: member.address || '',
      observations: member.observations || '',
      baseSalary: member.baseSalary || '',
      sessionValue: member.sessionValue || '',
      photo: member.photo || ''
    });
    setModalType('view');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!currentClinicId || !confirm(`Tem certeza que deseja remover "${name}" da equipe?`)) return;
    
    try {
      await deleteDoc(doc(db, `clinics/${currentClinicId}/staff`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clinics/${currentClinicId}/staff/${id}`);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.professionalId?.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
               <Shield size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight uppercase">Minha Equipe</h1>
               <p className="text-sm text-slate-500">Gerencie profissionais, secretárias e acessos da unidade.</p>
             </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 uppercase tracking-widest"
          >
            <Download size={18} /> Exportar
          </button>
          <button 
            onClick={() => { resetForm(); setModalType('create'); }}
            className="px-6 py-3 bg-accent-600 text-white rounded-2xl text-sm font-bold hover:bg-accent-700 transition-all shadow-lg shadow-accent-200/50 flex items-center gap-2 uppercase tracking-widest"
          >
            <Plus size={18} /> Adicionar Membro
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome, cargo ou registro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8">Integrante</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cargo / Especialidade</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contato</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registro / Início</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-8">Controle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="p-8 h-20 bg-slate-50/50" />
                </tr>
              ))
            ) : filteredMembers.length > 0 ? filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-5 pl-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm overflow-hidden group-hover:border-primary-200 transition-all">
                       {member.photo ? (
                         <img src={member.photo} className="w-full h-full object-cover transition-all" alt="" />
                       ) : (
                         <Users size={24} className="text-slate-200" />
                       )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight leading-tight">{member.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Role: {member.role === 'practitioner' ? 'Profissional' : member.role === 'admin' ? 'Administrador' : 'Equipe'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                   <div>
                      <p className="text-xs font-bold text-slate-700">{member.specialty || 'Administrativo'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{member.role === 'practitioner' ? 'Saúde' : 'Gestão'}</p>
                   </div>
                </td>
                <td className="p-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                      <Mail size={12} className="text-primary-400" />
                      <span className="truncate max-w-[150px]">{member.email || 'N/I'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                      <Phone size={12} className="text-emerald-400" />
                      <span>{member.phone || 'N/I'}</span>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                   <div>
                      <p className="text-xs font-bold text-slate-900">
                        {member.professionalId ? `REG: ${member.professionalId}` : 'Sem registro'}
                      </p>
                      <p className="text-[10px] font-black text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded inline-block uppercase tracking-widest mt-0.5 whitespace-nowrap">
                        {member.startDate ? `Desde ${new Date(member.startDate).toLocaleDateString('pt-BR')}` : 'Início N/D'}
                      </p>
                   </div>
                </td>
                <td className="p-5 text-right pr-8">
                  <div className="flex justify-end gap-2">
                     <button onClick={() => openView(member)} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm active:scale-90">
                        <Eye size={16} />
                     </button>
                     <button onClick={() => openEdit(member)} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-amber-600 hover:border-amber-100 transition-all shadow-sm active:scale-90">
                        <Edit2 size={16} />
                     </button>
                     <button onClick={() => handleDelete(member.id, member.name)} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-600 hover:border-red-100 transition-all shadow-sm active:scale-90">
                        <Trash2 size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-20 text-center text-slate-400 font-medium">Nenhum integrante encontrado na equipe.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-0 max-w-2xl w-full shadow-2xl relative border border-slate-100 overflow-hidden"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                   <h2 className="text-2xl font-bold font-display tracking-tight uppercase">
                    {modalType === 'create' ? 'Novo Integrante' : modalType === 'edit' ? 'Editar Integrante' : 'Perfil do Integrante'}
                   </h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Dados profissionais e de acesso</p>
                </div>
                <button 
                  onClick={() => setModalType(null)}
                  className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="flex flex-col items-center gap-4 mb-6">
                   <div className="relative w-28 h-28 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
                       {formData.photo ? (
                        <div className="relative w-full h-full">
                           <img src={formData.photo} className="w-full h-full object-cover" alt="" />
                           {modalType !== 'view' && (
                             <button 
                               type="button"
                               onClick={() => setFormData(p => ({ ...p, photo: '' }))}
                               className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all z-10"
                             >
                               <X size={12} />
                             </button>
                           )}
                        </div>
                      ) : (
                        <Camera size={40} className="text-slate-200" />
                      )}
                      {modalType !== 'view' && (
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <Upload size={24} className="text-white" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                      )}
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Foto de Perfil</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input 
                      required
                      readOnly={modalType === 'view'}
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                      placeholder="Ex: Dra. Ana Silva"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                    <input 
                      required
                      readOnly={modalType === 'view'}
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                      placeholder="contato@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone / Celular</label>
                    <input 
                      required
                      readOnly={modalType === 'view'}
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF</label>
                    <input 
                      readOnly={modalType === 'view'}
                      type="text" 
                      value={formData.cpf}
                      onChange={e => setFormData({...formData, cpf: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Início</label>
                    <input 
                      readOnly={modalType === 'view'}
                      type="date" 
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço</label>
                    <div className="relative">
                       <MapPin size={18} className="absolute left-4 top-4 text-slate-300" />
                       <input 
                        readOnly={modalType === 'view'}
                        type="text" 
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                        placeholder="Endereço profissional"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 border-t border-slate-50 mt-4 pt-6">
                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-6">Cargo e Credenciais</p>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Função / Papel</label>
                         <div className="grid grid-cols-3 gap-2">
                            {['practitioner', 'admin', 'staff'].map((r) => (
                              <button
                                key={r}
                                type="button"
                                disabled={modalType === 'view'}
                                onClick={() => setFormData({...formData, role: r})}
                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  formData.role === r ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                {r === 'practitioner' ? 'Saúde' : r === 'admin' ? 'Gestão' : 'Equipe'}
                              </button>
                            ))}
                         </div>
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reg. Profissional (Ex: CRP/CRM)</label>
                         <input 
                          readOnly={modalType === 'view'}
                          type="text" 
                          value={formData.professionalId}
                          onChange={e => setFormData({...formData, professionalId: e.target.value})}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                          placeholder="Ex: 000000"
                        />
                       </div>
                       <div className="col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Especialidade Principal</label>
                         <div className="relative">
                            <Stethoscope size={18} className="absolute left-4 top-4 text-slate-300" />
                            <input 
                              readOnly={modalType === 'view'}
                              type="text" 
                              value={formData.specialty}
                              onChange={e => setFormData({...formData, specialty: e.target.value})}
                              className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                              placeholder="Ex: Psicologia Clínica Infantil"
                            />
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salário Base (R$)</label>
                         <div className="relative">
                            <Coins size={18} className="absolute left-4 top-4 text-slate-300" />
                            <input 
                              readOnly={modalType === 'view'}
                              type="text" 
                              value={formData.baseSalary}
                              onChange={e => setFormData({...formData, baseSalary: e.target.value})}
                              className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                              placeholder="0,00"
                            />
                         </div>
                       </div>

                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor por Sessão (R$)</label>
                         <div className="relative">
                            <CreditCard size={18} className="absolute left-4 top-4 text-slate-300" />
                            <input 
                              readOnly={modalType === 'view'}
                              type="text" 
                              value={formData.sessionValue}
                              onChange={e => setFormData({...formData, sessionValue: e.target.value})}
                              className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                              placeholder="0,00"
                            />
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2 border-t border-slate-100 pt-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <ClipboardList size={14} /> Breve Histórico / Observações
                    </label>
                    <textarea 
                      readOnly={modalType === 'view'}
                      value={formData.observations}
                      onChange={e => setFormData({...formData, observations: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium min-h-[100px]"
                      placeholder="Experiências anteriores, anotações de RH ou habilidades..."
                    />
                  </div>
                </div>

                {modalType === 'view' && (
                  <div className="pt-6 flex">
                    <button 
                      type="button" 
                      onClick={() => setModalType(null)} 
                      className="w-full px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all uppercase tracking-widest"
                    >
                      Fechar
                    </button>
                  </div>
                )}
                
                {modalType !== 'view' && (
                  <div className="pt-6 flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setModalType(null)} 
                      className="flex-1 px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all uppercase tracking-widest"
                    >
                      Cancelar
                    </button>
                    <button 
                      disabled={formLoading}
                      type="submit"
                      className="flex-[2] px-8 py-5 bg-accent-600 text-white rounded-2xl font-bold hover:bg-accent-700 transition-all shadow-xl shadow-accent-200/50 flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      {formLoading ? 'Salvando...' : <><Save size={20} /> Salvar Integrante</>}
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
