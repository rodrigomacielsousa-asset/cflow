import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  ChevronRight, 
  Users, 
  Activity, 
  CreditCard,
  CheckCircle2,
  Menu,
  X,
  FileCheck,
  FileText,
  Lock,
  HeartHandshake,
  Sparkles,
  ArrowUp,
  MessageCircle,
  TrendingUp,
  Clock,
  Quote,
  Brain,
  GraduationCap,
  Apple
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Clínica Médio Porte');
  const [modalType, setModalType] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const legalContent: Record<string, any> = {
    terms: {
      title: 'Termos de Uso',
      icon: FileText,
      content: 'Estes termos regem o uso da plataforma Clinic Flow. Ao utilizar nossos serviços, você aceita integralmente as normas de segurança, privacidade e responsabilidade técnica. O software é fornecido na modalidade SaaS (Software as a Service), com licenciamento mensal. A clínica é responsável pela veracidade dos dados sensíveis inseridos, enquanto o Clinic Flow garante a integridade da infraestrutura e backups redundantes. Alterações nestes termos serão notificadas com 30 dias de antecedência.'
    },
    privacy: {
      title: 'Política de Privacidade',
      icon: Lock,
      content: 'Sua privacidade é inegociável. O Clinic Flow adota criptografia de ponta a ponta (AES-256) para todos os dados clínicos e financeiros. Não coletamos, vendemos ou compartilhamos informações de pacientes com terceiros para fins publicitários. O acesso aos dados é restrito a usuários autorizados pela própria clínica, com logs detalhados de auditoria. Cumprimos rigorosamente os padrões internacionais de segurança em nuvem.'
    },
    lgpd: {
      title: 'Conformidade LGPD',
      icon: ShieldCheck,
      content: 'Estamos 100% adequados à Lei Geral de Proteção de Dados (Lei 13.709/2018). Implementamos o "Privacy by Design" em cada funcionalidade. Oferecemos ferramentas para gestão de consentimento, direito ao esquecimento e portabilidade de dados. Nosso Data Protection Officer (DPO) monitora constantemente as práticas de tratamento para assegurar que sua clínica opere com segurança jurídica total perante a ANPD.'
    },
    contact: {
      title: 'Fale Conosco',
      icon: MessageCircle,
      content: 'Nossa equipe de suporte e vendas está pronta para te atender. WhatsApp: (65) 99920-58727 | E-mail: contato@clinicasflow.com.br. Atendimento de Segunda a Sexta, das 08h às 18h.'
    },
    about: {
      title: 'Sobre o Clinic Flow',
      icon: HeartHandshake,
      content: 'Nascemos da necessidade de simplificar a vida de profissionais de saúde. O Clinic Flow é uma plataforma robusta, segura e inteligente, desenhada para que você foque no que importa: seus pacientes. Somos mais que um software, somos seu parceiro estratégico no crescimento da sua clínica.'
    },
    feature: {
      title: 'Detalhes do Recurso',
      icon: Zap,
      content: 'Este recurso foi desenhado para otimizar o fluxo de trabalho da sua recepção. Integrando APIs modernas para comunicação e processamento de dados em tempo real.'
    },
    demo: {
      title: 'Demonstração Interativa',
      icon: HeartHandshake,
      content: 'A demonstração completa é realizada através de um ambiente sandbox. Entre em contato ou clique em "Começar Agora" para criar sua própria instância gratuita de testes por 14 dias!'
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FB] text-[#0F172A] selection:bg-primary-100 selection:text-primary-900">
      {/* Popups */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                       {(() => {
                         const Icon = legalContent[modalType]?.icon || Zap;
                         return <Icon size={24} />;
                       })()}
                    </div>
                    <h2 className="text-2xl font-bold font-display tracking-tight">{legalContent[modalType]?.title || 'Informação'}</h2>
                 </div>
                 <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                 </button>
              </div>
              <div className="p-8 space-y-4">
                 <p className="text-slate-600 leading-relaxed text-lg">
                    {legalContent[modalType]?.content || 'Conteúdo em desenvolvimento...'}
                 </p>
                 {modalType === 'contact' && (
                    <div className="pt-6 border-t border-slate-100 space-y-4">
                       <a 
                        href="https://wa.me/55659992058727" 
                        target="_blank"
                        className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                       >
                         <MessageCircle size={20} /> Conversar no WhatsApp
                       </a>
                       <button 
                        onClick={() => setModalType(null)}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                       >
                         Fechar
                       </button>
                    </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Elements */}
      <div className="fixed bottom-8 right-8 z-[90] flex flex-col gap-4">
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-14 h-14 bg-white border border-slate-200 text-slate-600 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-50 transition-all"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
        <a 
          href="https://wa.me/55659992058727" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95"
        >
          <MessageCircle size={28} />
        </a>
      </div>

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2F80ED] border-b border-white/10 shadow-lg transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#2F80ED] font-bold text-xl shadow-lg font-display">
              CF
            </div>
            <span className="text-2xl font-bold font-display tracking-tight cursor-pointer text-white" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Clinic Flow</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-semibold text-white/90 hover:text-white hover:underline decoration-white/30 underline-offset-4 transition-all">Sobre Nós</a>
            <a href="#features" className="text-sm font-semibold text-white/90 hover:text-white hover:underline decoration-white/30 underline-offset-4 transition-all">Funcionalidades</a>
            <a href="#specialties" className="text-sm font-semibold text-white/90 hover:text-white hover:underline decoration-white/30 underline-offset-4 transition-all">Especialidades</a>
            <a href="#pricing" className="text-sm font-semibold text-white/90 hover:text-white hover:underline decoration-white/30 underline-offset-4 transition-all">Planos</a>
            <button 
              onClick={() => navigate('/contato')}
              className="text-sm font-semibold text-white/90 hover:text-white hover:underline decoration-white/30 underline-offset-4 transition-all"
            >
              Contato
            </button>
            <div className="h-4 w-px bg-white/20" />
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-[#2F80ED] border border-primary-100 px-6 py-2.5 rounded-full text-sm font-bold shadow-xl hover:bg-slate-50 transition-all active:scale-95"
            >
              Login Clínica
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#2F80ED] border-b border-white/10 p-6 absolute top-20 left-0 right-0 space-y-4 shadow-xl text-white"
          >
            <a href="#about" className="block text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Sobre Nós</a>
            <a href="#features" className="block text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Funcionalidades</a>
            <a href="#specialties" className="block text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Especialidades</a>
            <a href="#pricing" className="block text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Planos</a>
            <button 
              onClick={() => { navigate('/contato'); setIsMenuOpen(false); }} 
              className="block text-lg font-bold text-left w-full"
            >
              Contato
            </button>
            <button onClick={() => navigate('/login')} className="w-full bg-white text-[#2F80ED] py-4 rounded-2xl font-bold">Login Clínica</button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-primary-100">
              <Zap size={14} />
              Software para Clínicas Modernas
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold font-display tracking-tight text-[#0F172A] leading-[0.95] mb-8">
              A gestão da sua clínica no <span className="text-primary-500">fluxo perfeito.</span>
            </h1>
            <p className="text-xl text-[#64748B] mb-10 max-w-xl leading-relaxed">
              <span className="font-bold text-[#0F172A]">Clinic Flow – Gestão Completa para Clínicas Multiprofissionais (C-Flow).</span> Especialmente desenhado para clínicas de psicologia e saúde integradas. Automatize sua agenda, integre o WhatsApp e organize seu financeiro para que você foque no que importa: <span className="font-bold text-slate-700">seus pacientes.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/contato')}
                className="group flex items-center justify-center gap-3 bg-primary-500 text-white px-10 py-5 rounded-3xl text-lg font-bold shadow-2xl shadow-primary-200 hover:bg-primary-600 transition-all hover:scale-[1.02] active:scale-100"
              >
                Teste de 14 dias grátis
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/contato')}
                className="flex items-center justify-center gap-3 bg-white border border-primary-200 px-10 py-5 rounded-3xl text-lg font-bold text-primary-500 hover:bg-slate-50 transition-all shadow-sm"
              >
                Ver Demonstração
              </button>
            </div>
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=a${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-900">+500 profissionais</span> já confiam no Clinic Flow
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative px-10" // Added padding to avoid clipping floating elements
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary-200/30 to-secondary-500/30 blur-3xl opacity-50 rounded-full" />
            <div className="relative bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 p-4 transform rotate-1 overflow-hidden">
               <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" 
                alt="App Dashboard Preview" 
                className="rounded-[2.5rem] w-full"
              />
            </div>
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 z-20"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmação</p>
                <p className="text-sm font-bold text-slate-900">Paciente confirmou!</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 z-20"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financeiro</p>
                <p className="text-sm font-bold text-slate-900">Repasse efetuado!</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute top-1/2 -right-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 z-30"
            >
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700">Prontuário Seguro ✅</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-slate-900 mb-6">Tudo o que você precisa em <br />um único lugar.</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Desenvolvido por quem entende as dores de uma clínica profissional.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <FeatureCard 
                icon={FileCheck} 
                title="Receita Saúde Express" 
                desc="Emita recibos digitais obrigatórios (e-CAC) em 30 segundos pelo celular e fique 100% legal com o Leão." 
                className="md:col-span-2"
                color="bg-rose-500"
                onInfo={() => navigate('/receita-saude')}
             />
             <FeatureCard 
                icon={MessageSquare} 
                title="WhatsApp Business API" 
                desc="Lembretes e confirmações automáticas com bot interativo." 
                color="bg-emerald-500"
                onInfo={() => navigate('/features/whatsapp')}
             />
             <FeatureCard 
                icon={ShieldCheck} 
                title="Prontuário Seguro" 
                desc="Conformidade LGPD e criptografia end-to-end para dados sensíveis." 
                color="bg-amber-500"
                onInfo={() => navigate('/features/prontuario')}
             />
             <FeatureCard 
                icon={CreditCard} 
                title="Financeiro & Repasse" 
                desc="Cálculo automático de repasse por profissional e DRE completo." 
                color="bg-indigo-500"
                onInfo={() => navigate('/features/financeiro')}
             />
             <FeatureCard 
                icon={Calendar} 
                title="Agenda Inteligente" 
                desc="Gestão de salas, profissionais e sessões recorrentes automática." 
                color="bg-primary-500"
                onInfo={() => navigate('/features/agenda')}
             />
          </div>

          <div className="mt-16 p-8 bg-primary-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary-200 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -z-0" />
             <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase tracking-tight">Precisa apenas dos recibos?</h3>
                <p className="text-primary-100 font-medium">Adquira o <span className="font-black text-white underline decoration-white/30 decoration-2 underline-offset-4">Receita Saúde Express</span> separadamente por apenas R$ 29,90/mês.</p>
             </div>
             <button 
              onClick={() => navigate('/receita-saude')}
              className="relative z-10 px-8 py-4 bg-white text-primary-600 rounded-2xl font-black uppercase tracking-widest hover:bg-primary-50 transition-all shadow-xl active:scale-95 whitespace-nowrap"
             >
                Ver Produto Separado
             </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-10">Clínicas que confiam no Clinic Flow</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale">
             <span className="text-2xl font-black text-slate-400 font-display">Clínica INFLUENCIAR</span>
             <span className="text-2xl font-black text-slate-400 font-display">Clínica FOCUS</span>
             <span className="text-2xl font-black text-slate-400 font-display">INTEGRA</span>
             <span className="text-2xl font-black text-slate-400 font-display">MINDCARE</span>
             <span className="text-2xl font-black text-slate-400 font-display">CLINIC+</span>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary-100/30 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 font-display">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Quem já confia no Clinic Flow</h2>
            <p className="text-slate-500 font-medium">Clínicas que escolheram fluxo, organização e previsibilidade.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              text="“A agenda recorrente trouxe previsibilidade e reduziu significativamente as faltas dos nossos pacientes.”"
              author="Dra. Helena Souza"
              role="Psicóloga Clínica • Clínica Harmonia"
              image="https://i.pravatar.cc/150?u=helena"
            />
            <TestimonialCard 
              text="“Hoje conseguimos focar 100% no atendimento humanizado, sem nos preocuparmos com planilhas ou burocracia.”"
              author="Dr. Ricardo Mendes"
              role="Gestor • Centro Integrado de Saúde"
              image="https://i.pravatar.cc/150?u=ricardo"
            />
            <TestimonialCard 
              text="“Nossa recepção ganhou muito tempo com as confirmações automáticas por WhatsApp. Mudou nossa rotina.”"
              author="Mariana Lins"
              role="Secretária Executiva • Clínica Psiquê"
              image="https://i.pravatar.cc/150?u=mariana"
            />
          </div>
        </div>
      </section>

      {/* Specialty Section */}
      <section id="specialties" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
           <div className="col-span-1">
             <h2 className="text-4xl font-bold font-display tracking-tight mb-8 uppercase underline decoration-primary-600 decoration-4 underline-offset-8">Multidisciplinar por natureza.</h2>
             <div className="space-y-4">
                <SpecialtyItem 
                  title="Psicologia" 
                  desc="Controle de recorrência semanal e prontuários focados em evolução clínica. A base do nosso ecossistema." 
                  icon={Users}
                  featured
                />
                <SpecialtyItem 
                  title="Fonoaudiologia" 
                  desc="Gestão de fonoterapia, audiometria e acompanhamento de desenvolvimento da fala e linguagem." 
                  icon={MessageSquare}
                />
                <SpecialtyItem 
                  title="Neuropsicologia" 
                  desc="Protocolos específicos para avaliações neurocognitivas e reabilitação de funções executivas." 
                  icon={Brain}
                />
                <SpecialtyItem 
                  title="Psicopedagogia" 
                  desc="Foco em dificuldades de aprendizagem, com relatórios pedagógicos integrados ao prontuário." 
                  icon={GraduationCap}
                />
                <SpecialtyItem 
                  title="Nutricionista" 
                  desc="Planos alimentares, bioimpedância e acompanhamento nutricional integrado ao histórico do paciente." 
                  icon={Apple}
                />
             </div>
           </div>
           <div className="bg-white border border-primary-100 rounded-[3rem] p-12 text-[#0F172A] relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary-50 blur-[120px]" />
              <h3 className="text-2xl font-bold mb-6 font-display uppercase tracking-tight">Gestão Multi-unidade</h3>
              <p className="text-[#64748B] mb-8 leading-relaxed font-bold text-lg">Nossa arquitetura permite gerenciar diversas clínicas em locais diferentes sob o mesmo painel mestre, mantendo dados isolados mas faturamento centralizado.</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-primary-50 border border-primary-100 rounded-[2rem] group hover:bg-white transition-colors">
                   <p className="text-4xl font-bold mb-1 font-display text-primary-500">100%</p>
                   <p className="text-[10px] text-primary-400 uppercase font-bold tracking-[0.2em] mt-2">Nuvem Segura</p>
                </div>
                <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem] group hover:bg-white transition-colors">
                   <p className="text-4xl font-bold mb-1 font-display text-emerald-500">-40%</p>
                   <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-[0.2em] mt-2">No-Shows</p>
                </div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600" 
                alt="Clinic Management" 
                className="mt-12 rounded-2xl opacity-80 hover:opacity-100 transition-all duration-700 w-full"
              />
           </div>
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="py-32 px-6 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto">
           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative order-2 lg:order-1"
              >
                 <div className="absolute -inset-10 bg-primary-100/50 blur-[100px] rounded-full" />
                 <div className="relative aspect-square bg-primary-100 rounded-[4rem] overflow-hidden shadow-2xl rotate-3 group">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" 
                      alt="Modern Medical Office" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-950/20 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10">
                       <p className="text-3xl font-bold font-display text-[#0F172A] mb-2 leading-tight">Humanizando a tecnologia na saúde.</p>
                       <p className="text-[#64748B]">Desde 2026 transformando realidades odontológicas, psicológicas e médicas.</p>
                    </div>
                 </div>
              </motion.div>
              <div className="space-y-8 order-1 lg:order-2">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles size={14} /> Quem Somos
                 </div>
                 <h2 className="text-5xl font-bold font-display tracking-tight leading-[1.1] uppercase">Uma plataforma nascida para quem <span className="text-primary-600">cuida.</span></h2>
                 <p className="text-xl text-slate-500 leading-relaxed">
                    O Clinic Flow não é apenas um software de gestão. É o resultado de anos observando o caos administrativo em clínicas de diversos tamanhos. 
                    Nossa missão é devolver o tempo aos profissionais de saúde, automatizando o que é burocrático e potencializando o que é humano.
                 </p>
                 <div className="grid grid-cols-2 gap-8 pt-6">
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl">
                       <p className="text-4xl font-bold font-display text-primary-600">500+</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Clínicas Parceiras</p>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl">
                       <p className="text-4xl font-bold font-display text-primary-600">1M+</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Agendamentos</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 blur-[120px] -z-0" />
        <div className="relative z-10 max-w-7xl mx-auto text-slate-900">
          <div className="text-center mb-20 font-display">
            <h2 className="text-4xl font-bold tracking-tight mb-4 uppercase">Escolha o plano ideal para crescer.</h2>
            <p className="text-slate-500 mb-6 font-medium">Preços competitivos para o mercado profissional da saúde.</p>
            <div className="inline-flex items-center gap-4 py-2.5 px-8 bg-primary-50 rounded-full border border-primary-100 text-[10px] font-bold uppercase tracking-widest text-primary-600">
               <span>Sem fidelidade</span>
               <span className="w-1 h-1 bg-primary-200 rounded-full" />
               <span>Cancele quando quiser</span>
               <span className="w-1 h-1 bg-primary-200 rounded-full" />
               <span>Suporte especializado</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard 
                name="Profissional Autônomo" 
                price="149,90" 
                isActive={activeTab === 'Profissional Autônomo'}
                onClick={() => setActiveTab('Profissional Autônomo')}
                features={['1 profissional', 'Agenda completa', 'WhatsApp API Incluso', 'Prontuário especializado', 'Receita Saúde Express Incluso']} 
                onAction={() => navigate('/contato')}
            />
            <PricingCard 
                name="Clínica Médio Porte" 
                price="499,90" 
                featured
                isActive={activeTab === 'Clínica Médio Porte'}
                onClick={() => setActiveTab('Clínica Médio Porte')}
                features={['Até 8 profissionais', 'Financeiro Automático', 'Gestão de Repasses', 'Receita Saúde Express Incluso', 'Multi-unidade basic', 'Suporte Prioritário']} 
                onAction={() => navigate('/contato')}
            />
            <PricingCard 
                name="Clínica Enterprise" 
                price="999,90" 
                isActive={activeTab === 'Clínica Enterprise'}
                onClick={() => setActiveTab('Clínica Enterprise')}
                features={['Profissionais Ilimitados', 'Multi-unidade Premium', 'Customização White Label', 'Treinamento de Equipe']} 
                onAction={() => navigate('/contato')}
            />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-[#F3F7FB] py-24 px-6 border-t border-slate-200">
         <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-primary-200 mb-10 font-display">
              CF
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight mb-6 uppercase text-[#0F172A]">Pronto para transformar sua clínica?</h2>
            <p className="text-[#64748B] mb-10 max-w-md font-medium text-center">Junte-se a centenas de gestores que recuperaram a paz com o Clinic Flow.</p>
            <button 
              onClick={() => navigate('/contato')}
              className="bg-primary-500 text-white px-12 py-5 rounded-3xl text-xl font-bold shadow-2xl shadow-primary-200 hover:bg-primary-600 transition-all active:scale-95 mb-24"
            >
              Começar Teste de 14 Dias
            </button>
            
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-12 text-left mb-16 pt-16 border-t border-slate-200">
               <div className="col-span-2 md:col-span-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">CF</div>
                    <span className="font-bold text-xl uppercase tracking-tighter">Clinic Flow</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">A gestão inteligente para clínicas de psicologia e saúde integrativa.</p>
               </div>
               <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-slate-900">Solução</h4>
                  <ul className="space-y-4 text-sm font-medium text-slate-500">
                     <li><a href="#features" className="hover:text-primary-500 transition-colors">Funcionalidades</a></li>
                     <li><button onClick={() => navigate('/receita-saude')} className="hover:text-primary-500 transition-colors">Receita Saúde</button></li>
                     <li><button onClick={() => navigate('/login')} className="hover:text-primary-500 transition-colors">Área Logada</button></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-slate-900">Suporte</h4>
                  <ul className="space-y-4 text-sm font-medium text-slate-500">
                     <li><button onClick={() => setModalType('contact')} className="hover:text-primary-500 transition-colors">WhatsApp Suporte</button></li>
                     <li><a href="#about" className="hover:text-primary-500 transition-colors">Central de Ajuda</a></li>
                     <li><a href="#pricing" className="hover:text-primary-500 transition-colors">Demonstração</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-slate-900">Legal</h4>
                  <ul className="space-y-4 text-sm font-medium text-slate-500">
                     <li><button onClick={() => setModalType('terms')} className="hover:text-primary-500 transition-colors">Termos de Uso</button></li>
                     <li><button onClick={() => setModalType('privacy')} className="hover:text-primary-500 transition-colors">Privacidade</button></li>
                     <li><button onClick={() => setModalType('lgpd')} className="hover:text-primary-500 transition-colors">Conformidade LGPD</button></li>
                  </ul>
               </div>
            </div>

            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-200">
               <div className="flex flex-col items-center md:items-start text-sm text-slate-400 font-medium">
                  <p>© 2026 Clinic Flow. Todos os direitos reservados. www.clinicasflow.com.br</p>
                  <p className="flex items-center gap-2 mt-1">
                     <ShieldCheck size={14} className="text-emerald-500" />
                     Dados seguros • Conformidade LGPD
                  </p>
               </div>
               <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                    <ShieldCheck size={16} className="text-slate-400" />
                  </div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, className, color, onInfo }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={`p-10 rounded-[3rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/20 flex flex-col justify-between h-full ${className}`}
    >
       <div>
          <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-current/10`}>
            <Icon size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-4 font-display tracking-tight">{title}</h3>
          <p className="text-slate-500 leading-relaxed text-lg">{desc}</p>
       </div>
       <button 
        onClick={onInfo}
        className="mt-8 text-primary-600 font-bold flex items-center gap-2 group uppercase text-xs tracking-widest"
       >
         Ver como funciona <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
       </button>
    </motion.div>
  );
}

function SpecialtyItem({ title, desc, icon: Icon, featured }: any) {
  return (
    <div className={`flex gap-6 items-start p-6 rounded-[2.5rem] transition-all ${featured ? 'bg-primary-50 border border-primary-100 scale-105 shadow-xl shadow-primary-200/20' : 'hover:bg-slate-50'}`}>
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${featured ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'}`}>
          <Icon size={24} />
       </div>
       <div>
         <h4 className="text-xl font-bold font-display tracking-tight">{title}</h4>
         <p className="text-slate-500 text-md mt-1">{desc}</p>
       </div>
    </div>
  );
}

function TestimonialCard({ text, author, role, image }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group"
    >
      <div className="mb-8 text-primary-600">
         <Quote size={40} className="opacity-20 group-hover:opacity-40 transition-opacity" />
      </div>
      <p className="text-lg text-slate-800 leading-relaxed mb-8 font-medium">
        {text}
      </p>
      <div className="flex items-center gap-4">
        <img src={image} alt={author} className="w-12 h-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-md" />
        <div>
          <p className="text-sm font-bold text-slate-900 tracking-tight">{author}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

function PricingCard({ name, price, features, featured, isActive, onClick, onAction }: any) {
  const isCurrentlyActive = isActive;
  
  return (
    <motion.div 
      onClick={onClick}
      animate={{ 
        scale: isCurrentlyActive ? 1.05 : 1,
        backgroundColor: isCurrentlyActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
        color: isCurrentlyActive ? '#0f172a' : '#64748b',
        borderColor: isCurrentlyActive ? '#2f80ed' : 'rgba(0,0,0,0.05)',
        zIndex: isCurrentlyActive ? 20 : 10
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`p-10 rounded-[3rem] border transition-all cursor-pointer relative shadow-3xl ${
        isCurrentlyActive ? 'shadow-[0_20px_50px_rgba(124,58,237,0.1)]' : 'hover:border-white/10'
      }`}
    >
      {featured && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg ${isCurrentlyActive ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-600'}`}>
          Mais Popular
        </div>
      )}
      <h3 className="text-xl font-bold uppercase tracking-widest mb-2 font-display">{name}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-sm font-bold opacity-60">R$</span>
        <span className="text-5xl font-bold font-display tracking-tight">{price}</span>
        <span className="text-sm font-bold opacity-60">/mês</span>
      </div>
      <ul className="space-y-4 mb-10">
        {features.map((f: string) => (
          <li key={f} className="flex gap-3 text-sm font-medium">
             <CheckCircle2 size={18} className={isCurrentlyActive ? 'text-primary-600' : 'text-primary-400'} />
             {f}
          </li>
        ))}
      </ul>
      <button 
        onClick={(e) => { e.stopPropagation(); onAction(); }}
        className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 uppercase tracking-widest text-xs shadow-xl ${
          isCurrentlyActive 
            ? 'bg-primary-500 text-white'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        Selecionar Plano
      </button>
    </motion.div>
  );
}

