import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  FileText, 
  Clock, 
  User, 
  X, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Eye,
  LogOut,
  MapPin,
  Video
} from 'lucide-react';

export default function PatientPortal() {
  const { user, profile, managedClinicId } = useAuth();
  const location = useLocation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.search.includes('book=true')) {
      setIsBookingOpen(true);
    }
  }, [location.search]);
  
  const clinicId = managedClinicId || (profile?.clinicRoles ? Object.keys(profile.clinicRoles)[0] : null);
  
  const [newBooking, setNewBooking] = useState({
    professionalId: '',
    date: '',
    time: '',
    modality: 'Presencial',
    status: 'Pendente'
  });

  useEffect(() => {
    if (!clinicId || !user?.uid) return;

    // Load patient's specific appointments
    const qAppts = query(
      collection(db, 'clinics', clinicId, 'appointments'),
      where('patientId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubAppts = onSnapshot(qAppts, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Load patient's specific documents
    const qDocs = query(
      collection(db, 'clinics', clinicId, 'patients', user.uid, 'documents'),
      orderBy('createdAt', 'desc')
    );
    const unsubDocs = onSnapshot(qDocs, (snapshot) => {
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Load staff for booking
    const unsubStaff = onSnapshot(collection(db, 'clinics', clinicId, 'staff'), (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubAppts();
      unsubDocs();
      unsubStaff();
    };
  }, [clinicId, user?.uid]);

  const handleBooking = async () => {
    if (!clinicId || !user?.uid || !newBooking.professionalId || !newBooking.date || !newBooking.time) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const selectedStaff = staff.find(s => s.id === newBooking.professionalId);
      await addDoc(collection(db, 'clinics', clinicId, 'appointments'), {
        ...newBooking,
        patientId: user.uid,
        patientName: profile?.displayName || 'Paciente',
        professionalName: selectedStaff?.name || 'Profissional',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsBookingOpen(false);
      setNewBooking({ professionalId: '', date: '', time: '', modality: 'Presencial', status: 'Pendente' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `clinics/${clinicId}/appointments`);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!window.confirm("Deseja realmente cancelar este agendamento?")) return;
    try {
      await deleteDoc(doc(db, 'clinics', clinicId!, 'appointments', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `clinics/${clinicId}/appointments/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-200">
                <User size={24} />
             </div>
             <div>
                <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">Área do Paciente</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none mt-1">Seja bem-vindo, {profile?.displayName}</p>
             </div>
          </div>
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
          >
            <Plus size={16} className="inline mr-2" /> Nova Consulta
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Próximas Consultas */}
        <section className="space-y-4">
           <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <Calendar size={14} className="text-primary-600" /> Próximas Sessões
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.length > 0 ? appointments.map(appt => (
                <motion.div 
                  layout
                  key={appt.id}
                  className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                   <div className={`absolute top-0 right-0 px-6 py-2 text-[8px] font-black uppercase tracking-[0.2em] ${appt.status === 'Confirmado' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {appt.status}
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                         {appt.modality === 'Online' ? <Video size={20} /> : <MapPin size={20} />}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-800 uppercase leading-none">{appt.professionalName}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {appt.date.split('-').reverse().join('/')} às {appt.time} • {appt.modality}
                         </p>
                      </div>
                   </div>
                   <div className="mt-6 pt-6 border-t border-slate-50 flex justify-end gap-2">
                      <button 
                        onClick={() => cancelAppointment(appt.id)}
                        className="px-4 py-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                   </div>
                </motion.div>
              )) : (
                <div className="col-span-full p-12 bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-center">
                   <AlertCircle size={32} className="mx-auto text-slate-200 mb-4" />
                   <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">Nenhuma sessão agendada</p>
                </div>
              )}
           </div>
        </section>

        {/* Documentos */}
        <section className="space-y-4">
           <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <FileText size={14} className="text-primary-600" /> Meus Documentos
           </h2>
           <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
             <div className="divide-y divide-slate-50">
                {documents.length > 0 ? documents.map(doc => (
                  <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                           <FileText size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-800 uppercase leading-none">{doc.title}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {doc.type} • Emitido em {doc.createdAt && 'toDate' in doc.createdAt ? (doc.createdAt as any).toDate().toLocaleDateString('pt-BR') : 'Recentemente'}
                           </p>
                        </div>
                     </div>
                     <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm">
                        <Download size={18} />
                     </button>
                  </div>
                )) : (
                  <div className="p-12 text-center">
                     <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Nenhum documento disponível</p>
                  </div>
                )}
             </div>
           </div>
        </section>
      </main>

      {/* Modal de Agendamento */}
      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nova Consulta</h3>
                 <button onClick={() => setIsBookingOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                    <X size={20} />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecione o Profissional</label>
                       <select 
                         value={newBooking.professionalId}
                         onChange={e => setNewBooking(p => ({ ...p, professionalId: e.target.value }))}
                         className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                       >
                         <option value="">Selecione...</option>
                         {staff.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                       </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                          <input 
                            type="date" 
                            value={newBooking.date}
                            onChange={e => setNewBooking(p => ({ ...p, date: e.target.value }))}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora</label>
                          <input 
                            type="time" 
                            value={newBooking.time}
                            onChange={e => setNewBooking(p => ({ ...p, time: e.target.value }))}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Atendimento</label>
                        <div className="grid grid-cols-2 gap-2">
                           <button 
                            onClick={() => setNewBooking(p => ({ ...p, modality: 'Presencial' }))}
                            className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${newBooking.modality === 'Presencial' ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                           >
                              Presencial
                           </button>
                           <button 
                            onClick={() => setNewBooking(p => ({ ...p, modality: 'Online' }))}
                            className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${newBooking.modality === 'Online' ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                           >
                              Online (Tele)
                           </button>
                        </div>
                    </div>
                 </div>

                 <button 
                  disabled={loading}
                  onClick={handleBooking}
                  className="w-full bg-primary-600 text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                 >
                   {loading ? 'Agendando...' : 'Confirmar Solicitação'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
