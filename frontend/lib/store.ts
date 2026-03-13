import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  points: number;
  createdAt: string;
  teamMember?: {
    team: {
      id: string;
      name: string;
    };
  } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  solved: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
}

interface ChallengeState {
  challenges: Challenge[];
  categories: string[];
  setChallenges: (challenges: Challenge[]) => void;
  setCategories: (categories: string[]) => void;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  challenges: [],
  categories: [],
  setChallenges: (challenges) => set({ challenges }),
  setCategories: (categories) => set({ categories }),
}));

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now().toString() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
