import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  Sun, 
  Moon, 
  User, 
  Calendar as CalendarIcon,
  Zap,
  Smile,
  Frown,
  Meh,
  Activity,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload
} from 'lucide-react';

export const Icons = {
  Dashboard: LayoutDashboard,
  NewEntry: PlusCircle,
  Logout: LogOut,
  Sun,
  Moon,
  User,
  Calendar: CalendarIcon,
  Streak: Zap,
  Mood: {
    1: Frown,
    2: Frown, // Reuse for slightly sad
    3: Meh,
    4: Smile,
    5: Smile, // Reuse for very happy
  },
  Activity,
  Check: CheckCircle2,
  Alert: AlertCircle,
  Trash: Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload
};