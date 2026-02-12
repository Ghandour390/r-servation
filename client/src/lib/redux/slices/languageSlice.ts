import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Language = 'en' | 'fr' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageState {
    language: Language;
    direction: Direction;
}

const getInitialState = (): LanguageState => {
    if (typeof window !== 'undefined') {
        const cookieLangMatch = document.cookie.match(/(?:^|; )language=([^;]+)/);
        const cookieLang = cookieLangMatch ? decodeURIComponent(cookieLangMatch[1]) as Language : null;
        if (cookieLang && ['en', 'fr', 'ar'].includes(cookieLang)) {
            return {
                language: cookieLang,
                direction: cookieLang === 'ar' ? 'rtl' : 'ltr',
            };
        }
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && ['en', 'fr', 'ar'].includes(savedLang)) {
            return {
                language: savedLang,
                direction: savedLang === 'ar' ? 'rtl' : 'ltr',
            };
        }
    }
    return {
        language: 'en',
        direction: 'ltr',
    };
};

const initialState: LanguageState = getInitialState();

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<Language>) => {
            state.language = action.payload;
            state.direction = action.payload === 'ar' ? 'rtl' : 'ltr';
            if (typeof window !== 'undefined') {
                localStorage.setItem('language', action.payload);
                document.cookie = `language=${action.payload}; path=/; max-age=31536000; samesite=lax`;
                document.documentElement.dir = state.direction;
                document.documentElement.lang = state.language;
            }
        },
    },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
