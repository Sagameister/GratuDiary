import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JournalEntry, MoodEmoji } from '../types';
import { Icons } from '../components/Icons';

interface NewEntryProps {
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (entry: JournalEntry) => void;
  existingEntry?: JournalEntry;
}

const InputList: React.FC<{ 
  label: string; 
  items: string[]; 
  setItems: (items: string[]) => void; 
  placeholder: string;
}> = ({ label, items, setItems, placeholder }) => {
  const [currentInput, setCurrentInput] = useState('');

  const handleAdd = () => {
    if (currentInput.trim() && items.length < 3) {
      setItems([...items, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const removeAt = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateAt = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  return (
    <div className="mb-10">
      <label className="block text-slate-700 dark:text-slate-200 text-xl font-semibold mb-2">{label}</label>
      <p className="text-base text-slate-500 mb-3">Up to 3 items</p>
      
      <div className="space-y-3 mb-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-700 text-lg transition-all hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500/50">
            <input
              type="text"
              value={item}
              onChange={(e) => updateAt(idx, e.target.value)}
              className="flex-grow bg-transparent text-slate-700 dark:text-slate-300 focus:text-slate-900 dark:focus:text-white focus:outline-none mr-4 placeholder-slate-400 dark:placeholder-slate-600"
              placeholder="Empty item..."
            />
            <button 
              onClick={() => removeAt(idx)} 
              className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 -mr-2 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50"
              title="Delete item"
            >
              <span className="sr-only">Remove</span>
              <Icons.Trash className="w-5 h-5" /> 
            </button>
          </div>
        ))}
      </div>

      {items.length < 3 && (
        <div className="relative">
          <input
            type="text"
            className="w-full bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded p-5 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-lg"
            placeholder={placeholder}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={handleAdd}
            className="flex items-center text-primary-600 dark:text-primary-400 text-base font-semibold mt-3 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
          >
            <Icons.NewEntry className="w-5 h-5 mr-2" />
            Add Item
          </button>
        </div>
      )}
    </div>
  );
};

const SummarySection = ({ title, items }: { title: string, items: string[] }) => (
  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
    {items.length > 0 ? (
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start text-slate-600 dark:text-slate-200">
            <span className="mr-2 text-primary-500 mt-1">•</span>
            <span className="text-lg">{item}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-slate-400 dark:text-slate-500 italic">No items recorded.</p>
    )}
  </div>
);

export const NewEntry: React.FC<NewEntryProps> = ({ addEntry, updateEntry, existingEntry }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const [workedWell, setWorkedWell] = useState<string[]>([]);
  const [madeHappy, setMadeHappy] = useState<string[]>([]);
  const [gratefulFor, setGratefulFor] = useState<string[]>([]);
  const [mood, setMood] = useState<number>(3); // Default neutral
  const [moodNote, setMoodNote] = useState<string>('');

  // Sync state with existing entry when loaded or when editing starts
  useEffect(() => {
    if (existingEntry) {
      setWorkedWell(existingEntry.workedWell);
      setMadeHappy(existingEntry.madeHappy);
      setGratefulFor(existingEntry.gratefulFor);
      setMood(existingEntry.mood);
      setMoodNote(existingEntry.moodNote || '');
    }
  }, [existingEntry]);

  const moodEmojis = [
    { value: 1, label: 'Very Sad', icon: '😠' },
    { value: 2, label: 'Sad', icon: '😟' },
    { value: 3, label: 'Neutral', icon: '😐' },
    { value: 4, label: 'Good', icon: '🙂' },
    { value: 5, label: 'Happy', icon: '😁' },
  ];

  const handleSave = () => {
    if (existingEntry) {
      // Update existing entry
      const updatedEntry: JournalEntry = {
        ...existingEntry,
        workedWell,
        madeHappy,
        gratefulFor,
        mood,
        moodNote: mood <= 3 ? moodNote : undefined
      };
      updateEntry(updatedEntry);
      setIsEditing(false);
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        workedWell,
        madeHappy,
        gratefulFor,
        mood,
        moodNote: mood <= 3 ? moodNote : undefined
      };
      addEntry(newEntry);
      navigate('/dashboard');
    }
  };

  const getMoodQuestion = () => {
    switch(mood) {
      case 3: return "Why did you feel neutral?";
      case 2: return "Why did you feel sad?";
      case 1: return "Why did you feel very sad?";
      default: return "What was challenging?";
    }
  };

  // If an entry already exists and we are not editing, show the summary view
  if (existingEntry && !isEditing) {
    const moodConfig = moodEmojis.find(m => m.value === existingEntry.mood);
    
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
         <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-10 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                 <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Daily Entry Complete</h1>
                 <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">You have already reflected on yesterday.</p>
               </div>
               <div className="flex items-center gap-4">
                 <div className="bg-success-500/10 dark:bg-success-500/20 py-2 px-4 rounded-full flex items-center gap-2">
                    <Icons.Check className="w-5 h-5 text-success-600 dark:text-success-500" />
                    <span className="text-success-600 dark:text-success-500 font-bold">Saved</span>
                 </div>
               </div>
            </div>
            
            <div className="p-10 space-y-8">
               {/* Mood Display */}
               <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-700/30 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <span className="text-xl text-slate-700 dark:text-slate-300 font-semibold">Mood:</span>
                  <div className="flex items-center space-x-3">
                     <span className="text-4xl">{moodConfig?.icon}</span>
                     <span className="text-2xl text-slate-900 dark:text-white font-bold">{moodConfig?.label}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SummarySection title="What worked well?" items={existingEntry.workedWell} />
                  <SummarySection title="What made you happy?" items={existingEntry.madeHappy} />
               </div>
               <SummarySection title="What are you grateful for?" items={existingEntry.gratefulFor} />
               
               {existingEntry.moodNote && (
                  <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Reflection Note</h3>
                    <p className="text-slate-600 dark:text-slate-200 text-lg italic leading-relaxed">"{existingEntry.moodNote}"</p>
                  </div>
               )}
               
               <div className="pt-6 flex flex-col md:flex-row justify-end gap-4">
                 <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold py-4 px-8 rounded-xl shadow border border-slate-200 dark:border-slate-600 transition-colors text-lg flex items-center justify-center"
                 >
                    <Icons.Edit className="w-5 h-5 mr-2" />
                    Edit Entry
                 </button>
                 <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all transform active:scale-95 text-lg flex items-center justify-center"
                 >
                    <Icons.Dashboard className="w-6 h-6 mr-2" />
                    Go to Dashboard
                 </button>
               </div>
            </div>
         </div>
       </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl transition-colors duration-300">
        <div className="p-10 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Entry' : 'Reflect on Yesterday'}
          </h1>
          {isEditing && (
            <button 
              onClick={() => setIsEditing(false)}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="p-10 md:p-12 space-y-12">
          {!isEditing && (
            <div className="text-slate-500 dark:text-slate-400 text-lg">
              Take a moment to reflect on all the good things from <span className="text-slate-800 dark:text-white font-semibold">yesterday</span>.
            </div>
          )}

          <InputList 
            label="What worked well?" 
            items={workedWell} 
            setItems={setWorkedWell}
            placeholder="Ex: Completed the major project"
          />

          <InputList 
            label="What made you happy?" 
            items={madeHappy} 
            setItems={setMadeHappy}
            placeholder="Ex: Lunch with an old friend"
          />

          <InputList 
            label="What are you grateful for?" 
            items={gratefulFor} 
            setItems={setGratefulFor}
            placeholder="Ex: My supportive family"
          />

          <div className="mb-12">
             <label className="block text-slate-700 dark:text-slate-200 text-xl font-semibold mb-6">How was your mood for yesterday?</label>
             <div className="flex gap-6">
               {moodEmojis.map((m) => (
                 <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    title={m.label}
                    className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-6xl transition-all ${
                      mood === m.value 
                        ? 'bg-slate-100 dark:bg-slate-700 ring-4 ring-primary-500 scale-110' 
                        : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 grayscale hover:grayscale-0 opacity-70 hover:opacity-100'
                    }`}
                 >
                   {m.icon}
                 </button>
               ))}
             </div>

             {/* Sliding Text Area for Low Moods */}
             <div className={`transition-all duration-500 ease-in-out overflow-hidden ${mood <= 3 ? 'max-h-80 opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'}`}>
                <label className="block text-slate-700 dark:text-slate-200 text-xl font-semibold mb-4">
                  {getMoodQuestion()}
                </label>
                <textarea 
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="Share a brief reflection on why you felt this way..."
                  className="w-full h-32 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded p-5 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-lg resize-none"
                />
             </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-5 px-8 rounded-xl shadow-lg shadow-primary-500/20 transition-all transform active:scale-95 text-xl"
          >
            {isEditing ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};