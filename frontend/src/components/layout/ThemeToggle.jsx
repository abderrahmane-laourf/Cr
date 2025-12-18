import React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-600 shadow-sm text-yellow-500'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
        title="Light Mode"
      >
        <Sun size={16} strokeWidth={2.5} />
      </button>
      
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition-all ${
            theme === 'system'
              ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-500'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          title="System Preference"
      >
         <Laptop size={16} strokeWidth={2.5} />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'dark'
            ? 'bg-slate-700 shadow-sm text-blue-400'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
        title="Dark Mode"
      >
        <Moon size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default ThemeToggle;
