
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { NewEntry } from './pages/NewEntry';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { JournalEntry, UserStats } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Wrapper to handle finding the entry by ID for editing
const EntryEditor: React.FC<{ 
  entries: JournalEntry[], 
  updateEntry: (entry: JournalEntry) => void 
}> = ({ entries, updateEntry }) => {
  const { id } = useParams<{ id: string }>();
  const entry = entries.find((e) => e.id === id);
  
  if (!entry) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <NewEntry 
      addEntry={() => {}} // No-op for editing
      updateEntry={updateEntry}
      existingEntry={entry}
    />
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Helper to calculate streaks
const calculateStats = (entries: JournalEntry[], joinDate?: string) => {
  if (!entries.length) {
    return {
      totalEntries: 0,
      currentStreak: 0,
      longestStreak: 0,
      memberSince: joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Just now'
    };
  }

  // 1. Sort entries by date (newest first)
  // We use simple string comparison for ISO dates which works, but normalization is safer
  const normalizeDate = (d: string) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
  };

  const sortedUniqueTimestamps = Array.from(new Set(entries.map(e => normalizeDate(e.date))))
    .sort((a, b) => b - a); // Descending (Newest first)

  // 2. Calculate Current Streak
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayTs = today.getTime();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0,0,0,0);
  const yesterdayTs = yesterday.getTime();

  let currentStreak = 0;
  
  // The streak is alive if the most recent entry is Today OR Yesterday.
  if (sortedUniqueTimestamps.length > 0) {
      const latest = sortedUniqueTimestamps[0];
      
      if (latest === todayTs || latest === yesterdayTs) {
         // It's alive! Now count backwards.
         let streakCounter = 1;
         let expectedDate = new Date(latest);
         
         for (let i = 0; i < sortedUniqueTimestamps.length - 1; i++) {
             const current = sortedUniqueTimestamps[i];
             const previous = sortedUniqueTimestamps[i+1]; // older date
             
             const diffTime = Math.abs(current - previous);
             const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

             if (diffDays === 1) {
                 streakCounter++;
             } else {
                 break; // Gap found
             }
         }
         currentStreak = streakCounter;
      }
  }

  // 3. Calculate Longest Streak
  let maxStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < sortedUniqueTimestamps.length - 1; i++) {
    const current = sortedUniqueTimestamps[i];
    const previous = sortedUniqueTimestamps[i+1]; // older date
    
    const diffTime = Math.abs(current - previous);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      tempStreak = 1;
    }
  }
  if (tempStreak > maxStreak) maxStreak = tempStreak;
  if (sortedUniqueTimestamps.length === 1) maxStreak = 1;
  if (sortedUniqueTimestamps.length === 0) maxStreak = 0;

  return {
    totalEntries: entries.length,
    currentStreak,
    longestStreak: Math.max(maxStreak, currentStreak),
    memberSince: joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Just now'
  };
};

const AuthenticatedApp: React.FC<{ theme: 'light' | 'dark', toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Load entries specific to the current user
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`gratuDiary_entries_${user.id}`);
      if (saved) {
        try {
          setEntries(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse entries", e);
          setEntries([]);
        }
      } else {
        setEntries([]);
      }
    } else {
      setEntries([]);
    }
  }, [user]);

  // Save entries for the current user
  useEffect(() => {
    if (user && user.id) {
      localStorage.setItem(`gratuDiary_entries_${user.id}`, JSON.stringify(entries));
    }
  }, [entries, user]);

  const addEntry = (entry: JournalEntry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const updateEntry = (updatedEntry: JournalEntry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  };

  const userStats = calculateStats(entries, user?.joinedAt);

  // Determine if an entry already exists for today
  const todayStr = new Date().toDateString();
  const todayEntry = entries.find(e => new Date(e.date).toDateString() === todayStr);

  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-grow bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Routes>
           <Route path="/login" element={<Navigate to="/" replace />} />
           <Route path="/register" element={<Navigate to="/" replace />} />
           
           <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <NewEntry 
                    addEntry={addEntry} 
                    updateEntry={updateEntry}
                    existingEntry={todayEntry} 
                  />
                </ProtectedRoute>
              } 
            />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard entries={entries} theme={theme} /></ProtectedRoute>} />
            <Route 
              path="/entry/:id" 
              element={<ProtectedRoute><EntryEditor entries={entries} updateEntry={updateEntry} /></ProtectedRoute>} 
            />
            <Route path="/profile" element={<ProtectedRoute><Profile stats={userStats} /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

const UnauthenticatedApp: React.FC<{ theme: 'light' | 'dark', toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-grow bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return isAuthenticated 
    ? <AuthenticatedApp theme={theme} toggleTheme={toggleTheme} /> 
    : <UnauthenticatedApp theme={theme} toggleTheme={toggleTheme} />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;