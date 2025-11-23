
import React, { useEffect, useState, useMemo } from 'react';
import { JournalEntry } from '../types';
import { Icons } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { generateInsights } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  entries: JournalEntry[];
  theme: 'light' | 'dark';
}

const COLORS = ['#a855f7', '#22c55e', '#eab308', '#ec4899', '#3b82f6'];

export const Dashboard: React.FC<DashboardProps> = ({ entries, theme }) => {
  const navigate = useNavigate();
  const [aiInsights, setAiInsights] = useState<{ workedWellSummary: string; challengesSummary: string } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  
  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    // Check if API Key is available in environment
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setApiKeyMissing(true);
    }

    // Generate insights if we have entries and key
    const fetchInsights = async () => {
      if (entries.length > 0 && apiKey) {
        setLoadingInsights(true);
        const result = await generateInsights(entries);
        setAiInsights(result);
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, [entries.length]);

  // --- Derived Stats ---
  const consistency = useMemo(() => {
    if (entries.length === 0) return 0;
    // Mock calculation for demo purposes: assume 30 days possible
    return Math.min(Math.round((entries.length / 30) * 100), 100);
  }, [entries]);

  // --- Keyword Analysis (Mock Logic replacing complex NLP) ---
  const keywordData = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
        [...e.workedWell, ...e.madeHappy].forEach(phrase => {
            const words = phrase.split(' ');
            words.forEach(w => {
                if(w.length > 3) {
                    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
                    if (clean) counts[clean] = (counts[clean] || 0) + 1;
                }
            });
        });
    });
    
    return Object.entries(counts)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8
  }, [entries]);

  // --- Chart Data ---
  const moodData = useMemo(() => {
      // Sort entries by date
      const sorted = [...entries].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);
      return sorted.map((e, i) => ({
          day: new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' }),
          mood: e.mood
      }));
  }, [entries]);

  const moodDistData = useMemo(() => {
      const dist = [0,0,0,0,0]; // 1 to 5
      entries.forEach(e => {
          if(e.mood >= 1 && e.mood <= 5) dist[e.mood - 1]++;
      });
      return dist.map((count, i) => ({ name: `Mood ${i+1}`, value: count })).filter(d => d.value > 0);
  }, [entries]);

  // --- Recent Low Mood Reflections ---
  const recentReflections = useMemo(() => {
    return [...entries]
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(e => e.mood <= 3 && e.moodNote)
      .slice(0, 3);
  }, [entries]);

  // --- Theme Helper for Charts ---
  const isDark = theme === 'dark';
  const chartColors = {
    text: isDark ? '#94a3b8' : '#64748b', // slate-400 vs slate-500
    grid: isDark ? '#334155' : '#e2e8f0', // slate-700 vs slate-200
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#cbd5e1',
    tooltipText: isDark ? '#f8fafc' : '#0f172a'
  };

  // --- Calendar Logic ---
  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const renderCalendar = () => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startDayOffset = new Date(year, month, 1).getDay(); // 0 = Sunday
      
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const empties = Array.from({ length: startDayOffset }, (_, i) => i);

      // Map day number to entry ID for current view month
      const entryMap = new Map<number, string>();
      entries.forEach(e => {
          const date = new Date(e.date);
          if (date.getMonth() === month && date.getFullYear() === year) {
              entryMap.set(date.getDate(), e.id);
          }
      });
      
      const today = new Date();
      const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

      return (
          <div className="grid grid-cols-7 gap-3 text-base text-center mt-6">
              <div className="text-slate-400 dark:text-slate-500 font-medium">Su</div>
              <div className="text-slate-400 dark:text-slate-500 font-medium">Mo</div>
              <div className="text-slate-400 dark:text-slate-500 font-medium">Tu</div>
              <div className="text-slate-400 dark:text-slate-500 font-medium">We</div>
              <div className="text-slate-400 dark:text-slate-500 font-medium">Th</div>
              <div className="text-slate-400 dark:text-slate-500 font-medium">Fr</div>
              <div className="text-slate-400 dark:text-slate-500 font-medium">Sa</div>
              
              {empties.map(e => <div key={`empty-${e}`} />)}

              {days.map(d => {
                  const entryId = entryMap.get(d);
                  const hasEntry = !!entryId;
                  const isToday = isCurrentMonth && d === today.getDate();

                  return (
                      <div 
                        key={d} 
                        onClick={() => hasEntry && entryId ? navigate(`/entry/${entryId}`) : null}
                        className={`h-10 w-10 flex items-center justify-center rounded-lg font-medium transition-all relative
                            ${isToday ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-success-500 z-10' : ''}
                            ${hasEntry 
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 cursor-pointer' 
                                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-default'
                            }
                            ${isToday && hasEntry ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 hover:bg-success-200' : ''}
                        `}
                        title={hasEntry ? 'Edit Entry' : isToday ? 'Today' : ''}
                      >
                          {d}
                      </div>
                  );
              })}
          </div>
      );
  }

  const Mood1Icon = Icons.Mood[1];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      <div className="flex justify-between items-end">
         <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
         {apiKeyMissing && (
            <div className="hidden md:flex items-center text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
              <Icons.Alert className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">AI Features Disabled (No API Key)</span>
            </div>
         )}
      </div>

      {/* Top Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Progress Card */}
        <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-6 shadow-lg transition-colors duration-300">
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-full">
            <Icons.Streak className="w-14 h-14 text-yellow-400" />
          </div>
          <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Your Progress</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg mt-3">Start your gratitude journey today!</p>
          </div>
        </div>

        {/* Consistency Card */}
        <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center shadow-lg transition-colors duration-300">
            <h3 className="text-slate-700 dark:text-slate-200 text-2xl font-semibold mb-4">Entry Consistency</h3>
            <div className="text-7xl font-extrabold text-primary-600 dark:text-primary-500 mb-4">{consistency}%</div>
            <p className="text-slate-500 dark:text-slate-400 text-base">Last 30 days</p>
        </div>

        {/* Calendar Card */}
        <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg transition-colors duration-300">
             <div className="flex items-center justify-between mb-6">
                 <button 
                    onClick={prevMonth}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                 >
                    <Icons.ChevronLeft className="w-6 h-6" />
                 </button>
                 <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                 </span>
                 <button 
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                 >
                    <Icons.ChevronRight className="w-6 h-6" />
                 </button>
             </div>
             {renderCalendar()}
        </div>
      </div>

      {/* Keyword Insights */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Keyword Insights</h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 shadow-lg min-h-[240px] flex flex-col justify-center transition-colors duration-300">
             <div className="flex justify-between items-start mb-8">
                 <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-xl">Joy & Accomplishment Keywords</h3>
                 <Icons.Streak className="w-6 h-6 text-yellow-500" />
             </div>
             {keywordData.length > 0 ? (
                 <div className="flex flex-wrap gap-8 items-baseline justify-center">
                     {keywordData.map((k, i) => (
                         <span key={k.text} style={{ fontSize: `${Math.max(1.1, 1.5 + (k.count * 0.25))}rem` }} className={`font-bold ${i % 2 === 0 ? 'text-success-600 dark:text-success-500' : 'text-primary-600 dark:text-primary-500'}`}>
                             {k.text} <span className="text-lg opacity-60 font-normal text-slate-500 dark:text-slate-400">({k.count})</span>
                         </span>
                     ))}
                 </div>
             ) : (
                 <div className="text-center text-slate-400 dark:text-slate-500 text-lg italic">Add entries to see your joy keywords appear here.</div>
             )}
        </div>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Gratitude Themes Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 shadow-lg transition-colors duration-300">
              <h3 className="text-slate-700 dark:text-slate-200 font-bold text-2xl mb-10">Overall Gratitude Themes (Phrases)</h3>
              <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={keywordData.slice(0, 5)} layout="vertical" margin={{ left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
                          <XAxis type="number" stroke={chartColors.text} fontSize={16} />
                          <YAxis dataKey="text" type="category" stroke={chartColors.text} width={120} fontSize={16} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.tooltipText, fontSize: '16px' }}
                            itemStyle={{ color: isDark ? '#e9d5ff' : '#9333ea' }}
                            cursor={{fill: chartColors.grid, opacity: 0.4}}
                          />
                          <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={32} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* AI Insight Text */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 shadow-lg flex flex-col transition-colors duration-300">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-slate-700 dark:text-slate-200 font-bold text-2xl">Worked Well This Month</h3>
                  <Icons.Check className="w-8 h-8 text-success-500" />
              </div>
              <div className="flex-grow text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {apiKeyMissing ? (
                     <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-slate-500 dark:text-slate-400 text-base italic">
                       AI Insights are disabled. <br/> Please configure your API Key.
                     </div>
                  ) : loadingInsights ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                    </div>
                  ) : aiInsights ? (
                    aiInsights.workedWellSummary
                  ) : (
                    <span className="italic opacity-60">
                        "During this month, consistency in small tasks has been a key theme based on your entries..."
                        <br/><span className="text-base mt-4 block">(Add entries to generate real AI insights)</span>
                    </span>
                  )}
              </div>
          </div>
      </div>

      {/* Mood Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Mood Line Chart */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 shadow-lg transition-colors duration-300">
               <h3 className="text-slate-700 dark:text-slate-200 font-bold text-2xl mb-10">Mood Over Time</h3>
               <div className="h-80 w-full">
                  {moodData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moodData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                            <XAxis dataKey="day" stroke={chartColors.text} fontSize={16} />
                            <YAxis domain={[1, 5]} stroke={chartColors.text} ticks={[1,2,3,4,5]} fontSize={16} />
                            <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.tooltipText, fontSize: '16px' }} />
                            <Line type="monotone" dataKey="mood" stroke="#a855f7" strokeWidth={5} dot={{r: 6, fill: '#a855f7'}} />
                        </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-lg italic">
                        Log more entries to see your mood trend.
                    </div>
                  )}
               </div>
          </div>

          {/* Mood Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 shadow-lg transition-colors duration-300">
              <h3 className="text-slate-700 dark:text-slate-200 font-bold text-2xl mb-8">Mood Distribution</h3>
              <div className="h-64 w-full flex items-center justify-center">
                  {moodDistData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={moodDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
                                {moodDistData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, fontSize: '16px', color: chartColors.tooltipText }} 
                              itemStyle={{ color: chartColors.tooltipText }}
                            />
                        </PieChart>
                      </ResponsiveContainer>
                  ) : (
                      <span className="text-slate-500 text-base">No data available</span>
                  )}
              </div>
          </div>

          {/* Mood Streaks - Simplified for Dashboard */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 shadow-lg flex flex-col justify-center text-center space-y-10 relative overflow-hidden transition-colors duration-300">
               <Icons.Streak className="absolute top-6 right-6 text-yellow-500 w-8 h-8 opacity-50" />
               <div>
                   <div className="text-slate-500 dark:text-slate-400 text-base uppercase tracking-wider font-bold mb-3">Positive Streak</div>
                   <div className="text-5xl font-extrabold text-success-600 dark:text-success-500">View <span className="text-xl text-slate-400 font-normal">in profile</span></div>
                   <div className="text-lg text-slate-500 mt-3">Track your consistency</div>
               </div>
          </div>

          {/* Challenges Text / Reflections */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 shadow-lg flex flex-col transition-colors duration-300">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-slate-700 dark:text-slate-200 font-bold text-2xl">Challenges This Month</h3>
                  <Mood1Icon className="w-8 h-8 text-orange-500" />
              </div>
              <div className="flex-grow text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                 {apiKeyMissing ? (
                   <div className="text-slate-400 italic">AI Insights unavailable.</div>
                 ) : loadingInsights ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        {aiInsights ? aiInsights.challengesSummary : (
                           <span className="italic opacity-60">
                            "During this month, you noted feeling overwhelmed by emails and some disappointment regarding a project."
                           </span>
                        )}
                      </div>
                      
                      {/* Recent Notes Display */}
                      {recentReflections.length > 0 && (
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                          <h4 className="text-slate-500 dark:text-slate-400 text-base uppercase font-bold mb-4 tracking-wider">Recent Reflections</h4>
                          <div className="space-y-4">
                            {recentReflections.map(entry => (
                              <div key={entry.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                                <div className="text-xs text-slate-500 dark:text-slate-500 uppercase font-bold mb-1">
                                  {new Date(entry.date).toLocaleDateString()}
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 text-base italic">"{entry.moodNote}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};