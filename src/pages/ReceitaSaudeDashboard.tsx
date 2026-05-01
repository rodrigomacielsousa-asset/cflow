import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck, 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  History,
  Download,
  ShieldCheck,
  Lock,
  ChevronRight,
  Settings,
  Printer,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ReceitaSaudeDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'emit' | 'history' | 'settings'>('emit');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [configData, setConfigData] = useState({
    professionalName: profile?.displayName || '',
    professionalCpf: '',
    professionalCrp: 'CRP-06/12345',
    fiscalAddress: '',
    bankAccount: '',
    hasCertificate: false
  });

  const [formData, setFormData] = useState({
    patientName: '',
    patientCpf: '',
    patientEmail: '',
    serviceDate: new Date().toISOString().split('T')[0],
    amount: '',
    serviceCode: '1.09', 
    modality: 'Presencial',
    description: ''
  });

  const validateCPF = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return false;
    return true; 
  };

  const formatCurrency = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) return '';
    const numberValue = parseInt(cleanValue) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
  };

  const handleEmit = async () => {
    if (!validateCPF(formData.patientCpf)) {
      alert("CPF do paciente inválido");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F3F7FB] flex flex-col md:max-w-md md:mx-auto md:border-x md:border-slate-200">
      {/* Header */}
      <header className="bg-white px-6 py-6 border-b border-slate-100 sticky top-0 z-20">
         <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/app')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
               <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
               <FileCheck size={18} className="text-accent-600" />
               <span className="text-xs font-black uppercase tracking-widest text-[#0F172A]">Receita Saúde</span>
            </div>
            <div className="w-8" />
         </div>

         {/* Tab Switcher */}
         <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button 
               onClick={() => setActiveTab('emit')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'emit' ? 'bg-white text-fiscal-600 shadow-sm' : 'text-slate-400'}`}
            >
               <Plus size={14} /> Emitir
            </button>
            <button 
               onClick={() => setActiveTab('history')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-fiscal-600 shadow-sm' : 'text-slate-400'}`}
            >
               <History size={14} /> Histórico
            </button>
            <button 
               onClick={() => setActiveTab('settings')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-fiscal-600 shadow-sm' : 'text-slate-400'}`}
            >
               <Settings size={14} /> Ajustes
            </button>
         </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
         <AnimatePresence mode="wait">
            {activeTab === 'emit' && (
               <motion.div 
                  key="emit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
               >
                  <div className="space-y-6">
                     <div className="flex gap-2">
                        <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-fiscal-500' : 'bg-slate-200'}`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-fiscal-500' : 'bg-slate-200'}`} />
                     </div>

                     {step === 1 && (
                        <div className="space-y-6">
                           <h2 className="text-xl font-black text-[#0F172A] uppercase">Dados do Paciente</h2>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
                              <input 
                                 type="text"
                                 value={formData.patientName}
                                 onChange={e => setFormData(p => ({ ...p, patientName: e.target.value }))}
                                 className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-accent-500 transition-all font-bold"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">CPF (Obrigatório e-CAC)</label>
                              <input 
                                 type="text"
                                 value={formData.patientCpf}
                                 onChange={e => setFormData(p => ({ ...p, patientCpf: e.target.value }))}
                                 className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-accent-500 transition-all font-bold"
                              />
                           </div>
                           <button 
                              onClick={() => setStep(2)}
                              disabled={!formData.patientName || !formData.patientCpf}
                              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                           >
                              Próximo Passo
                           </button>
                        </div>
                     )}

                     {step === 2 && (
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <h2 className="text-xl font-black text-[#0F172A] uppercase">Dados do Serviço</h2>
                              <button onClick={() => setStep(1)} className="text-[10px] font-black text-fiscal-600 uppercase">Voltar</button>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Data</label>
                                 <input type="date" value={formData.serviceDate} onChange={e => setFormData(p => ({ ...p, serviceDate: e.target.value }))} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-accent-500 transition-all font-bold" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Valor</label>
                                 <input type="text" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: formatCurrency(e.target.value) }))} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-accent-500 transition-all font-bold text-fiscal-600" />
                              </div>
                           </div>
                           <button onClick={handleEmit} disabled={loading || !formData.amount} className="w-full py-5 bg-fiscal-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-fiscal-700 transition-all shadow-xl shadow-fiscal-200 active:scale-95 disabled:opacity-50">
                              {loading ? 'Transmitindo...' : 'Finalizar e Emitir'}
                           </button>
                        </div>
                     )}
                  </div>
               </motion.div>
            )}

            {activeTab === 'settings' && (
               <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <h2 className="text-xl font-black text-[#0F172A] uppercase">Setup Fiscal</h2>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">CPF de Emissor Profissional</label>
                        <input type="text" value={configData.professionalCpf} onChange={e => setConfigData(p => ({ ...p, professionalCpf: e.target.value }))} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-accent-500 transition-all font-bold" placeholder="000.000.000-00" />
                     </div>
                     <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Lock size={18} className="text-fiscal-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Certificado A1</span>
                           </div>
                           <span className="text-[8px] px-2 py-1 bg-white/10 rounded-full font-black">PENDENTE</span>
                        </div>
                        <p className="text-[10px] text-white/40 font-bold uppercase leading-relaxed">Necessário para envio automático ao portal e-CAC.</p>
                        <button className="w-full py-4 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest">Subir Arquivo .pfx</button>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'history' && (
               <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  {[1,2,3].map(i => (
                     <div key={i} className="p-5 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-fiscal-600 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-fiscal-50 group-hover:text-fiscal-600 transition-colors">
                              <FileText size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-[#0F172A] uppercase">Recibo #00{i}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">R$ 150,00 • e-CAC Sincronizado</p>
                           </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-fiscal-600 transition-colors" />
                     </div>
                  ))}
               </motion.div>
            )}
         </AnimatePresence>
      </main>

      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-sm bg-white rounded-[3rem] p-10 text-center shadow-2xl">
               <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 uppercase mb-2">Emitido!</h3>
               <div className="space-y-3 mt-8">
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-3">
                     <Printer size={18} /> Imprimir
                  </button>
                  <button className="w-full py-4 bg-fiscal-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-3">
                     <Download size={18} /> Baixar PDF
                  </button>
                  <button onClick={() => { setShowSuccess(false); setStep(1); navigate('/app'); }} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Voltar ao Painel C-Flow</button>
                  <button onClick={() => { setShowSuccess(false); setStep(1); }} className="w-full py-3 bg-white text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:text-slate-600">Nova Emissão</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
