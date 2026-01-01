import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const BASE_URL = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUsername', data.username);
                onLoginSuccess(data.token);
            } else {
                setError(data.error || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.');
            }
        } catch (err) {
            setError('تعذر الاتصال بالسيرفر. يرجى المحاولة لاحقاً.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fffff] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-8 bg-gradient-to-br from-blue-700 to-blue-900 text-white text-center">
                    <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                        <ShieldCheck size={48} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">نظام الإدارة </h1>
                    <p className="text-blue-100/70 text-sm">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm animate-shake">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 pr-1">اسم المستخدم</label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-right"
                                    placeholder="أدخل اسم المستخدم"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 pr-1">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-right"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>تسجيل الدخول</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                        Secure Access Protocol v2.5
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
            `}} />
        </div>
    );
};

export default Login;
