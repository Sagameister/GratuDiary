
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => isAuthenticated ? navigate('/') : navigate('/login')}>
          <Icons.Calendar className="w-9 h-9 text-primary-600 dark:text-white" />
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">GratuDiary</span>
        </div>

        <nav className="flex items-center space-x-4 md:space-x-8">
          {isAuthenticated && (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center space-x-2 text-lg font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'text-primary-600 dark:text-primary-500' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icons.Dashboard className="w-6 h-6" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
              
              <button
                onClick={() => navigate('/')}
                className={`flex items-center space-x-2 text-lg font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-primary-600 dark:text-primary-500' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icons.NewEntry className="w-6 h-6" />
                <span className="hidden md:inline">New Entry</span>
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
            </>
          )}

          <button 
            onClick={toggleTheme}
            className="text-slate-500 dark:text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Icons.Sun className="w-7 h-7" />
            ) : (
              <Icons.Moon className="w-7 h-7" />
            )}
          </button>

          {isAuthenticated ? (
            <>
              <button 
                 onClick={handleLogout} 
                 className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg font-medium"
              >
                <Icons.Logout className="w-6 h-6" />
                <span className="hidden md:inline">Logout</span>
              </button>

              <button 
                onClick={() => navigate('/profile')}
                className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-500 transition-colors"
                title={user?.name}
              >
                <Icons.User className="w-7 h-7" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
