import { Injectable } from '@angular/core';

export type ThemeType = 'dark' | 'pearl' | 'angel';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly CACHE_KEY = 'haze_denki_cache_v1';
  private readonly THEME_KEY = 'haze_denki_theme';
  private readonly LANG_KEY = 'haze_denki_lang';

  saveCache(data: any): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage limit reached or error', e);
    }
  }

  getCache<T>(): T | null {
    const data = localStorage.getItem(this.CACHE_KEY);
    return data ? JSON.parse(data) : null;
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }

  getTheme(): ThemeType {
    return (localStorage.getItem(this.THEME_KEY) as ThemeType) || 'pearl';
  }

  setTheme(theme: ThemeType): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  getLanguage(): string {
    return localStorage.getItem(this.LANG_KEY) || 'ja';
  }

  setLanguage(lang: string): void {
    localStorage.setItem(this.LANG_KEY, lang);
  }
  
  getCacheSize(): string {
    const data = localStorage.getItem(this.CACHE_KEY);
    if (!data) return '0 KB';
    const bytes = new Blob([data]).size;
    return (bytes / 1024).toFixed(2) + ' KB';
  }
}