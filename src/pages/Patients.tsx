import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, serverTimestamp, doc, updateDoc, deleteDoc, orderBy, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2,
  Trash2,
  Eye,
  Mail, 
  Phone, 
  Calendar as CalendarIcon,
  Filter,
  X,
  Save,
  CreditCard,
  MapPin,
  ClipboardList,
  Download,
  Upload,
  Camera,
  FileText,
  FilePlus,
  FileCheck,
  Zap
} from 'lucide-react';

export default function Patients() {
  const { profile, managedClinicId, user, isGestor, isProfissional, isPaciente } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientDocuments, setPatientDocuments] = useState<any[]>([]);
  const [patientSessions, setPatientSessions] = useState<any[]>([]);
  const [patientAnamnesis, setPatientAnamnesis] = useState<any>(null);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [isAddingAnamnesis, setIsAddingAnamnesis] = useState(false);
  const [newDocForm, setNewDocForm] = useState({ title: '', type: 'Relatório', content: '' });
  const [anamnesisForm, setAnamnesisForm] = useState({ 
    complaint: '', 
    history: '', 
    familyHistory: '', 
    clinicalObservations: '',
    goals: '' 
  });
  
  const clinicId = managedClinicId || (profile?.clinicRoles ? Object.keys(profile.clinicRoles)[0] : null);
  const canIssueDocs = isGestor(clinicId || '') || isProfissional(clinicId || '');

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clinicId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const header = lines[0].split(',');
      const rows = lines.slice(1);

      let successCount = 0;
      setLoading(true);

      for (const row of rows) {
        if (!row.trim()) continue;
        const values = row.split(',');
        const patientData: any = {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        header.forEach((h, i) => {
          const key = h.trim().toLowerCase();
          const val = values[i]?.trim();
          if (key === 'nome') patientData.name = val;
          if (key === 'email') patientData.email = val;
          if (key === 'telefone' || key === 'celular') patientData.phone = val;
          if (key === 'cpf') patientData.cpf = val;
          if (key === 'plano') patientData.healthPlan = val;
          if (key === 'valor' || key === 'sessão') patientData.sessionValue = val;
        });

        if (patientData.name) {
          try {
            await addDoc(collection(db, 'clinics', clinicId, 'patients'), patientData);
            successCount++;
          } catch (err) {
            console.error('Erro ao importar linha:', row, err);
          }
        }
      }

      alert(`${successCount} pacientes importados com sucesso!`);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    cpf: '',
    healthPlan: '',
    planNumber: '',
    startDate: '',
    address: '',
    observations: '',
    paymentMethod: 'Particular',
    sessionValue: '',
    photo: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for firestore doc size
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
    if (patients.length === 0) return;
    
    const headers = ['Nome', 'CPF', 'Email', 'Celular', 'Plano', 'Valor Sessão', 'Status'];
    const rows = patients.map(p => [
      p.name,
      p.cpf,
      p.email,
      p.phone,
      p.healthPlan || 'Particular',
      p.sessionValue,
      'Ativo'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pacientes_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!clinicId) return;

    const q = query(collection(db, 'clinics', clinicId, 'patients'), orderBy('name'));
    const unsub = onSnapshot(q, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `clinics/${clinicId}/patients`));

    return () => unsub();
  }, [clinicId]);

  useEffect(() => {
    if (!clinicId || !selectedPatient?.id) {
      setPatientDocuments([]);
      setPatientSessions([]);
      return;
    }

    const qDocs = query(
      collection(db, 'clinics', clinicId, 'patients', selectedPatient.id, 'documents'), 
      orderBy('createdAt', 'desc')
    );
    const unsubDocs = onSnapshot(qDocs, (snapshot) => {
      setPatientDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `clinics/${clinicId}/patients/${selectedPatient.id}/documents`));

    // Histórico de sessões (consultas)
    const qSessions = query(
      collection(db, 'clinics', clinicId, 'appointments'),
      where('patientId', '==', selectedPatient.id),
      orderBy('date', 'desc')
    );
    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      setPatientSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `clinics/${clinicId}/appointments`));

    return () => {
      unsubDocs();
      unsubSessions();
    };
  }, [clinicId, selectedPatient?.id]);

  useEffect(() => {
    if (!clinicId || !selectedPatient?.id) {
      setPatientAnamnesis(null);
      return;
    }

    const docRef = doc(db, 'clinics', clinicId, 'patients', selectedPatient.id, 'anamnesis', 'initial');
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPatientAnamnesis(data);
        setAnamnesisForm(data as any);
      } else {
        setPatientAnamnesis(null);
        setAnamnesisForm({ 
          complaint: '', 
          history: '', 
          familyHistory: '', 
          clinicalObservations: '',
          goals: '' 
        });
      }
    });

    return () => unsub();
  }, [clinicId, selectedPatient?.id]);

  const handleSaveAnamnesis = async () => {
    if (!clinicId || !selectedPatient?.id) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'clinics', clinicId, 'patients', selectedPatient.id, 'anamnesis', 'initial'), {
        ...anamnesisForm,
        updatedAt: serverTimestamp()
      }).catch(async (err) => {
        // Se não existir, tenta criar
        if (err.code === 'not-found') {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'clinics', clinicId, 'patients', selectedPatient.id, 'anamnesis', 'initial'), {
            ...anamnesisForm,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          throw err;
        }
      });
      setIsAddingAnamnesis(false);
      alert('Anamnese salva com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clinics/${clinicId}/patients/${selectedPatient.id}/anamnesis`);
    } finally {
      setLoading(false);
    }
  };

  const templates = {
    'Relatório': (patient: any) => `RELATÓRIO EVOLUTIVO\n\nPaciente: ${patient.name}\nCPF: ${patient.cpf}\nData de Início: ${patient.startDate || 'Não informada'}\n\nObservações Técnicas:\n[Descreva aqui o histórico das sessões e evolução do paciente]\n\nAtenciosamente,`,
    'Laudo': (patient: any) => `LAUDO PSICOLÓGICO / MÉDICO\n\nIdentificação do Paciente:\nNome: ${patient.name}\nCPF: ${patient.cpf}\n\nFinalidade do Documento: Comprovação de acompanhamento clínico.\n\nAnálise:\n[Descreva aqui as impressões técnicas, diagnósticos e recomendações]`,
    'Atestado': (patient: any) => `ATESTADO DE COMPARECIMENTO\n\nAtesto para os devidos fins que o(a) Sr(a). ${patient.name}, inscrito(a) no CPF ${patient.cpf}, compareceu a sessão de atendimento clínico nesta data às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.\n\nO documento tem validade para fins de justificação de ausência.`
  };

  const handleCreateDocument = async () => {
    if (!clinicId || !selectedPatient?.id || !newDocForm.title || !newDocForm.content) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'clinics', clinicId, 'patients', selectedPatient.id, 'documents'), {
        ...newDocForm,
        issuedBy: profile?.displayName || 'Sistema',
        issuedById: user?.uid,
        createdAt: serverTimestamp()
      });
      setIsAddingDoc(false);
      setNewDocForm({ title: '', type: 'Relatório', content: '' });
      
      // Trigger Simulado de WhatsApp
      const msg = `Olá ${selectedPatient.name}, um novo documento (${newDocForm.type}: ${newDocForm.title}) foi emitido e está disponível em sua área do paciente.`;
      console.log("Notificação WhatsApp Enviada (Simulada):", msg);

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `clinics/${clinicId}/patients/${selectedPatient.id}/documents`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (type: string) => {
    if (templates[type as keyof typeof templates]) {
       const content = templates[type as keyof typeof templates](selectedPatient);
       setNewDocForm(p => ({ ...p, type, content, title: `${type} - ${new Date().toLocaleDateString('pt-BR')}` }));
    }
  };

  const sendWhatsApp = (patient: any, type: string) => {
    const phone = patient.phone?.replace(/\D/g, '');
    if (!phone) {
      alert("Paciente sem telefone cadastrado.");
      return;
    }
    const message = type === 'doc' 
      ? `Olá ${patient.name}, seu documento já está pronto para download em nossa plataforma.`
      : `Olá ${patient.name}, passamos para confirmar sua sessão agendada.`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      cpf: '',
      healthPlan: '',
      planNumber: '',
      startDate: '',
      address: '',
      observations: '',
      paymentMethod: 'Particular',
      sessionValue: '',
      photo: ''
    });
    setSelectedPatient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId || !formData.name) return;
    
    setLoading(true);
    try {
      const dataToSave = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        cpf: formData.cpf,
        healthPlan: formData.healthPlan,
        planNumber: formData.planNumber,
        startDate: formData.startDate,
        address: formData.address,
        observations: formData.observations,
        paymentMethod: formData.paymentMethod,
        sessionValue: formData.sessionValue,
        photo: formData.photo,
        updatedAt: serverTimestamp()
      };

      if (modalType === 'create') {
        const docRef = await addDoc(collection(db, 'clinics', clinicId, 'patients'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        
        // Optimistic update to help slow syncs
        const newPatient = { id: docRef.id, ...dataToSave, createdAt: new Date() };
        setPatients(prev => {
          if (prev.find(p => p.id === docRef.id)) return prev;
          return [...prev, newPatient].sort((a, b) => a.name.localeCompare(b.name));
        });

        alert('Paciente cadastrado com sucesso!');
      } else if (modalType === 'edit' && selectedPatient) {
        await updateDoc(doc(db, 'clinics', clinicId, 'patients', selectedPatient.id), dataToSave);
        alert('Cadastro atualizado com sucesso!');
      }
      setModalType(null);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, modalType === 'create' ? OperationType.CREATE : OperationType.UPDATE, `clinics/${clinicId}/patients`);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (patient: any) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      birthDate: patient.birthDate || '',
      cpf: patient.cpf || '',
      healthPlan: patient.healthPlan || '',
      planNumber: patient.planNumber || '',
      startDate: patient.startDate || '',
      address: patient.address || '',
      observations: patient.observations || '',
      paymentMethod: patient.paymentMethod || 'Particular',
      sessionValue: patient.sessionValue || '',
      photo: patient.photo || ''
    });
    setModalType('edit');
  };

  const openView = (patient: any) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      birthDate: patient.birthDate || '',
      cpf: patient.cpf || '',
      healthPlan: patient.healthPlan || '',
      planNumber: patient.planNumber || '',
      startDate: patient.startDate || '',
      address: patient.address || '',
      observations: patient.observations || '',
      paymentMethod: patient.paymentMethod || 'Particular',
      sessionValue: patient.sessionValue || '',
      photo: patient.photo || ''
    });
    setModalType('view');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!clinicId || !confirm(`Tem certeza que deseja excluir o paciente "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'clinics', clinicId, 'patients', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `clinics/${clinicId}/patients/${id}`);
    }
  };

  const filteredPatients = patients.filter(p => {
    const search = searchTerm.toLowerCase();
    const nameMatch = (p.name || '').toLowerCase().includes(search);
    const cpfMatch = (p.cpf || '').includes(searchTerm);
    const emailMatch = (p.email || '').toLowerCase().includes(search);
    return nameMatch || cpfMatch || emailMatch;
  });

  return (
    <div className="p-8 space-y-8">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
             <Users size={24} />
           </div>
           <div>
             <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight uppercase">Pacientes & Prontuários</h1>
             <p className="text-xs md:text-sm text-slate-500 font-medium">Gestão inteligente de histórico e documentos.</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <input 
            type="file" 
            id="csv-import" 
            className="hidden" 
            accept=".csv" 
            onChange={handleImportCSV} 
          />
          <label 
            htmlFor="csv-import"
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black hover:bg-slate-50 transition-all shadow-sm active:scale-95 uppercase tracking-widest cursor-pointer"
          >
            <Upload size={16} />
            Importar
          </label>
          <button 
            onClick={exportToCSV}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black hover:bg-slate-50 transition-all shadow-sm active:scale-95 uppercase tracking-widest"
          >
            <Download size={16} />
            Exportar
          </button>
          <button 
            onClick={() => { resetForm(); setModalType('create'); }}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-accent-600 text-white rounded-xl text-[10px] font-black hover:bg-accent-700 transition-all shadow-lg shadow-accent-950/20 active:scale-95 uppercase tracking-widest"
          >
            <Plus size={16} />
            Novo Paciente
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, CPF ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest">
            <Filter size={16} />
            Filtros
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8">Paciente</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">PF / Convênio</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contato</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Início / Valor</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-8">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 pl-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm group-hover:border-primary-200 transition-all overflow-hidden">
                       {patient.photo ? (
                         <img src={patient.photo} className="w-full h-full object-cover" alt="" />
                       ) : (
                         <Users size={20} className="text-slate-300" />
                       )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{patient.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CPF: {patient.cpf || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs font-bold text-slate-600">
                  {patient.healthPlan || 'Particular'}
                  <div className="text-[10px] text-slate-400 normal-case">{patient.planNumber}</div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                      <Mail size={12} className="text-primary-400" />
                      <span>{patient.email || 'N/I'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                      <Phone size={12} className="text-emerald-400" />
                      <span>{patient.phone || 'N/I'}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <div>
                         <p className="text-[10px] font-bold text-slate-900">{patient.startDate ? new Date(patient.startDate).toLocaleDateString('pt-BR') : 'N/D'}</p>
                         <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none mt-1">R$ {patient.sessionValue || '0,00'}</p>
                      </div>
                   </div>
                </td>
                <td className="p-4 text-right pr-8">
                  <div className="flex justify-end gap-2">
                     <button onClick={() => openView(patient)} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm">
                        <Eye size={16} />
                     </button>
                     <button onClick={() => openEdit(patient)} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-amber-600 hover:border-amber-100 transition-all shadow-sm">
                        <Edit2 size={16} />
                     </button>
                     <button onClick={() => handleDelete(patient.id, patient.name)} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-600 hover:border-red-100 transition-all shadow-sm">
                        <Trash2 size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400">Nenhum paciente cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold font-display text-slate-900 uppercase">
                  {modalType === 'create' ? 'Novo Paciente' : modalType === 'edit' ? 'Editar Paciente' : 'Visualizar Paciente'}
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="flex flex-col items-center gap-4 mb-6">
                   <div className="relative w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
                      {formData.photo ? (
                        <div className="relative w-full h-full">
                           <img src={formData.photo} className="w-full h-full object-cover" alt="" />
                           {modalType !== 'view' && (
                             <button 
                               type="button"
                               onClick={() => setFormData(p => ({ ...p, photo: '' }))}
                               className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                             >
                               <X size={12} />
                             </button>
                           )}
                        </div>
                      ) : (
                        <Camera size={32} className="text-slate-300" />
                      )}
                      {modalType !== 'view' && (
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <Upload size={20} className="text-white" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                      )}
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Foto do Paciente</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2 space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
                     <input 
                      required
                      readOnly={modalType === 'view'}
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                      placeholder="Ex: Maria das Dores" 
                    />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">CPF</label>
                     <input 
                      readOnly={modalType === 'view'}
                      type="text" 
                      value={formData.cpf}
                      onChange={(e) => setFormData(p => ({ ...p, cpf: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                      placeholder="000.000.000-00" 
                    />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Data de Nascimento</label>
                     <input 
                      readOnly={modalType === 'view'}
                      type="date" 
                      value={formData.birthDate}
                      onChange={(e) => setFormData(p => ({ ...p, birthDate: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                    />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">E-mail</label>
                     <input 
                      readOnly={modalType === 'view'}
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                      placeholder="Ex: maria@email.com" 
                    />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Celular (WhatsApp)</label>
                     <input 
                      readOnly={modalType === 'view'}
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                      placeholder="(11) 99999-9999" 
                    />
                   </div>
                   <div className="col-span-2 space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Endereço</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
                        <input 
                          readOnly={modalType === 'view'}
                          type="text" 
                          value={formData.address}
                          onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                          className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                          placeholder="Endereço completo..." 
                        />
                     </div>
                   </div>

                   <div className="col-span-2 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4">Informações de Atendimento</p>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Plano de Saúde</label>
                           <input 
                            readOnly={modalType === 'view'}
                            type="text" 
                            value={formData.healthPlan}
                            onChange={(e) => setFormData(p => ({ ...p, healthPlan: e.target.value }))}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                            placeholder="Particular, Unimed, etc." 
                          />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nº da Carteirinha</label>
                           <input 
                            readOnly={modalType === 'view'}
                            type="text" 
                            value={formData.planNumber}
                            onChange={(e) => setFormData(p => ({ ...p, planNumber: e.target.value }))}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                            placeholder="00000000" 
                          />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Forma de Pagamento</label>
                           <select 
                            disabled={modalType === 'view'}
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData(p => ({ ...p, paymentMethod: e.target.value }))}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                           >
                             <option value="Particular">Particular</option>
                             <option value="Convênio">Convênio</option>
                             <option value="Cartão">Cartão</option>
                             <option value="PIX">PIX</option>
                           </select>
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Valor Sessão (R$)</label>
                           <div className="relative">
                              <CreditCard className="absolute left-4 top-4 text-slate-300" size={18} />
                              <input 
                                readOnly={modalType === 'view'}
                                type="text" 
                                value={formData.sessionValue}
                                onChange={(e) => setFormData(p => ({ ...p, sessionValue: e.target.value }))}
                                className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                                placeholder="0,00" 
                              />
                           </div>
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Data de Início</label>
                           <input 
                            readOnly={modalType === 'view'}
                            type="date" 
                            value={formData.startDate}
                            onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                          />
                         </div>
                      </div>
                   </div>

                   <div className="col-span-2 space-y-2 pt-4 border-t border-slate-100">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <ClipboardList size={14} /> Observações / Histórico
                     </label>
                     <textarea 
                      readOnly={modalType === 'view'}
                      value={formData.observations}
                      onChange={(e) => setFormData(p => ({ ...p, observations: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium min-h-[100px]" 
                      placeholder="Observações importantes..." 
                    />
                   </div>

                   {(modalType === 'view' || modalType === 'edit') && (
                      <div className="col-span-2 pt-8 border-t border-slate-100 space-y-8">
                         {/* Stats Summary */}
                         <div className="grid grid-cols-3 gap-4">
                            <div className="p-6 bg-primary-50 rounded-[2rem] border border-primary-100">
                               <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none mb-2">Total de Sessões</p>
                               <p className="text-3xl font-black text-primary-700">{patientSessions.length}</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Próxima Consulta</p>
                               <p className="text-xl font-black text-slate-700">
                                 {patientSessions.find(s => new Date(s.date) >= new Date())?.date.split('-').reverse().join('/') || '--/--/--'}
                               </p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Início</p>
                               <p className="text-xl font-black text-slate-700">{formData.startDate.split('-').reverse().join('/') || '--/--/--'}</p>
                            </div>
                         </div>

                         {/* PEP / Prontuário - Anamnese */}
                         <div className="space-y-4 pt-6 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                               <div>
                                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Anamnese / PEP</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ficha técnica e histórico evolutivo</p>
                               </div>
                               {canIssueDocs && !isAddingAnamnesis && (
                                  <button 
                                    type="button"
                                    onClick={() => setIsAddingAnamnesis(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black hover:bg-emerald-100 transition-all uppercase tracking-widest"
                                  >
                                    <Plus size={14} /> {patientAnamnesis ? 'Atualizar Anamnese' : 'Iniciar Ficha'}
                                  </button>
                               )}
                            </div>

                            {isAddingAnamnesis ? (
                              <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                                 <div className="space-y-4">
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Queixa Principal</label>
                                       <textarea 
                                         value={anamnesisForm.complaint} 
                                         onChange={e => setAnamnesisForm({...anamnesisForm, complaint: e.target.value})}
                                         className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                         placeholder="Qual o motivo central da busca por atendimento?"
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Histórico da Doença Atual (HDA)</label>
                                       <textarea 
                                         value={anamnesisForm.history} 
                                         onChange={e => setAnamnesisForm({...anamnesisForm, history: e.target.value})}
                                         className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                         placeholder="Cronoliga dos fatos..."
                                       />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Histórico Familiar</label>
                                          <textarea 
                                            value={anamnesisForm.familyHistory} 
                                            onChange={e => setAnamnesisForm({...anamnesisForm, familyHistory: e.target.value})}
                                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                          />
                                       </div>
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Metas de Tratamento</label>
                                          <textarea 
                                            value={anamnesisForm.goals} 
                                            onChange={e => setAnamnesisForm({...anamnesisForm, goals: e.target.value})}
                                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                          />
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex gap-3">
                                    <button type="button" onClick={() => setIsAddingAnamnesis(false)} className="flex-1 py-3 bg-white text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">Cancelar</button>
                                    <button type="button" onClick={handleSaveAnamnesis} className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200">Salvar Anamnese de Elite</button>
                                 </div>
                              </div>
                            ) : patientAnamnesis && (
                               <div className="p-6 bg-emerald-50/30 border border-emerald-100 rounded-[2rem] grid grid-cols-2 gap-6 relative">
                                  <div className="absolute top-4 right-4">
                                     <FileCheck className="text-emerald-300" size={32} />
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Queixa Principal</p>
                                     <p className="text-sm font-medium text-slate-700">"{patientAnamnesis.complaint}"</p>
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Metas do Tratamento</p>
                                     <p className="text-sm font-medium text-slate-700">"{patientAnamnesis.goals}"</p>
                                  </div>
                               </div>
                            )}
                         </div>

                         {/* IA de Auxílio Clínico */}
                         {(isProfissional(clinicId || '') || isGestor(clinicId || '')) && (
                            <div className="space-y-4 pt-6 border-t border-slate-100">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                                     <Zap size={18} />
                                  </div>
                                  <div>
                                     <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">IA de Auxílio Clínico</h4>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Análise inteligente de padrão e evolução</p>
                                  </div>
                               </div>
                               
                               <div className="p-8 bg-indigo-950 rounded-[2.5rem] text-white relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
                                  
                                  <div className="relative z-10 space-y-6">
                                     <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                                        "O sistema identificou que este paciente {patientSessions.length > 3 ? 'apresenta uma constância acima da média' : 'ainda está em fase inicial de acolhimento'}. {patientAnamnesis ? 'Baseado na queixa de ' + patientAnamnesis.complaint + ', ' : ''} recomenda-se foco em {formData.observations?.includes('ansiedade') ? 'técnicas de regulação emocional' : 'fortalecimento da aliança terapêutica'}."
                                     </p>
                                     
                                     <div className="flex flex-wrap gap-2">
                                        <button 
                                          type="button"
                                          onClick={() => alert('IA: Analisando padrões de sono e apetite baseados no histórico...')}
                                          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                           Resumir Evolução
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={() => alert('IA: Sugerindo hipóteses baseadas no DSM-V e histórico do paciente...')}
                                          className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                           Sugerir Hipótese
                                        </button>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )}

                         {/* Histórico de Sessões */}
                         <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Histórico Clínico (Sessões)</h4>
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden max-h-[300px] overflow-y-auto shadow-sm">
                               {patientSessions.length > 0 ? (
                                 <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                                       <tr>
                                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</th>
                                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modalidade</th>
                                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profissional</th>
                                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                       {patientSessions.map(session => (
                                          <tr key={session.id} className="text-xs font-bold text-slate-600 hover:bg-slate-50/50 transition-colors">
                                             <td className="px-6 py-4">{session.date.split('-').reverse().join('/')}</td>
                                             <td className="px-6 py-4">{session.time}</td>
                                             <td className="px-6 py-4">{session.modality || 'Presencial'}</td>
                                             <td className="px-6 py-4">{session.professionalName}</td>
                                             <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[8px] uppercase tracking-widest font-black ${session.status === 'Confirmado' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                   {session.status}
                                                </span>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                               ) : (
                                 <div className="p-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">Nenhuma sessão registrada</div>
                               )}
                            </div>
                         </div>

                         {/* Documentos */}
                         <div className="space-y-6 pt-6 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                               <div>
                                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Documentos Emitidos</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Atestados, Laudos e Relatórios</p>
                               </div>
                            {canIssueDocs && !isAddingDoc && (
                              <button 
                                type="button"
                                onClick={() => setIsAddingDoc(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-[10px] font-black hover:bg-primary-100 transition-all uppercase tracking-widest"
                              >
                                <FilePlus size={14} /> Novo Documento
                              </button>
                            )}
                         </div>

                         {isAddingDoc && (
                           <motion.div 
                             initial={{ opacity: 0, y: -20 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4"
                           >
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Título do Documento</label>
                                    <input 
                                      value={newDocForm.title}
                                      onChange={e => setNewDocForm(p => ({ ...p, title: e.target.value }))}
                                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                                      placeholder="Ex: Laudo Evolutivo 2024"
                                    />
                                 </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tipo</label>
                                    <select 
                                      value={newDocForm.type}
                                      onChange={e => {
                                        const type = e.target.value;
                                        setNewDocForm(p => ({ ...p, type }));
                                        handleSelectTemplate(type);
                                      }}
                                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                                    >
                                      <option value="">Selecione o modelo</option>
                                      <option>Relatório</option>
                                      <option>Laudo</option>
                                      <option>Atestado</option>
                                    </select>
                                 </div>
                                 <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Conteúdo</label>
                                    <textarea 
                                      value={newDocForm.content}
                                      onChange={e => setNewDocForm(p => ({ ...p, content: e.target.value }))}
                                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium min-h-[150px]"
                                      placeholder="Descreva as informações do documento..."
                                    />
                                 </div>
                              </div>
                              <div className="flex gap-3 pt-2">
                                 <button type="button" onClick={() => setIsAddingDoc(false)} className="flex-1 py-3 bg-white text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-50">Cancelar</button>
                                 <button type="button" onClick={handleCreateDocument} className="flex-[2] py-3 bg-accent-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-950/20 hover:bg-accent-700">Emitir Documento</button>
                              </div>
                           </motion.div>
                         )}

                         <div className="space-y-3">
                            {patientDocuments.length > 0 ? patientDocuments.map(doc => (
                              <div key={doc.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-primary-100 transition-all group shadow-sm">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                                      <FileText size={20} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-slate-900 uppercase leading-none">{doc.title}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {doc.type} • {doc.issuedBy} • {doc.createdAt && 'toDate' in doc.createdAt ? (doc.createdAt as any).toDate().toLocaleDateString('pt-BR') : 'Agora'}
                                      </p>
                                   </div>
                                </div>
                                <div className="flex gap-2">
                                   <button 
                                      type="button" 
                                      onClick={() => sendWhatsApp(selectedPatient, 'doc')}
                                      className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2 text-[10px] font-bold uppercase"
                                      title="Avisar por WhatsApp"
                                   >
                                      Avisar WhatsApp
                                   </button>
                                   <button type="button" onClick={() => alert(doc.content)} className="p-2 text-slate-400 hover:text-primary-600">
                                      <Eye size={18} />
                                   </button>
                                </div>
                              </div>
                            )) : !isAddingDoc && (
                              <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
                                 <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">Nenhum documento emitido</p>
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                )}
             </div>
                
                {modalType === 'view' && (
                  <div className="pt-4 flex">
                    <button type="button" onClick={() => setModalType(null)} className="w-full px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all uppercase tracking-widest">
                      Fechar
                    </button>
                  </div>
                )}
                
                {modalType !== 'view' && (
                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setModalType(null)} className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all uppercase tracking-widest">
                      Cancelar
                    </button>
                    <button 
                      disabled={loading}
                      type="submit" 
                      className="flex-[2] px-6 py-4 bg-accent-600 text-white rounded-2xl font-bold hover:bg-accent-700 transition-all shadow-xl shadow-accent-950/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      {loading ? 'Salvando...' : <><Save size={20} /> Salvar Cadastro</>}
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
