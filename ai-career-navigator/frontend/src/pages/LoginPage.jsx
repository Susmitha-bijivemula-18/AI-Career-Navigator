import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IconCheck, IconSparkles } from '@tabler/icons-react';

export default function LoginPage({ mode = 'login' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const isLogin = mode === 'login';

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard'); 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const features = [
    "AI-powered resume analysis",
    "Precise skill gap identification",
    "Real-time job match scoring",
    "Personalized learning roadmaps"
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 md:p-8 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-indigo-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-2xl mb-12">
              <IconSparkles className="w-8 h-8" />
              <span>Career AI</span>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 leading-relaxed max-w-md">
              Unlock your career potential with our AI-driven insights and discover roles perfectly tailored to your skills.
            </p>

            <ul className="space-y-4">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <IconCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" stroke={3} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Panel */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center justify-center gap-1 mb-8 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <Link 
              to="/login"
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${isLogin ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Sign in
            </Link>
            <Link 
              to="/signup"
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${!isLogin ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Sign up
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input 
                type="password" 
                name="password"
                value={form.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors mt-2"
            >
              {isLogin ? 'Sign in to account' : 'Create account'}
            </button>
            
            <p className="text-xs text-center text-slate-400 mt-2">
              (Auth coming soon — UI only)
            </p>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? (
              <p>Don't have an account? <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign up</Link></p>
            ) : (
              <p>Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
