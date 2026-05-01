import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Phone, 
  Send,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform">
              C
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">C-Flow <span className="text-primary-600">Master</span></span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold text-sm uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={18} /> Voltar ao Início
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Left Side: Info */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div>
                <h1 className="text-6xl font-bold font-display tracking-tight uppercase mb-6">Fale com nosso <span className="text-primary-600">Time.</span></h1>
                <p className="text-xl text-slate-500 leading-relaxed font-medium">
                  Estamos prontos para tirar suas dúvidas sobre implementação, migração de dados ou parcerias comerciais. Especialistas em gestão de fluxo na saúde ao seu dispor.
                </p>
              </div>

              <div className="space-y-8">
                <ContactInfoItem 
                  icon={MessageCircle}
                  title="WhatsApp Comercial"
                  value="(65) 99920-58727"
                  link="https://wa.me/55659992058727"
                />
                <ContactInfoItem 
                  icon={Mail}
                  title="E-mail de Suporte"
                  value="contato@cflow.com.br"
                  link="mailto:contato@cflow.com.br"
                />
                <ContactInfoItem 
                  icon={MapPin}
                  title="Base de Operações"
                  value="Cuiabá - Mato Grosso, Brasil"
                />
              </div>

              <div className="p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 blur-[80px] opacity-30" />
                <h4 className="text-lg font-bold mb-4 font-display">Horário de Atendimento</h4>
                <p className="text-slate-400">Segunda a Sexta: 08:00 às 18:00 (Horário de Brasília)</p>
                <div className="mt-8 flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Operadores Online Agora
                </div>
              </div>
            </motion.div>

            {/* Right Side: Form */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-3xl border border-slate-100"
            >
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold font-display">Mensagem Enviada!</h2>
                  <p className="text-slate-500">Obrigado pelo contato. Em breve um de nossos consultores entrará em contato.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-primary-600 font-bold uppercase tracking-widest text-sm hover:underline"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
                      <input required type="text" placeholder="Nome completo" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                      <input required type="email" placeholder="seu@email.com" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                      <input required type="text" placeholder="(65) 99999-9999" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sua Clínica</label>
                      <input type="text" placeholder="Nome da Unidade" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assunto</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold">
                      <option>Solicitar Demonstração Live</option>
                      <option>Dúvidas sobre Migração de Dados</option>
                      <option>Suporte Técnico (Cliente)</option>
                      <option>Financeiro / Faturamento</option>
                      <option>Outros</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Como podemos ajudar?</label>
                    <textarea rows={4} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" placeholder="Descreva brevemente sua necessidade..." />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-primary-600 text-white py-5 rounded-[2rem] font-bold text-lg shadow-2xl shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest"
                  >
                    <Send size={20} /> Enviar Mensagem
                  </button>
                  <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest">
                    Ao enviar, você concorda com nossos termos de processamento de dados.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm">© 2026 C-Flow. Transformando o fluxo da saúde brasileira.</p>
      </footer>
    </div>
  );
}

function ContactInfoItem({ icon: Icon, title, value, link }: any) {
  const content = (
    <div className="flex items-center gap-6 group cursor-pointer p-4 -ml-4 hover:bg-white rounded-3xl transition-all hover:shadow-xl hover:shadow-slate-200/50">
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-xl font-bold font-display text-slate-900">{value}</p>
      </div>
    </div>
  );

  return link ? <a href={link} target="_blank" rel="noopener noreferrer">{content}</a> : content;
}
