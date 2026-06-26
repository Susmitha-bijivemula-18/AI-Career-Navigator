import React from 'react';
import { IconBrain, IconTarget, IconChartBar, IconRoad, IconBriefcase } from '@tabler/icons-react';

export default function FeaturesGrid() {
  const features = [
    {
      icon: <IconBrain className="w-6 h-6 text-white transition-colors duration-300" />,
      title: 'Resume Analysis',
      desc: 'Deep parsing of your experience and skills to highlight your strengths with unprecedented accuracy.'
    },
    {
      icon: <IconBriefcase className="w-6 h-6 text-white transition-colors duration-300" />,
      title: 'Job Recommendations',
      desc: 'Smart matching algorithms to suggest roles that perfectly align with your parsed profile.'
    },
    {
      icon: <IconChartBar className="w-6 h-6 text-white transition-colors duration-300" />,
      title: 'Match Percentage',
      desc: 'Get precise match scores for top industry roles based on real-time market data requirements.'
    },
    {
      icon: <IconTarget className="w-6 h-6 text-white transition-colors duration-300" />,
      title: 'Skill Gap Analysis',
      desc: 'Identify missing skills for your target roles instantly and prioritize what to learn next.'
    },
    {
      icon: <IconRoad className="w-6 h-6 text-white transition-colors duration-300" />,
      title: 'Career Guidance',
      desc: 'Personalized, actionable steps to level up your career trajectory and land your dream job.'
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Capabilities</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to navigate your next career move with confidence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="group p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all duration-300 flex flex-col h-full cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center mb-6 shadow-sm border border-indigo-700 dark:border-indigo-400 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-grow">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
