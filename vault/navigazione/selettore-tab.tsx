import React, { useState } from 'react';

export const SegmentedTabs = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Panoramica', 'Sicurezza', 'Fatturazione'];

  const tabButtonClass = (isActive: boolean) => `px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
    isActive 
      ? 'bg-white text-slate-800 shadow-sm shadow-slate-100 font-bold' 
      : 'text-slate-500 hover:text-slate-800'
  }`;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex gap-1 w-fit">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`${tabButtonClass(activeTab === idx)} `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Rendering tab panel */}
      <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
        {activeTab === 0 && <p className="text-sm text-slate-600">Scheda Panoramica generale del profilo...</p>}
        {activeTab === 1 && <p className="text-sm text-slate-600">Configurazione della sicurezza, password e 2FA...</p>}
        {activeTab === 2 && <p className="text-sm text-slate-600">Cronologia delle fatture e metodi di pagamento...</p>}
      </div>
    </div>
  );
};
