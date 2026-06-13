import React from 'react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="border-b bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg text-indigo-600">ACRG</span>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
      <footer className="border-t bg-slate-100 px-6 py-4 text-center text-xs text-slate-500">
        © 2026 AI Career Roadmap Generator
      </footer>
    </div>
  );
};
