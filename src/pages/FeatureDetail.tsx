import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Plus,
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  CreditCard,
  Zap,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Fingerprint,
  Lock,
  ChevronRight,
  Send
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FeatureDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const features: Record<string, any> = {
    agenda: {
      title: "Agenda Inteligente",
      subtitle: "Gestão otimizada de salas e profissionais",
      icon: Calendar,
      color: "bg-primary-600",
      description: "Esqueça as planilhas e agendas de papel. O C-Flow oferece uma visão 360º de todas as salas e profissionais da sua unidade em tempo real.",
      benefits: [
         "Gestão de salas e equipamentos por horário",
         "Sessões recorrentes e pacotes automáticos",
         "Lista de espera inteligente com encaixe automático",
         "Sincronização com Google Calendar",
         "Bloqueio de horários e feriados personalizado"
      ]
    },
    whatsapp: {
      title: "WhatsApp Business API",
      subtitle: "Automação que converte e reduz faltas",
      icon: MessageSquare,
      color: "bg-emerald-600",
      description: "Integração oficial que permite enviar lembretes, confirmações e links de pagamento automaticamente sem intervenção humana.",
      benefits: [
         "Confirmação automática no WhatsApp (Sim/Não)",
         "Lembretes de 24h e 1h antes do atendimento",
         "Bot interativo para remarcações rápidas",
         "Histórico de conversas centralizado no prontuário",
         "Redução de até 40% nas taxas de no-show"
      ],
      showBot: true
    },
    prontuario: {
      title: "Prontuário Seguro",
      subtitle: "Conformidade total com a LGPD",
      icon: ShieldCheck,
      color: "bg-amber-600",
      description: "Dados sensíveis protegidos por criptografia militar. Evolução clínica com histórico completo e assinatura digital.",
      benefits: [
         "Criptografia AES-256 para todos os anexos",
         "Logs de acesso por usuário (Auditoria total)",
         "Modelos de anamnese customizáveis por especialidade",
         "Assinatura digital integrada (ICP-Brasil)",
         "Armazenamento ilimitado de exames e fotos"
      ]
    },
    financeiro: {
      title: "Financeiro & Repasse",
      subtitle: "Dashboard real-time de faturamento",
      icon: CreditCard,
      color: "bg-indigo-600",
      description: "Controle cada centavo da sua clínica. Repasses automatizados eliminam erros humanos e economizam horas de trabalho manual.",
      benefits: [
         "Cálculo automático de repasse por profissional (%)",
         "Emissão de NF-e e boletos em um clique",
         "Conciliação bancária automática via API",
         "DRE Financeiro e fluxo de caixa projetado",
         "Controle de convênios e faturamento TISS"
      ]
    }
  };

  const currentFeature = features[slug || 'agenda'];

  if (!currentFeature) {
    return <div className="p-20 text-center">Feature não encontrada.</div>;
  }

  const Icon = currentFeature.icon;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
            <span className="text-xl font-bold font-display">C-Flow</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <div className={`w-16 h-16 ${currentFeature.color} text-white rounded-2xl flex items-center justify-center shadow-2xl`}>
                   <Icon size={32} />
                </div>
                <h1 className="text-5xl font-bold font-display tracking-tight">{currentFeature.title}</h1>
                <p className="text-2xl text-slate-400 font-display">{currentFeature.subtitle}</p>
              </div>

              <p className="text-xl text-slate-500 leading-relaxed border-l-4 border-slate-200 pl-6">
                {currentFeature.description}
              </p>

              <div className="space-y-4">
                {currentFeature.benefits.map((benefit: string, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={benefit} 
                    className="flex items-center gap-4 text-slate-600 font-medium"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentFeature.color} text-white shrink-0 shadow-lg shadow-current/20`}>
                       <CheckCircle2 size={14} />
                    </div>
                    {benefit}
                  </motion.div>
                ))}
              </div>

              <div className="pt-8 flex gap-4">
                 <button 
                  onClick={() => navigate('/contato')}
                  className="bg-primary-600 text-white px-10 py-5 rounded-3xl font-bold shadow-2xl shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 uppercase tracking-widest text-sm"
                 >
                    Contratar Agora
                 </button>
                 <button 
                  onClick={() => navigate('/contato')}
                  className="bg-white border border-slate-200 text-slate-700 px-10 py-5 rounded-3xl font-bold hover:bg-slate-50 transition-all uppercase tracking-widest text-sm"
                 >
                    Agendar Demo
                 </button>
              </div>
            </motion.div>

            {/* Visual Representation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
               {slug === 'whatsapp' ? (
                 <BotSimulation />
               ) : slug === 'agenda' ? (
                 <AgendaPreview />
               ) : slug === 'prontuario' ? (
                 <ProntuarioPreview />
               ) : slug === 'financeiro' ? (
                 <FinanceiroPreview />
               ) : (
                 <div className="bg-slate-900 rounded-[3.5rem] p-4 shadow-3xl transform rotate-2">
                    <div className="bg-slate-800 rounded-[3rem] p-10 h-[500px] flex items-center justify-center text-white/10 text-4xl font-black uppercase text-center">
                       Preview {currentFeature.title}
                    </div>
                 </div>
               )}
               {/* Background Glow */}
               <div className={`absolute -inset-10 ${currentFeature.color} blur-[120px] opacity-10 rounded-full -z-10`} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BotSimulation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-[400px] bg-slate-100 rounded-[3rem] overflow-hidden shadow-3xl border-8 border-slate-900">
        <div className="bg-emerald-600 p-6 text-white flex items-center gap-3">
           <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare size={20} />
           </div>
           <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Bot C-Flow</p>
              <p className="font-bold font-display">WhatsApp Business API</p>
           </div>
        </div>
        
        <div className="p-8 space-y-6 h-[400px] overflow-y-auto bg-[#e5ddd5]">
           <motion.div 
             key={step > 0 ? 1 : 0}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]"
           >
              <p className="text-sm font-medium text-slate-800">Olá Maria! 👋 Aqui é do C-Flow. Você tem uma consulta agendada para amanhã às 14:00.</p>
              <p className="text-[10px] text-slate-400 text-right mt-1">10:00</p>
           </motion.div>

           <motion.div 
             key={step > 0 ? 2 : 0}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]"
           >
              <p className="text-sm font-bold text-primary-600 mb-2 underline uppercase tracking-widest text-xs">Pode confirmar sua presença?</p>
              <div className="grid grid-cols-2 gap-2">
                 <button className="bg-emerald-50 text-emerald-600 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 border border-emerald-100">Sim, confirmo</button>
                 <button className="bg-rose-50 text-rose-600 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 border border-rose-100">Não poderei</button>
              </div>
           </motion.div>

           {step > 1 && (
             <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-emerald-100 p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] ml-auto"
             >
                <p className="text-sm font-bold text-emerald-800">Sim, eu confirmo!</p>
                <p className="text-[10px] text-emerald-600/60 text-right mt-1">10:02 ✓✓</p>
             </motion.div>
           )}

           {step > 2 && (
             <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]"
             >
                <p className="text-sm font-medium text-slate-800">Perfeito, Maria! ✅ Sua agenda foi atualizada automaticamente em nosso sistema. Nos vemos amanhã!</p>
                <p className="text-[10px] text-slate-400 text-right mt-1">10:02</p>
             </motion.div>
           )}
        </div>

        <div className="p-4 bg-white flex gap-2">
           <div className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-slate-400 text-xs">Digite uma mensagem...</div>
           <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white">
              <Send size={18} />
           </div>
        </div>
      </div>
    </div>
  );
}

function AgendaPreview() {
  return (
    <div className="bg-slate-900 rounded-[3.5rem] p-8 shadow-3xl transform rotate-2 relative overflow-hidden group">
       <div className="grid grid-cols-3 gap-4 h-[440px]">
          <div className="col-span-1 space-y-4">
             {[1,2,3,4].map(i => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0.3, scale: 0.9 }}
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3], 
                    scale: [0.95, 1, 0.95]
                  }}
                  transition={{ 
                    duration: 3, 
                    delay: i * 0.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-slate-800 rounded-2xl p-4 h-24"
                />
             ))}
          </div>
          <div className="col-span-2 space-y-4 relative">
             <motion.div 
               animate={{ 
                 boxShadow: ["0 0 0px rgba(79, 70, 229, 0)", "0 0 40px rgba(79, 70, 229, 0.4)", "0 0 0px rgba(79, 70, 229, 0)"]
               }}
               transition={{ duration: 4, repeat: Infinity }}
               className="bg-primary-600/20 border border-primary-600/30 rounded-3xl p-6 h-full flex flex-col justify-between relative overflow-hidden"
             >
                <div className="flex justify-between items-start">
                   <div className="space-y-2">
                      <motion.div 
                        animate={{ width: ["30%", "60%", "30%"] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="h-4 bg-primary-400/40 rounded-full" 
                      />
                      <div className="h-2 w-20 bg-primary-400/20 rounded-full" />
                   </div>
                   <motion.div 
                     whileHover={{ rotate: 180 }}
                     className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-950/40"
                   >
                      <Calendar size={24} />
                   </motion.div>
                </div>
                <div className="space-y-4">
                   {[1,2,3,4,5].map(i => (
                      <motion.div 
                        key={i} 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex gap-4 items-center"
                      >
                         <div className="w-16 h-2 bg-white/10 rounded-full shrink-0" />
                         <div className="flex-1 h-2 bg-white/5 rounded-full" />
                         <div className="w-3 h-3 rounded-full bg-primary-500/40 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                      </motion.div>
                   ))}
                </div>
                <motion.div 
                  animate={{ y: [0, -100, 0], x: [0, 20, 0], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute bottom-0 right-1/4 w-2 h-2 bg-white rounded-full blur-[2px]"
                />
             </motion.div>
          </div>
       </div>
       <motion.div 
         initial={{ x: 100, opacity: 0 }}
         animate={{ x: 0, opacity: 1 }}
         transition={{ delay: 1, type: "spring" }}
         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
       >
          <motion.div
            animate={{ scale: [0.9, 1.1, 0.9], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="bg-white p-6 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col items-center gap-4 min-w-[200px]"
          >
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
               <Plus size={32} />
            </div>
            <div className="text-center">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Agendamento Rápido</p>
               <p className="text-sm font-bold text-slate-900 mt-1">Arrastar e Soltar</p>
            </div>
          </motion.div>
       </motion.div>
       <motion.div 
         animate={{ y: [0, -20, 0], rotate: [2, -2, 2] }}
         transition={{ duration: 4, repeat: Infinity }}
         className="absolute bottom-10 right-10 bg-emerald-500 p-5 rounded-3xl shadow-2xl border border-white/20 z-30 flex items-center gap-4"
       >
          <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center">
             <Clock size={20} />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">Encaixe Inteligente</p>
             <p className="text-sm font-bold text-white">Próxima Vaga: 14:00</p>
          </div>
       </motion.div>
    </div>
  );
}

function ProntuarioPreview() {
  return (
    <div className="bg-slate-900 rounded-[3.5rem] p-8 shadow-3xl transform -rotate-1 relative overflow-hidden group">
       <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
       
       <motion.div 
         animate={{ y: [0, 440, 0] }}
         transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
         className="absolute inset-x-0 h-[100px] bg-gradient-to-b from-transparent via-amber-500/10 to-transparent z-10 pointer-events-none"
       />

       <div className="space-y-6 relative z-20">
          <div className="flex items-center justify-between">
             <div className="space-y-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "192px" }}
                  transition={{ duration: 1 }}
                  className="h-6 bg-slate-800 rounded-xl" 
                />
                <div className="h-3 w-32 bg-slate-800/50 rounded-full" />
             </div>
             <motion.div 
               animate={{ rotateY: [0, 360] }}
               transition={{ duration: 5, repeat: Infinity }}
               className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]"
             >
                <Lock size={28} />
             </motion.div>
          </div>
          
          <div className="bg-slate-800 rounded-[2.5rem] p-8 space-y-10 border border-slate-700/50">
             <div className="space-y-3">
                {[1,2,3].map(i => (
                  <motion.div 
                    key={i}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.2 }}
                    style={{ originX: 0 }}
                    className={`h-2 bg-slate-700 rounded-full ${i === 2 ? 'w-[90%]' : i === 3 ? 'w-[80%]' : 'w-full'}`}
                  />
                ))}
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="h-32 bg-slate-900/50 rounded-3xl border border-slate-700/80 flex flex-col items-center justify-center gap-3"
                >
                   <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                      <ShieldCheck size={20} className="text-amber-500" />
                   </div>
                   <div className="text-white/40 uppercase text-[8px] font-black tracking-[0.2em] px-4 text-center">AES-256 Military Grade</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="h-32 bg-slate-900/50 rounded-3xl border border-slate-700/80 flex flex-col items-center justify-center gap-3 overflow-hidden relative"
                >
                   <motion.div 
                     animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
                     transition={{ duration: 3, repeat: Infinity }}
                     className="absolute inset-0 bg-primary-500/5"
                   />
                   <Fingerprint size={28} className="text-primary-400 relative z-10" />
                   <div className="text-white/40 uppercase text-[8px] font-black tracking-[0.2em] relative z-10">Multi-Factor</div>
                </motion.div>
             </div>
          </div>
          
          <div className="flex justify-between items-center px-4">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-white/40">U</div>
                ))}
             </div>
             <motion.div 
               animate={{ 
                 backgroundColor: ["rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.3)", "rgba(16, 185, 129, 0.1)"]
               }}
               transition={{ duration: 2, repeat: Infinity }}
               className="text-emerald-500 px-6 py-3 rounded-2xl border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"
             >
                <CheckCircle2 size={14} /> Assinado: ICP-Brasil
             </motion.div>
          </div>
       </div>
    </div>
  );
}

function FinanceiroPreview() {
  return (
    <div className="bg-slate-900 rounded-[3.5rem] p-8 shadow-3xl transform rotate-1 relative overflow-hidden">
       <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-indigo-600/20 border border-indigo-600/30 rounded-3xl p-6">
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">Faturamento Total</p>
                <div className="text-2xl font-bold text-white font-display">R$ 42.850,00</div>
             </div>
             <div className="bg-emerald-600/20 border border-emerald-600/30 rounded-3xl p-6">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-2">Repasses Pendentes</p>
                <div className="text-2xl font-bold text-white font-display">02</div>
             </div>
          </div>
          <div className="bg-slate-800 rounded-3xl p-8 relative overflow-hidden h-[260px]">
             <div className="flex items-end gap-2 h-full">
                {[40, 70, 45, 90, 65, 80, 50, 75, 55, 95].map((h, i) => (
                   <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="flex-1 bg-gradient-to-t from-indigo-600 to-primary-400 rounded-t-lg opacity-80"
                   />
                ))}
             </div>
             <div className="absolute inset-x-8 top-12 flex justify-between">
                <div className="h-[1px] w-full bg-slate-700" />
             </div>
             <div className="absolute inset-x-8 top-32 flex justify-between">
                <div className="h-[1px] w-full bg-slate-700" />
             </div>
          </div>
          <motion.div 
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center justify-between"
          >
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                   <CreditCard size={16} />
                </div>
                <p className="text-xs font-bold text-slate-300">DRE Automático Gerado</p>
             </div>
             <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Baixar PDF</div>
          </motion.div>
       </div>
    </div>
  );
}
