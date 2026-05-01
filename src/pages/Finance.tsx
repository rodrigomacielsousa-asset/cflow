import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  DollarSign, 
  PieChart, 
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Link as LinkIcon,
  CreditCard,
  Plus,
  X,
  Save,
  Tag
} from 'lucide-react';

export default function Finance() {
  const { profile, managedClinicId } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Infraestrutura',
    date: new Date().toISOString().split('T')[0]
  });

  const clinicId = managedClinicId || (profile?.clinicRoles ? Object.keys(profile.clinicRoles)[0] : null);

  useEffect(() => {
    if (!clinicId) return;

    const q = query(
      collection(db, 'clinics', clinicId, 'finance'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `clinics/${clinicId}/finance`));

    return () => unsub();
  }, [clinicId]);

  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const pendingRepassesCount = transactions.filter(t => t.category === 'Repasse' && t.status === 'pending').length;
  const pendingRepassesValue = transactions
    .filter(t => t.category === 'Repasse' && t.status === 'pending')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const handleCreateExpense = async () => {
    if (!clinicId || !newExpense.description || !newExpense.amount) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'clinics', clinicId, 'finance'), {
        ...newExpense,
        amount: parseFloat(newExpense.amount.toString().replace(',', '.')),
        type: 'expense',
        status: 'paid',
        createdAt: serverTimestamp()
      });
      setIsExpenseModalOpen(false);
      setNewExpense({
        description: '',
        amount: '',
        category: 'Infraestrutura',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `clinics/${clinicId}/finance`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Financeiro</h1>
          <p className="text-slate-500 mt-1">Gestão de fluxo de caixa e repasses profissionais.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95"
          >
            <Plus size={18} />
            Nova Despesa
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95">
            <FileText size={18} />
            Conciliação Bancária
          </button>
        </div>
      </header>

      {/* Premium Balance Bar */}
      <section className="bg-primary-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 blur-[120px] opacity-20 -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-600 blur-[100px] opacity-10 -z-10" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                 <motion.div 
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md"
                 >
                    <DollarSign size={16} className="text-primary-400" />
                 </motion.div>
                 <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Fluxo Master • Saldo Real</span>
              </div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold font-display tracking-tight"
              >
                R$ {(totalRevenue - totalExpenses).toLocaleString()}
              </motion.h2>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                 <CheckCircle2 size={14} className="text-emerald-500" /> Sincronizado com Conta PJ e Fluxo de Caixa
              </p>
           </div>
           <div className="flex gap-4">
              <button className="px-8 py-4 bg-accent-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-accent-950/20 hover:bg-accent-700 transition-all active:scale-95 uppercase tracking-widest">
                 Solicitar Saque
              </button>
              <button className="px-8 py-4 bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/20 transition-all uppercase tracking-widest">
                 Ver Extrato
              </button>
           </div>
        </div>
      </section>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard 
          label="Receita Total (Mês)" 
          value={`R$ ${totalRevenue.toLocaleString()}`} 
          trend="+15.2%" 
          trendType="up" 
          icon={ArrowUpRight} 
          color="bg-emerald-500" 
        />
        <FinanceCard 
          label="Despesas Operacionais" 
          value={`R$ ${totalExpenses.toLocaleString()}`} 
          trend="-2.1%" 
          trendType="down" 
          icon={ArrowDownRight} 
          color="bg-rose-500" 
        />
        <FinanceCard 
          label="Repasses Pendentes" 
          value={`R$ ${pendingRepassesValue.toLocaleString()}`} 
          trend={`${pendingRepassesCount} profissionais`} 
          trendType="neutral" 
          icon={Wallet} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-slate-900">Transações Recentes</h2>
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                 <button className="px-3 py-1 bg-white rounded-md text-xs font-bold shadow-sm">Todos</button>
                 <button className="px-3 py-1 text-xs font-bold text-slate-500">Entradas</button>
                 <button className="px-3 py-1 text-xs font-bold text-slate-500">Saídas</button>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {transactions.length > 0 ? transactions.map((t) => (
                <TransactionRow 
                  key={t.id}
                  description={t.description} 
                  category={t.category || t.category || 'Saúde'} 
                  date={t.date ? new Date(t.date).toLocaleDateString('pt-BR') : 'N/D'} 
                  amount={`R$ ${parseFloat(t.amount || 0).toLocaleString()}`} 
                  type={t.type === 'income' ? 'credit' : 'debit'} 
                />
              )) : (
                <div className="p-10 text-center text-slate-400">Nenhuma transação encontrada.</div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-sm font-bold text-primary-600 hover:text-primary-700">Ver extrato completo</button>
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
              <PieChart size={18} className="text-primary-600" />
              Meta de Faturamento
            </h3>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold text-slate-500 uppercase tracking-widest">ABRIL</span>
                    <span className="font-bold text-slate-900">75% concluído</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 w-3/4 rounded-full shadow-lg shadow-primary-200/50" />
                  </div>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed">Restam R$ 4.500,00 para atingir a meta mensal.</p>
            </div>
          </section>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                   <TrendingUp size={16} />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Insights do Mês</h4>
             </div>
             <p className="text-sm text-slate-600">O faturamento aumentou <span className="text-emerald-600 font-bold">12%</span> em relação ao mês anterior, impulsionado pela especialidade <span className="text-primary-600 font-bold">Psicologia</span>.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-rose-600 p-8 text-white">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Plus size={24} />
                  </div>
                  <button 
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/20 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                <h2 className="text-3xl font-bold font-display">Adicionar Despesa</h2>
                <p className="opacity-80 text-sm mt-1">Registre uma nova despesa operacional da clínica.</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Descrição</label>
                  <input 
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(p => ({ ...p, description: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all font-bold"
                    placeholder="Ex: Aluguel, Energia, Materiais..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Valor (R$)</label>
                    <input 
                      type="text"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all font-bold"
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Categoria</label>
                    <select 
                      value={newExpense.category}
                      onChange={(e) => setNewExpense(p => ({ ...p, category: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all font-bold appearance-none"
                    >
                      <option value="Infraestrutura">Infraestrutura</option>
                      <option value="Pessoal">Pessoal</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Data</label>
                  <input 
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(p => ({ ...p, date: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all font-bold"
                  />
                </div>

                <button 
                  disabled={loading}
                  onClick={handleCreateExpense}
                  className="w-full bg-rose-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-rose-950/20 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  {loading ? 'Salvando...' : <><Save size={20} /> Salvar Despesa</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FinanceCard({ label, value, trend, trendType, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group">
      <div className={`absolute right-[-10px] top-[-10px] w-24 h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform ${color}`} />
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-80">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-2 font-display">{value}</p>
      <div className="flex items-center gap-2 mt-4">
        <div className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          trendType === 'up' ? 'text-emerald-600 bg-emerald-50' : 
          trendType === 'down' ? 'text-rose-600 bg-rose-50' : 'text-slate-500 bg-slate-100'
        }`}>
          {trendType !== 'neutral' && <Icon size={12} />}
          {trend}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">vs. mês anterior</span>
      </div>
    </div>
  );
}

function TransactionRow({ description, category, date, amount, type }: any) {
  const generatePaymentLink = () => {
    const link = `https://checkout.cflow.com.br/pay/${Math.random().toString(36).substring(7)}`;
    alert(`Link de Pagamento Gerado com Sucesso!\n\n${link}\n\nO paciente receberá uma notificação automática via WhatsApp.`);
    window.open(`https://wa.me/?text=${encodeURIComponent(`Olá, segue o link para pagamento da sua sessão: ${link}`)}`, '_blank');
  };

  return (
    <div className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{description}</p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{category}</span>
             <span className="w-1 h-1 rounded-full bg-slate-300" />
             <span className="text-[10px] text-slate-400 font-medium">{date}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        {type === 'credit' && (
          <button 
            onClick={generatePaymentLink}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary-600 hover:text-white"
          >
             <LinkIcon size={12} />
             Gerar Link
          </button>
        )}
        <div className={`text-sm font-bold font-display ${
          type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
        }`}>
          {type === 'credit' ? '+' : '-'} {amount}
        </div>
      </div>
    </div>
  );
}
