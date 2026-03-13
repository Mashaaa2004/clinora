import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { PlusCircle, User, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'patient' as 'patient' | 'doctor',
    birthDate: '',
    phone: '',
    specialization: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        if (isLogin) {
          login(data);
        } else {
          setIsLogin(true);
          setSuccessMessage('Рўйхатдан муваффақиятли ўтдингиз. Энди тизимга киришингиз мумкин.');
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Тизимда хатолик юз берди');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border w-full max-w-md overflow-hidden"
      >
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <PlusCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold">Шифохона бошқарув тизими</h1>
          <p className="text-blue-100 mt-2">{isLogin ? 'Тизимга кириш' : 'Рўйхатдан ўтиш'}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm border border-green-100">
              {successMessage}
            </div>
          )}

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Тўлиқ исмингиз</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Ролингиз</label>
                  <select 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}
                  >
                    <option value="patient">Бемор</option>
                    <option value="doctor">Шифокор</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Телефон</label>
                  <input 
                    type="tel" required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {formData.role === 'patient' ? (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Туғилган сана</label>
                  <input 
                    type="date" required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Мутахассислик</label>
                  <input 
                    type="text" required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})}
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Логин</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Парол</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            <span>{loading ? 'Юкланмоқда...' : (isLogin ? 'Кириш' : 'Рўйхатдан ўтиш')}</span>
            {!loading && <ArrowRight size={18} />}
          </button>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              {isLogin ? 'Ҳисобингиз йўқми? Рўйхатдан ўтинг' : 'Ҳисобингиз борми? Тизимга киринг'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
