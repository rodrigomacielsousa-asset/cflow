import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  User,
  X,
  Save,
  Calendar as CalendarIcon,
  AlertCircle,
  MessageCircle,
  Bell,
  Edit2,
  Trash2
} from 'lucide-react';

export default function Agenda() {
  const { profile, managedClinicId } = useAuth();
  const clinicId = managedClinicId || (profile?.clinicRoles ? Object.keys(profile.clinicRoles)[0] : null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApptId, setEditingApptId] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const [newAppt, setNewAppt] = useState({
    patientId: '',
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    professionalId: '',
    professionalName: '',
    status: 'Confirmado',
    modality: 'Presencial',
    type: 'Psicologia Clínica',
    sessionValue: '0',
    discount: '0',
    followUp: '',
    notes: ''
  });

  const isSlotBusy = (time: string, date: string, profId: string) => {
    if (!profId || !date || !time) return false;
    
    const normalizeTime = (t: string) => {
      const clean = (t || '').toString().trim().split(' ')[0]; // Pegar apenas HH:mm
      if (!clean) return '';
      const parts = clean.split(':');
      const h = parts[0] || '00';
      const m = parts[1] || '00';
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    };

    const targetDate = date.trim();
    const targetTime = normalizeTime(time);
    const targetProf = profId.trim();
    
    return appointments.some(a => {
      const apptDate = (a.date || '').trim();
      const apptTime = normalizeTime(a.time || '');
      const apptProf = (a.professionalId || '').trim();
      const isCanceled = a.status === 'Cancelado';

      return apptDate === targetDate && 
             apptTime === targetTime && 
             apptProf === targetProf && 
             !isCanceled;
    });
  };

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const hours = Array.from({ length: 11 }, (_, i) => {
    const h = i + 8;
    return `${h.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    if (!clinicId) return;

    // Carregar Equipe
    const unsubStaff = onSnapshot(collection(db, 'clinics', clinicId, 'staff'), (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Carregar Pacientes
    const unsubPatients = onSnapshot(collection(db, 'clinics', clinicId, 'patients'), (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Carregar Consultas
    const unsubAppts = onSnapshot(collection(db, 'clinics', clinicId, 'appointments'), (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubStaff();
      unsubPatients();
      unsubAppts();
    };
  }, [clinicId]);

  // Sync price and type when professional changes
  useEffect(() => {
    if (newAppt.professionalId) {
      const selectedStaff = staff.find(s => s.id === newAppt.professionalId);
      const selectedPatient = patients.find(p => p.id === newAppt.patientId);
      
      const price = selectedPatient?.sessionValue || selectedStaff?.sessionValue || '0';
      const specialty = selectedStaff?.specialty || '';
      
      setNewAppt(prev => ({ 
        ...prev, 
        sessionValue: price,
        type: specialty || prev.type
      }));
    }
  }, [newAppt.professionalId, newAppt.patientId, staff, patients]);

  const filteredPatients = patientSearch.length >= 2 
    ? patients.filter(p => (p.name || '').toLowerCase().includes(patientSearch.toLowerCase())).slice(0, 5)
    : [];

  const handleCreateAppointment = async () => {
    // Validação detalhada para feedback ao usuário
    const missingFields = [];
    if (!newAppt.patientId && !patientSearch) missingFields.push('Paciente');
    if (!newAppt.date) missingFields.push('Data');
    if (!newAppt.time) missingFields.push('Hora');
    if (!newAppt.professionalId) missingFields.push('Profissional');

    if (!(newAppt.patientId || patientSearch) || !newAppt.professionalId || !newAppt.date || !newAppt.time) {
      alert('Por favor, preencha todos os campos obrigatórios (Paciente, Profissional, Data e Hora).');
      return;
    }

    if (!clinicId) {
      alert('Unidade não identificada. Por favor, recarregue a página.');
      return;
    }

    // Se o paciente ID estiver vazio mas houver algo no search, tenta encontrar ou define como provisório
    let finalPatientId = newAppt.patientId;
    let finalPatientName = newAppt.patientName;

    if (!finalPatientId && patientSearch) {
      const exactMatch = patients.find(p => (p.name || '').toLowerCase() === patientSearch.toLowerCase());
      if (exactMatch) {
        finalPatientId = exactMatch.id;
        finalPatientName = exactMatch.name;
      } else {
        // Gera ID temporário seguro para a regra isValidId
        finalPatientId = `tmp-${Date.now()}`;
        finalPatientName = patientSearch;
      }
    }

    // Verificar Conflito (Apenas se não for edição do mesmo agendamento)
    const busy = isSlotBusy(newAppt.time, newAppt.date, newAppt.professionalId);
    const isEditingSameSlot = editingApptId && appointments.find(a => a.id === editingApptId)?.time === newAppt.time && appointments.find(a => a.id === editingApptId)?.date === newAppt.date;

    if (busy && !isEditingSameSlot) {
      const dateFmt = newAppt.date.split('-').reverse().join('/');
      alert(`CONFLITO: O horário ${newAppt.time} já possui um agendamento para este profissional no dia ${dateFmt}. Por favor, verifique a agenda ou escolha outro horário.`);
      return;
    }

    setFormLoading(true);
    try {
      const selectedStaff = staff.find(s => s.id === newAppt.professionalId);
      
      // Sanitização rigorosa de valores
      const sanValue = (val: any) => {
        if (typeof val === 'number') return val;
        const str = (val || '0').toString().replace(',', '.').replace(/[^\d.]/g, '');
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
      };
      
      const baseValue = sanValue(newAppt.sessionValue);
      const discount = sanValue(newAppt.discount);
      const finalValue = Math.max(0, baseValue - discount);

      const normalizeTime = (t: string) => {
        const clean = (t || '').toString().trim().split(' ')[0];
        if (!clean) return '';
        const parts = clean.split(':');
        return `${(parts[0] || '0').padStart(2, '0')}:${(parts[1] || '00').padStart(2, '0')}`;
      };

      const apptData = {
        patientId: finalPatientId,
        patientIdOrPlaceholder: finalPatientId, 
        patientName: finalPatientName,
        date: newAppt.date,
        time: normalizeTime(newAppt.time),
        professionalId: newAppt.professionalId,
        professionalName: selectedStaff?.name || 'Profissional',
        status: newAppt.status || 'Confirmado',
        modality: newAppt.modality || 'Presencial',
        type: newAppt.type || 'Consulta',
        sessionValue: baseValue,
        discount: discount,
        finalValue: finalValue,
        followUp: newAppt.followUp || '',
        notes: newAppt.notes || '',
        updatedAt: serverTimestamp()
      };

      if (editingApptId) {
        const { setDoc, doc } = await import('firebase/firestore');
        await setDoc(doc(db, 'clinics', clinicId, 'appointments', editingApptId), apptData, { merge: true });
        alert('Agendamento atualizado com sucesso!');
      } else {
        const apptRef = await addDoc(collection(db, 'clinics', clinicId, 'appointments'), { ...apptData, createdAt: serverTimestamp() });
        
        // Gerar Registro Financeiro se houver valor
        if (finalValue > 0) {
          await addDoc(collection(db, 'clinics', clinicId, 'finance'), {
            type: 'income',
            category: 'Consultas',
            description: `Atendimento: ${finalPatientName}`,
            amount: finalValue,
            date: newAppt.date,
            status: 'pending',
            patientId: finalPatientId,
            professionalId: newAppt.professionalId,
            appointmentId: apptRef.id,
            createdAt: serverTimestamp()
          });
        }
        alert('Agendamento realizado com sucesso!');
      }

      setIsModalOpen(false);
      setEditingApptId(null);
      
      // Reset State
      setNewAppt({ 
        patientId: '', 
        patientName: '', 
        date: new Date().toISOString().split('T')[0], 
        time: '09:00', 
        professionalId: '', 
        professionalName: '', 
        status: 'Confirmado',
        modality: 'Presencial',
        type: 'Psicologia Clínica',
        sessionValue: '0',
        discount: '0',
        followUp: '',
        notes: ''
      });
      setPatientSearch('');
    } catch (error: any) {
      console.error('ERRO:', error);
      alert('Não foi possível salvar o agendamento.');
      handleFirestoreError(error, editingApptId ? OperationType.UPDATE : OperationType.CREATE, `clinics/${clinicId}/appointments`);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(app => 
    selectedStaffId === 'all' || app.professionalId === selectedStaffId
  );

  const handleEdit = (appt: any) => {
    setEditingApptId(appt.id);
    setNewAppt({
      patientId: appt.patientId || '',
      patientName: appt.patientName || '',
      date: appt.date || new Date().toISOString().split('T')[0],
      time: appt.time || '09:00',
      professionalId: appt.professionalId || '',
      professionalName: appt.professionalName || '',
      status: appt.status || 'Confirmado',
      modality: appt.modality || 'Presencial',
      type: appt.type || 'Psicologia Clínica',
      sessionValue: (appt.sessionValue || 0).toString(),
      discount: (appt.discount || 0).toString(),
      followUp: appt.followUp || '',
      notes: appt.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (appt: any) => {
    if (!clinicId || !appt.id) return;
    if (confirm(`Deseja realmente excluir o agendamento de ${appt.patientName}?`)) {
      try {
        await deleteDoc(doc(db, 'clinics', clinicId, 'appointments', appt.id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `clinics/${clinicId}/appointments/${appt.id}`);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      <header className="p-8 border-b border-slate-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Agenda</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button className="p-1 hover:bg-white rounded-md transition-all"><ChevronLeft size={18} /></button>
              <span className="px-4 text-sm font-bold text-slate-700">Semana Atual</span>
              <button className="p-1 hover:bg-white rounded-md transition-all"><ChevronRight size={18} /></button>
            </div>
            <select 
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-widest text-primary-600 outline-none cursor-pointer"
            >
              <option value="all">TODOS OS PROFISSIONAIS</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>{member.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => { setEditingApptId(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-600 text-white rounded-xl text-sm font-bold hover:bg-accent-700 transition-all shadow-lg shadow-accent-950/20 active:scale-95"
          >
            <Plus size={18} />
            Agendar
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horário</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Procedimento</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profissional</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAppointments.length > 0 ? (
                    [...filteredAppointments]
                      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                      .map(appt => (
                        <AppointmentRow 
                          key={appt.id} 
                          appt={appt} 
                          onEdit={() => handleEdit(appt)} 
                          onDelete={() => handleDelete(appt)} 
                        />
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                           <CalendarIcon size={48} className="text-slate-200" />
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Nenhum agendamento encontrado</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-bold font-display tracking-tight uppercase">
                  {editingApptId ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h2>
                <button onClick={() => { setIsModalOpen(false); setEditingApptId(null); }} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Paciente <span className="text-rose-500">*</span></label>
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <input 
                        value={newAppt.patientName || patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          if (newAppt.patientId) setNewAppt(p => ({ ...p, patientId: '', patientName: '' }));
                        }}
                        placeholder="Buscar por nome..." 
                        className={`w-full pl-12 p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold ${!newAppt.patientId && patientSearch ? 'border-amber-200 ring-2 ring-amber-50' : 'border-slate-100'}`} 
                      />
                    </div>
                    
                    {!newAppt.patientId && patientSearch && (
                      <p className="mt-1 text-[10px] font-bold text-amber-600 uppercase tracking-widest pl-1">
                        ⚠️ Por favor, selecione o paciente da lista abaixo
                      </p>
                    )}
                    
                    <AnimatePresence>
                      {filteredPatients.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden"
                        >
                          {filteredPatients.map(p => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setNewAppt(prev => ({ ...prev, patientId: p.id, patientName: p.name }));
                                setPatientSearch('');
                              }}
                              className="w-full p-4 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-none"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                <User size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 uppercase">{p.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">{p.cpf || 'Sem CPF'}</p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {newAppt.patientId && (
                      <div className="mt-2 flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-700 uppercase">{newAppt.patientName} Selecionado</span>
                        </div>
                        <button onClick={() => {
                          setNewAppt(p => ({ ...p, patientId: '', patientName: '' }));
                          setPatientSearch('');
                        }} className="text-emerald-400 hover:text-emerald-600 transition-all">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Profissional Responsável <span className="text-rose-500">*</span></label>
                      <select 
                        required
                        value={newAppt.professionalId}
                        onChange={(e) => setNewAppt(p => ({ ...p, professionalId: e.target.value }))}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold appearance-none"
                      >
                      <option value="">Selecione o profissional</option>
                      {staff.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                    </select>
                  </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tipo de Atendimento / Procedimento</label>
                       <input 
                        type="text" 
                        value={newAppt.type}
                        onChange={(e) => setNewAppt(p => ({ ...p, type: e.target.value }))}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                        placeholder="Ex: Psicologia Clínica, Fono, etc."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Data <span className="text-rose-500">*</span></label>
                        <input 
                          type="date" 
                          value={newAppt.date}
                          onChange={(e) => setNewAppt(p => ({ ...p, date: e.target.value }))}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Hora <span className="text-rose-500">*</span></label>
                        <select 
                          value={newAppt.time}
                          onChange={(e) => setNewAppt(p => ({ ...p, time: e.target.value }))}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold appearance-none"
                        >
                          <option value="">Selecione...</option>
                          {hours.map(h => {
                            const busy = isSlotBusy(h, newAppt.date, newAppt.professionalId);
                            return (
                              <option key={h} value={h} disabled={busy} className={busy ? 'text-slate-300' : ''}>
                                {h} {busy ? '(Ocupado)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Valor (R$)</label>
                         <input 
                          type="text" 
                          value={newAppt.sessionValue}
                          onChange={(e) => setNewAppt(p => ({ ...p, sessionValue: e.target.value }))}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                          placeholder="0,00"
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Desconto</label>
                         <input 
                          type="text" 
                          value={newAppt.discount}
                          onChange={(e) => setNewAppt(p => ({ ...p, discount: e.target.value }))}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                          placeholder="0,00"
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Valor Final</label>
                         <div className="w-full p-4 bg-primary-50 border border-primary-100 rounded-2xl font-black text-primary-700">
                            R$ {(Math.max(0, parseFloat(newAppt.sessionValue.toString().replace(',', '.') || '0') - parseFloat(newAppt.discount.toString().replace(',', '.') || '0'))).toFixed(2).replace('.', ',')}
                         </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Retorno / Follow-up</label>
                        <select 
                          value={newAppt.followUp}
                          onChange={(e) => setNewAppt(p => ({ ...p, followUp: e.target.value }))}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold appearance-none"
                        >
                          <option value="">Nenhum retorono</option>
                          <option value="7 dias">Em 7 dias</option>
                          <option value="15 dias">Em 15 dias</option>
                          <option value="30 dias">Em 30 dias</option>
                        </select>
                    </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Modalidade</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                        onClick={() => setNewAppt(p => ({ ...p, modality: 'Presencial' }))}
                        className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${newAppt.modality === 'Presencial' ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                       >
                         Presencial
                       </button>
                       <button 
                        onClick={() => setNewAppt(p => ({ ...p, modality: 'Online' }))}
                        className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${newAppt.modality === 'Online' ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                       >
                         Online (Tele)
                       </button>
                    </div>
                  </div>

                </div>

                <button 
                  disabled={formLoading}
                  onClick={handleCreateAppointment}
                  className="w-full bg-accent-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-accent-950/20 hover:bg-accent-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  {formLoading ? 'Processando...' : <><Save size={20} /> {editingApptId ? 'Salvar Alterações' : 'Confirmar Agendamento'}</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppointmentRow({ appt, onEdit, onDelete }: any) {
  const statusConfig: any = {
    'Confirmado': { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
    'Pendente': { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
    'Realizado': { color: 'text-primary-600 bg-primary-50 border-primary-100', icon: CheckCircle2 },
    'Falta': { color: 'text-rose-600 bg-rose-50 border-rose-100', icon: AlertCircle },
    'Cancelado': { color: 'text-slate-400 bg-slate-50 border-slate-100', icon: X }
  };
  
  const status = appt.status || 'Confirmado';
  const config = statusConfig[status] || statusConfig['Confirmado'];
  const StatusIcon = config.icon || CheckCircle2;

  return (
    <tr className="hover:bg-slate-50/80 transition-all group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            <User size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 uppercase">{appt.patientName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">{appt.modality || 'Presencial'}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
           <Clock size={14} className="text-primary-500" />
           {appt.time}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{appt.type || 'Consulta'}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-[10px] font-black uppercase">
            {appt.professionalName?.charAt(0) || 'D'}
          </div>
          <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{appt.professionalName}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
          <StatusIcon size={12} />
          {status}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={() => {
              const dateFmt = appt.date?.split('-').reverse().join('/') || '';
              const message = `Olá ${appt.patientName}, confirmamos seu agendamento para o dia ${dateFmt} às ${appt.time}. Aguardamos você!`;
              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="Lembrete"
          >
            <MessageCircle size={18} />
          </button>
          <button 
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            title="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Excluir"
          >
             <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

