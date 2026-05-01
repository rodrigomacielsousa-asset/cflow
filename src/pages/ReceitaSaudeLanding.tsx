import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone,
  Globe,
  Lock,
  MessageCircle,
  QrCode,
  FileText,
  ChevronDown,
  LayoutDashboard,
  Home,
  Clock,
  Printer,
  ChevronRight,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReceitaSaudeLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-accent-100 selection:text-accent-900">
      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/55000000000" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[60] bg-emerald-500 text-white p-4 rounded-3xl shadow-2xl shadow-emerald-200 hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageCircle size={32} />
        <span className="absolute right-full mr-4 bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Fale com um especialista
        </span>
      </a>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-accent-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent-950/20">
              <FileCheck size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              Receita<span className="text-accent-600">Saúde</span>
              <span className="ml-1 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full not-italic">EXPRESS</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors"
             >
                <Home size={14} /> Voltar ao Início
             </button>
             <div className="h-4 w-px bg-slate-200 hidden sm:block" />
             <button 
                onClick={() => navigate('/app')}
                className="hidden sm:flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
             >
                <LayoutDashboard size={14} /> Painel C-Flow
             </button>
             <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Entrar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-600 rounded-full text-xs font-bold uppercase tracking-widest"
            >
              <Zap size={14} /> Emita em 30 segundos
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1] uppercase"
            >
              Emita recibos do <span className="text-accent-600 underline decoration-accent-200 underline-offset-8">Receita Saúde</span> em 30 segundos e fique 100% legal com o Leão.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl text-slate-500 font-bold text-lg uppercase tracking-tight leading-snug"
            >
              EVITE MULTAS E O CRUZAMENTO DE DADOS DA RECEITA FEDERAL. A SOLUÇÃO INTEGRADA PARA PROFISSIONAIS DA SAÚDE QUE NÃO TÊM TEMPO A PERDER COM CONTABILIDADE.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <button 
                onClick={() => navigate('/receita-saude/dashboard')}
                className="w-full sm:w-auto px-10 py-5 bg-fiscal-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-fiscal-950/20 hover:bg-fiscal-700 transition-all group scale-100 hover:scale-105 active:scale-95"
              >
                Gerar Primeiro Recibo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                       <User size={16} className="text-slate-400" />
                    </div>
                 ))}
                 <div className="pl-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">+500 Psicólogos</p>
                    <p className="text-[10px] font-black text-fiscal-500 uppercase tracking-widest">Emitindo agora</p>
                 </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ 
               opacity: 1, 
               scale: [1, 1.02, 1], 
               rotate: [0, 1, 0, -1, 0],
               y: [0, -10, 0]
            }}
            transition={{ 
               opacity: { duration: 0.5 },
               scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
               rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" },
               y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative"
          >
             {/* Dynamic Floating Elements */}
             <motion.div 
               animate={{ 
                 y: [0, -20, 0],
                 rotate: [0, 15, 0]
               }}
               transition={{ duration: 5, repeat: Infinity }}
               className="absolute -top-12 -right-12 z-20 bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-3"
             >
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                   <CheckCircle2 size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                   <p className="text-sm font-bold text-slate-900">Transmitido!</p>
                </div>
             </motion.div>

             <motion.div 
               animate={{ 
                 y: [0, 25, 0],
                 x: [0, 15, 0]
               }}
               transition={{ duration: 7, repeat: Infinity, delay: 1 }}
               className="absolute -bottom-10 -left-10 z-20 bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-3"
             >
                <div className="w-10 h-10 bg-accent-50 text-accent-600 rounded-xl flex items-center justify-center">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase">Segurança</p>
                   <p className="text-sm font-bold text-slate-900">Criptografia A1</p>
                </div>
             </motion.div>

             {/* Simple Mockup */}
             <div className="relative mx-auto w-[320px] aspect-[9/19] bg-slate-900 rounded-[3rem] p-3 shadow-2xl shadow-slate-200">
                <motion.div 
                   animate={{ y: [0, 440, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-x-0 h-1 bg-accent-500/30 z-30 blur-sm pointer-events-none"
                />
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col relative">
                   <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="w-8 h-8 bg-accent-100 rounded-lg" />
                      <div className="h-2 w-20 bg-slate-200 rounded-full" />
                   </div>
                   <div className="p-6 space-y-6 flex-1">
                      <motion.div 
                        animate={{ opacity: [1, 0.6, 1], scale: [1, 0.98, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2"
                      >
                         <QrCode className="text-slate-300" size={32} />
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Validando...</span>
                      </motion.div>
                      <div className="space-y-3">
                         {[1,2,3,4].map(i => (
                            <motion.div 
                              key={i}
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ delay: i * 0.3 }}
                              className="h-2 bg-slate-100 rounded-full" 
                            />
                         ))}
                      </div>
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 2.5 }}
                        className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3"
                      >
                         <CheckCircle2 className="text-emerald-500" size={16} />
                         <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">Recibo Próximo ao Envio</span>
                      </motion.div>
                   </div>
                   <div className="p-6">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-fiscal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-fiscal-200"
                      >
                        Transmitir e-CAC
                      </motion.button>
                   </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute -right-8 top-1/4 w-16 h-16 bg-fiscal-100 rounded-full blur-2xl opacity-60" />
                <div className="absolute -left-12 bottom-1/4 w-accent-100 rounded-full blur-3xl opacity-40" />
             </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Benefits Section */}
      <section className="py-12 bg-slate-900 text-white overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full bg-accent-600/5" />
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Benefit icon={<ShieldCheck size={20} />} text="Assinatura digital inclusa & rastreável" />
               <Benefit icon={<MessageCircle size={20} />} text="Envio direto por WhatsApp para o paciente" />
               <Benefit icon={<FileText size={20} />} text="Relatório mensal pronto para o IRPF" />
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 border-y border-slate-100 px-6" id="features">
        <div className="max-w-7xl mx-auto space-y-16">
           <div className="text-center space-y-4">
              <h2 className="text-xs font-black text-fiscal-600 uppercase tracking-[0.3em]">Por que escolher o Receita Saúde?</h2>
              <p className="text-3xl font-black text-slate-900 uppercase tracking-tight">O fim dos problemas com o Leão</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <FeatureCard 
               icon={<Smartphone className="text-fiscal-600" />}
               title="Foco em Celular"
               description="Interface ultra-rápida desenhada para o profissional que emite o recibo entre uma sessão e outra."
             />
             <FeatureCard 
               icon={<ShieldCheck className="text-emerald-500" />}
               title="Conformidade Total 2026"
               description="ATUALIZADO COM AS NORMAS DE 2026. Recibos gerados com QR Code e estrutura exigida pelo e-CAC."
             />
             <FeatureCard 
               icon={<Globe className="text-accent-500" />}
               title="API e Widgets"
               description="Integre em seu site ou sistema atual com apenas uma linha de código. Transparente e seguro."
             />
           </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
         <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
               <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Tirando Dúvidas</h2>
               <p className="text-3xl font-black text-slate-900 uppercase tracking-tight">Perguntas Frequentes</p>
            </div>
            <div className="space-y-4">
               <FaqItem 
                 question="Serve para quem é pessoa física (CPF)?" 
                 answer="Sim! O Receita Saúde foi desenhado especificamente para o profissional autônomo (PF) e também para quem possui Clínica (PJ). Ele automatiza os dados necessários para sua declaração."
               />
               <FaqItem 
                 question="Gera as informações para o Carnê-Leão?" 
                 answer="Com certeza. Ao final de cada mês, o sistema consolida todas as emissões em um relatório estruturado que facilita o preenchimento do Carnê-Leão Web no portal e-CAC."
               />
               <FaqItem 
                 question="O recibo tem validade jurídica?" 
                 answer="Sim, todos os recibos são emitidos em conformidade com as normas vigentes, incluem assinatura digital do sistema e QR Code para validação de autenticidade pelo paciente/receita."
               />
            </div>
         </div>
      </section>

      {/* Pricing / CTA */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[4rem] p-8 md:p-16 text-center space-y-12 relative overflow-hidden shadow-2xl shadow-slate-200">
          <div className="absolute top-0 left-0 w-full h-full bg-accent-600/10 pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
               Simplifique sua vida contábil agora.
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Escolha o melhor plano para o seu momento:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="p-12 bg-white/5 rounded-[4rem] border border-white/10 backdrop-blur-md flex flex-col items-center text-center group hover:bg-white/10 transition-all">
              <p className="text-[10px] font-black text-fiscal-400 uppercase tracking-widest mb-4">Lite (Apenas Recibos)</p>
              <div className="flex items-baseline gap-1 mb-2">
                 <span className="text-2xl font-black text-white/50 lowercase">r$</span>
                 <span className="text-7xl md:text-8xl font-black text-white tracking-tighter">29,90</span>
                 <span className="text-sm font-medium text-white/50 not-italic uppercase tracking-widest">/mês</span>
              </div>
              <p className="text-[12px] text-white/40 font-black uppercase mt-4 mb-8 tracking-[0.2em]">Pessoa Física (CPF) & Jurídica (PJ)</p>
              <button 
                 onClick={() => navigate('/receita-saude/dashboard')}
                 className="w-full py-6 bg-white text-slate-900 rounded-3xl font-black uppercase tracking-widest hover:bg-fiscal-600 hover:text-white transition-all shadow-xl"
              >
                 Assinar Lite Agora
              </button>
            </div>
            
            <div className="p-8 bg-fiscal-600 rounded-[3rem] shadow-2xl shadow-fiscal-200/20 flex flex-col items-center text-center relative">
              <div className="absolute -top-4 bg-white text-fiscal-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">MAIS COMPLETO</div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Completo (Sistema C-Flow)</p>
              <div className="mb-2">
                 <span className="text-5xl font-black text-white">Já Incluso</span>
              </div>
              <p className="text-[10px] text-white/80 font-bold uppercase mt-2 mb-8">Para quem assina o sistema de gestão</p>
              <button 
                 onClick={() => navigate('/contato')}
                 className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
              >
                 Ver Planos C-Flow
              </button>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 relative z-10 flex flex-wrap justify-center gap-8">
             <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-fiscal-600" /> Cancelamento Grátis
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-fiscal-600" /> Sem Carência
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-fiscal-600" /> Suporte 24/7
             </div>
          </div>
        </div>
      </section>

      <footer className="py-16 border-t border-slate-100 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <FileCheck size={18} />
                  </div>
                  <span className="text-sm font-black tracking-tighter uppercase">Receita Saúde</span>
               </div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 Tecnologia C-Flow LTDA</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
               <button onClick={() => navigate('/')} className="hover:text-fiscal-500 transition-colors">Voltar ao Clinic Flow</button>
               <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-fiscal-500 transition-colors">Emissão Expressa</button>
               <button onClick={() => navigate('/receita-saude/dashboard')} className="hover:text-fiscal-500 transition-colors underline underline-offset-4 decoration-fiscal-200">Painel de Controle</button>
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="text-left space-y-6 p-10 rounded-[3rem] bg-white border border-slate-100 hover:border-fiscal-100 transition-all shadow-sm hover:shadow-xl hover:shadow-fiscal-100/20 group">
      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-0 text-3xl shadow-sm border border-slate-100 group-hover:bg-fiscal-50 group-hover:scale-110 transition-all">
        {icon}
      </div>
      <div className="space-y-3">
         <h3 className="text-lg font-black text-slate-900 uppercase leading-none">{title}</h3>
         <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tight">{description}</p>
      </div>
      <ChevronRight size={20} className="text-slate-200 group-hover:text-fiscal-500 transition-colors" />
    </div>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode, text: string }) {
   return (
      <div className="flex items-center gap-4 group">
         <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-fiscal-500 group-hover:bg-fiscal-500 group-hover:text-white transition-all">
            {icon}
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">{text}</span>
      </div>
   );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
   const [open, setOpen] = useState(false);
   return (
      <div className="border border-slate-100 rounded-3xl overflow-hidden">
         <button 
            onClick={() => setOpen(!open)}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
         >
            <span className="text-sm font-black text-slate-900 uppercase">{question}</span>
            <ChevronDown size={20} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
         </button>
         <AnimatePresence>
            {open && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="px-6 pb-6"
               >
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tight leading-relaxed pl-1 border-l-2 border-fiscal-500">
                     {answer}
                  </p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}
