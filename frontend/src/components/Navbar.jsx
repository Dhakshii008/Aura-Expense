import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon, Wallet, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full glass-panel border-b px-6 py-4 flex items-center justify-between rounded-b-2xl"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
          AuraExpense
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* User Badge */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-500/5 dark:bg-white/5 border border-gray-500/10 dark:border-white/5">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{user.username}</span>
          </div>
        )}

        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-gray-500/5 dark:bg-white/5 border border-gray-500/10 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-500/10 dark:hover:bg-white/10 transition duration-150"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition duration-150 flex items-center gap-2 text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
