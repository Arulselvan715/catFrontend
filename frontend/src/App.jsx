import { Moon, Sun, Settings as SettingsIcon, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { useContacts } from './hooks/useContacts';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const contacts = useContacts();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <header className="border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90 px-4 py-4 backdrop-blur sm:px-6 transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">AI Driver Safety</div>
            <h1 className="mt-1 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">Drowsiness Detection and Emergency Alert System</h1>
          </div>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setPage('dashboard')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${page === 'dashboard' ? 'bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950' : 'border border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-400'}`}
            >
              <Video className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setPage('settings')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${page === 'settings' ? 'bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950' : 'border border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-400'}`}
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:flex transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  Light mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-cyan-600" />
                  Night mode
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        {page === 'dashboard' ? (
          <Dashboard contactsCount={contacts.contacts.filter((contact) => contact.active).length} />
        ) : (
          <Settings {...contacts} />
        )}
      </div>
    </main>
  );
}
