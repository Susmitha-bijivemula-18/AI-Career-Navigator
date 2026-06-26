// frontend/src/components/TabNav.jsx
import React from 'react';

export default function TabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === tab
              ? 'bg-slate-950 text-white border border-transparent shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
