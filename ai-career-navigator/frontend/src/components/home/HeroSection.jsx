import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowRight } from '@tabler/icons-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Supercharge your career with <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
            AI-driven intelligence
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your resume and let our advanced AI match you with perfect roles. 
          Discover skill gaps, get personalized learning paths, and optimize your career trajectory.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
          >
            Upload Resume
            <IconArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200"
          >
            Explore Jobs
          </button>
        </div>
        
      </div>
    </section>
  );
}
