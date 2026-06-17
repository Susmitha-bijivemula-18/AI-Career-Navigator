// frontend/src/components/TabNav.jsx
import React from 'react';

export default function TabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
            activeTab === tab
              ? 'bg-gray-900 text-white border border-transparent'
              : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
