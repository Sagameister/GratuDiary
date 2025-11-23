
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserStats, JournalEntry } from '../types';
import { Icons } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

interface ProfileProps {
  stats: UserStats;
}

export const Profile: React.FC<ProfileProps> = ({ stats }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    const savedBackupDate = localStorage.getItem('gratuDiary_lastBackup');
    if (savedBackupDate) {
      setLastBackup(savedBackupDate);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExportData = () => {
    if (!user) return;
    const data = localStorage.getItem(`gratuDiary_entries_${user.id}`);
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gratudiary_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update backup tracking
      const now = new Date().toISOString();
      localStorage.setItem('gratuDiary_lastBackup', now);
      setLastBackup(now);
    } else {
      alert("No journal entries to export.");
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        // Basic validation
        if (Array.isArray(parsed)) {
          localStorage.setItem(`gratuDiary_entries_${user.id}`, JSON.stringify(parsed));
          setImportStatus("Data imported successfully! Refreshing...");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setImportStatus("Invalid file format.");
        }
      } catch (err) {
        setImportStatus("Failed to parse file.");
      }
    };
    reader.readAsText(file);
  };

  // Check if backup is needed (older than 7 days)
  const isBackupNeeded = () => {
    if (!lastBackup) return true;
    const days = (new Date().getTime() - new Date(lastBackup).getTime()) / (1000 * 3600 * 24);
    return days > 7;
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-8">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-10">My Profile</h1>
      
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center mb-10 shadow-lg transition-colors duration-300">
          <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900/30 border-4 border-primary-500 flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
              <span className="text-5xl font-bold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{user?.name || 'Gratitude User'}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-2">{user?.email}</p>
      </div>

      {/* Stats Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-10 shadow-lg transition-colors duration-300">
          <div className="bg-slate-50 dark:bg-slate-700/50 px-10 py-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">My Stats</h3>
          </div>
          <div className="p-10 space-y-6">
              <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300 text-lg">Total Entries:</span>
                  <span className="text-slate-900 dark:text-white font-bold text-xl">{stats.totalEntries}</span>
              </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300 text-lg">Current Positive Streak:</span>
                  <span className="text-slate-900 dark:text-white font-bold text-xl">{stats.currentStreak} days</span>
              </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300 text-lg">Longest Positive Streak:</span>
                  <span className="text-slate-900 dark:text-white font-bold text-xl">{stats.longestStreak} days</span>
              </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300 text-lg">Member Since:</span>
                  <span className="text-slate-900 dark:text-white font-bold text-xl">{stats.memberSince}</span>
              </div>
          </div>
      </div>

      {/* Data Management Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-10 shadow-lg transition-colors duration-300">
          <div className="bg-slate-50 dark:bg-slate-700/50 px-10 py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">Data Backup</h3>
              {lastBackup && <span className="text-sm text-slate-500">Last backup: {new Date(lastBackup).toLocaleDateString()}</span>}
          </div>
          <div className="p-10 space-y-8">
              
              {/* Warning Alert */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5 flex items-start gap-4">
                 <Icons.Alert className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-1" />
                 <div>
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-500 text-lg mb-1">Data lives on this device</h4>
                    <p className="text-yellow-700 dark:text-yellow-400/90 leading-relaxed">
                       We do not store your journal in the cloud. If you clear your browser history, you lose your entries. 
                       <br className="hidden md:block" /> Please <strong>download a backup</strong> regularly.
                    </p>
                 </div>
              </div>

              <div className="flex gap-4 flex-col sm:flex-row">
                <button 
                  onClick={handleExportData}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm
                    ${isBackupNeeded() 
                      ? 'bg-primary-600 hover:bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-900/50' 
                      : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
                    }`}
                >
                  <Icons.Download className="w-5 h-5" />
                  {isBackupNeeded() ? 'Download Backup (Recommended)' : 'Download Backup'}
                </button>

                <button 
                  onClick={triggerImport}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Icons.Upload className="w-5 h-5" />
                  Restore Backup
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImportData} 
                  accept=".json" 
                  className="hidden" 
                />
              </div>
              {importStatus && (
                <p className={`text-center font-medium ${importStatus.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                  {importStatus}
                </p>
              )}
          </div>
      </div>

      {/* Settings Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-12 shadow-lg transition-colors duration-300">
          <div className="bg-slate-50 dark:bg-slate-700/50 px-10 py-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">Settings</h3>
          </div>
          <div className="p-10 space-y-10">
              <div className="flex items-center space-x-5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">
                  <Icons.Check className="w-7 h-7 text-primary-500" />
                  <span className="text-lg">Account & Security</span>
              </div>
               <div className="flex items-center space-x-5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">
                  <Icons.Alert className="w-7 h-7 text-primary-500" />
                  <span className="text-lg">Help & Support</span>
              </div>
          </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full py-5 rounded-xl border border-red-500/50 text-red-500 dark:text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300 transition-colors font-semibold text-xl"
      >
          Logout
      </button>
    </div>
  );
};