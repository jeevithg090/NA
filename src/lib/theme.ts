export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'papers-please-theme';

/**
 * Runs before first paint (inlined in <head>) so the page never flashes the wrong theme.
 * Uses the saved choice if there is one, otherwise the operating-system preference.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.classList.toggle('dark',t==='dark')}catch(e){document.documentElement.classList.add('dark')}})();`;
