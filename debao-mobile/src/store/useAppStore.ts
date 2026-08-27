import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import type {UserProfile} from '@/types/domain';

interface AppState {
  profile: UserProfile;
  favoriteIds: string[];
  completedQuestionIds: string[];
  drafts: Record<string, string>;
  toggleFavorite: (id: string) => void;
  completeQuestion: (id: string) => void;
  saveDraft: (id: string, answer: string) => void;
  updateProfile: (profile: UserProfile) => void;
  resetSession: () => void;
}

const initialProfile: UserProfile = {
  id: 'u-demo',
  name: '法考学习者',
  phone: '138****9190',
  examYear: '2026',
  studyDays: 126,
};

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      profile: initialProfile,
      favoriteIds: ['oq1'],
      completedQuestionIds: [],
      drafts: {},
      toggleFavorite: id =>
        set(state => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds.filter(item => item !== id)
            : [...state.favoriteIds, id],
        })),
      completeQuestion: id =>
        set(state => ({
          completedQuestionIds: state.completedQuestionIds.includes(id)
            ? state.completedQuestionIds
            : [...state.completedQuestionIds, id],
        })),
      saveDraft: (id, answer) =>
        set(state => ({drafts: {...state.drafts, [id]: answer}})),
      updateProfile: profile => set({profile}),
      resetSession: () =>
        set({
          profile: initialProfile,
          favoriteIds: [],
          completedQuestionIds: [],
          drafts: {},
        }),
    }),
    {
      name: 'debao-app-state-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        profile: state.profile,
        favoriteIds: state.favoriteIds,
        completedQuestionIds: state.completedQuestionIds,
        drafts: state.drafts,
      }),
    },
  ),
);
