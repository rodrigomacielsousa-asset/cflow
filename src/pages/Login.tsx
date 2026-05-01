import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, Sparkles, ArrowLeft, RefreshCcw, CheckCircle } from 'lucide-react';

export default function Login() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          email: user.email,
          clinicRoles: {}
        });
      }
      const targetPath = user.email === 'contatocflow@gmail.com' ? '/super-admin' : '/app';
      navigate(targetPath);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, informe seu email.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setShowForgot(false);
    } catch (err: any) {
      setError('Erro ao enviar email: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let user;
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
        
        // Enviar verificação de email
        await sendEmailVerification(user);
        
        await setDoc(doc(db, 'users', user.uid), {
          displayName: email.split('@')[0],
          email: user.email,
          clinicRoles: {}
        });
        
        setSuccess('Conta criada! Enviamos um link de verificação para seu email.');
        // Opcional: aguardar verificação no futuro, por enquanto deixa entrar
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      }
      const targetPath = user?.email === 'contatocflow@gmail.com' ? '/super-admin' : '/app';
      navigate(targetPath);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('Usuário não encontrado. Deseja criar uma conta?');
      } else if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta. Tente novamente ou use "Esqueci minha senha".');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F7FB] p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-primary-200/20 p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 p-8">
           <button 
            onClick={() => {
              if (showForgot) setShowForgot(false);
              else navigate('/');
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-primary-600 transition-colors font-bold text-xs uppercase tracking-widest"
           >
             <ArrowLeft size={16} /> {showForgot ? 'Voltar ao Login' : 'Voltar'}
           </button>
        </div>
        
        <div className="mb-10 text-center relative">
          <div 
            onClick={() => navigate('/')}
            className="w-16 h-16 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-primary-200 cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="text-3xl font-bold font-display">C</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-[#0F172A] tracking-tight">
            {showForgot ? 'Recuperar Senha' : (isRegistering ? 'Criar Conta C-Flow' : 'Bem-vindo ao C-Flow')}
          </h1>
          <p className="text-[#64748B] mt-2 text-sm">
            {showForgot ? 'Enviaremos um link para seu email.' : 'Gestão profissional para sua clínica no fluxo perfeito.'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest text-center"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2"
          >
            <CheckCircle size={14} />
            {success}
          </motion.div>
        )}

        {showForgot ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
             <div className="relative">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 required
                 type="email"
                 placeholder="Seu email de cadastro"
                 value={email}
                 onChange={e => setEmail(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
               />
             </div>
             <button
               type="submit"
               disabled={loading}
               className="w-full bg-primary-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-100 hover:bg-primary-600 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
             >
               {loading ? 'Processando...' : <><RefreshCcw size={18} /> Resetar Senha</>}
             </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
               <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   required
                   type="email"
                   placeholder="Seu melhor e-mail"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                 />
               </div>
               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   required
                   type="password"
                   placeholder="Sua senha secreta"
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                 />
               </div>
               {!isRegistering && (
                 <div className="text-right">
                   <button 
                     type="button"
                     onClick={() => setShowForgot(true)}
                     className="text-xs font-bold text-[#64748B] hover:text-primary-600"
                   >
                     Esqueceu sua senha?
                   </button>
                 </div>
               )}
               <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-primary-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-100 hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
               >
                 {loading ? 'Processando...' : (isRegistering ? 'Criar minha conta' : 'Acessar plataforma')}
               </button>
            </form>

            <div className="relative flex items-center gap-4 my-8">
               <div className="flex-1 h-px bg-slate-100" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ou entre com</span>
               <div className="flex-1 h-px bg-slate-100" />
            </div>

            <button
               type="button"
               onClick={handleGoogleLogin}
               disabled={loading}
               className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 px-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Acesso via Google
            </button>

            <div className="mt-8 text-center flex flex-col gap-4">
               <button 
                 onClick={() => {
                   setIsRegistering(!isRegistering);
                   setError('');
                   setSuccess('');
                 }}
                 className="text-xs font-bold text-primary-500 hover:underline uppercase tracking-widest"
               >
                 {isRegistering ? 'Já possuo senha? Fazer Login' : 'Primeiro Acesso? Crie sua senha aqui'}
               </button>
            </div>
          </>
        )}

        <p className="mt-10 text-[10px] text-slate-400 text-center leading-relaxed font-medium uppercase tracking-tight">
          Ao entrar, você concorda com nossos <span className="text-slate-600 underline cursor-pointer">Termos</span> e <span className="text-slate-600 underline cursor-pointer">Privacidade</span>.
        </p>
      </motion.div>
    </div>
  );
}
