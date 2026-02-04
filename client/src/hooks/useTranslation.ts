import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { setLanguage } from '@/lib/redux/slices/languageSlice';
import { translations } from '@/lib/i18n/translations';

export const useTranslation = () => {
    const dispatch = useDispatch();
    const { language, direction } = useSelector((state: RootState) => state.language);

    const t = translations[language];

    const changeLanguage = (lang: 'en' | 'fr' | 'ar') => {
        dispatch(setLanguage(lang));
    };

    return {
        t,
        language,
        direction,
        changeLanguage,
    };
};
