import languageReducer, { setLanguage } from '@/lib/redux/slices/languageSlice';

describe('languageSlice', () => {
  it('should return initial state', () => {
    expect(languageReducer(undefined, { type: 'unknown' })).toEqual({
      language: 'en',
      direction: 'ltr',
    });
  });

  it('should handle setLanguage to French', () => {
    const actual = languageReducer(undefined, setLanguage('fr'));

    expect(actual.language).toBe('fr');
    expect(actual.direction).toBe('ltr');
  });

  it('should handle setLanguage to Arabic with RTL', () => {
    const actual = languageReducer(undefined, setLanguage('ar'));

    expect(actual.language).toBe('ar');
    expect(actual.direction).toBe('rtl');
  });

  it('should handle setLanguage to English', () => {
    const initialState = {
      language: 'ar' as const,
      direction: 'rtl' as const,
    };

    const actual = languageReducer(initialState, setLanguage('en'));

    expect(actual.language).toBe('en');
    expect(actual.direction).toBe('ltr');
  });

  it('should maintain LTR direction for non-Arabic languages', () => {
    const languages: Array<'en' | 'fr'> = ['en', 'fr'];

    languages.forEach((lang) => {
      const actual = languageReducer(undefined, setLanguage(lang));
      expect(actual.direction).toBe('ltr');
    });
  });
});
