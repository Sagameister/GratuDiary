
import React from 'react';
import { Icons } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-slate-500 dark:text-slate-500 text-sm md:text-base">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <p>© 2025 GratuDiary.</p>
          <p className="hidden md:block text-slate-300 dark:text-slate-700">|</p>
          <p>Data stored locally. <span className="hidden md:inline">Backup regularly.</span></p>
        </div>
        <button className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
           <Icons.Streak className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </footer>
  );
};