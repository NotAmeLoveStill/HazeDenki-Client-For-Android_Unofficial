import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
<div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-16 md:pb-0">
  
  <!-- Sidebar Overlay -->
  @if (isSidebarOpen()) {
    <div class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in" (click)="closeSidebar()"></div>
  }
  
  <!-- Transparent overlay for closing language menu -->
  @if (isLangMenuOpen()) {
    <div class="fixed inset-0 z-[40]" (click)="isLangMenuOpen.set(false)"></div>
  }

  <!-- Sidebar Drawer -->
  <aside class="fixed top-0 bottom-0 left-0 z-[70] w-72 bg-slate-900 border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
         [class.-translate-x-full]="!isSidebarOpen()"
         [class.translate-x-0]="isSidebarOpen()">
      
      <div class="p-4 border-b border-slate-800 flex items-center justify-between h-[61px]">
         <img src="https://hazedenki.net/img/HazeDenki_Logo.png" alt="HazeDenki" class="h-8 w-auto object-contain">
         <button (click)="closeSidebar()" class="p-2 -mr-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
         </button>
      </div>
      
      <div class="sidebar-content flex-1 overflow-y-auto p-3 space-y-1">
         <!-- Fixed: Use ngClass instead of class bindings with slashes -->
         <button (click)="selectFilter('All')" 
                 class="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent cursor-pointer"
                 [ngClass]="{
                    'bg-denki-600 text-white shadow-lg shadow-denki-900/50': api.activeFilter() === 'All',
                    'text-slate-400 hover:bg-slate-800': api.activeFilter() !== 'All'
                 }">
            All Posts
         </button>
         
         <div class="pt-4 pb-2 px-2 text-xs font-bold text-slate-600 uppercase tracking-widest">Tags</div>
         
         @for(tag of api.allTags(); track tag) {
            <button (click)="selectFilter(tag)"
                 class="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors border border-transparent flex items-center gap-2 group cursor-pointer"
                 [class.bg-slate-800]="api.activeFilter() === tag"
                 [class.text-denki-400]="api.activeFilter() === tag"
                 [class.border-slate-700]="api.activeFilter() === tag"
                 [class.text-slate-400]="api.activeFilter() !== tag"
                 [class.hover:text-slate-200]="api.activeFilter() !== tag">
               <span class="opacity-50 group-hover:opacity-100 transition-opacity">#</span> {{ tag }}
            </button>
         }
      </div>
  </aside>

  <!-- Top Bar (Mobile) / Header (Desktop) -->
  <header class="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg h-[61px]">
    <!-- Left: Hamburger -->
    <button (click)="toggleSidebar()" class="p-2 -ml-2 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer" aria-label="Open menu">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    </button>
    
    <!-- Center: Logo -->
    <div class="absolute left-1/2 transform -translate-x-1/2 cursor-pointer" (click)="goHome()" role="button">
      @if (api.siteLogo()) {
        <img [src]="api.siteLogo()" class="h-8 w-auto object-contain" alt="Logo">
      } @else {
         <img src="https://www.google.com/s2/favicons?domain=hazedenki.net&sz=128" class="h-8 w-8 rounded-sm" alt="Logo">
      }
    </div>

    <!-- Right: Action Buttons -->
    <div class="flex items-center gap-1 -mr-2 relative">
      <!-- Language Switcher -->
      <button 
        (click)="toggleLangMenu()"
        class="p-2 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
        aria-label="Change Language">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      </button>

      <!-- Language Dropdown -->
      @if (isLangMenuOpen()) {
        <div class="absolute top-full right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-[70] animate-fade-in origin-top-right">
          @for(lang of languages; track lang.code) {
            <button 
              (click)="selectLanguage(lang.code)"
              class="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-between cursor-pointer"
              [class.text-denki-400]="currentLang() === lang.code"
              [class.text-slate-300]="currentLang() !== lang.code">
              {{ lang.label }}
              @if (currentLang() === lang.code) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              }
            </button>
            @if (!$last) {
              <div class="h-px bg-slate-700 mx-2"></div>
            }
          }
        </div>
      }

      <!-- Refresh Button -->
      <button 
        (click)="api.refreshPosts()" 
        [disabled]="api.loading()"
        class="p-2 text-slate-400 hover:text-white transition-colors focus:outline-none disabled:opacity-50 cursor-pointer"
        aria-label="Refresh">
        <div [class.animate-spin]="api.loading()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </div>
      </button>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 animate-fade-in">
    <router-outlet></router-outlet>
  </main>

  <!-- Mobile Bottom Nav -->
  <nav class="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center p-3 z-50 md:hidden pb-safe">
    <a routerLink="/" routerLinkActive="text-denki-400" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1 text-slate-400 transition-colors active:scale-95 cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
      <span class="text-[10px] font-medium">Home</span>
    </a>
    <a routerLink="/settings" routerLinkActive="text-denki-400" class="flex flex-col items-center gap-1 text-slate-400 transition-colors active:scale-95 cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="text-[10px] font-medium">Settings</span>
    </a>
  </nav>

  <!-- Desktop Nav (Hidden on Mobile) -->
  <div class="hidden md:flex fixed top-3 right-6 z-50 gap-4">
     <a routerLink="/" routerLinkActive="text-denki-400 bg-slate-800" [routerLinkActiveOptions]="{exact: true}" class="px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer">Feed</a>
     <a routerLink="/settings" routerLinkActive="text-denki-400 bg-slate-800" class="px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer">Settings</a>
  </div>
</div>`
})
export class AppComponent {
  private router: Router = inject(Router);
  public api: ApiService = inject(ApiService);

  isSidebarOpen = signal(false);
  isLangMenuOpen = signal(false);
  
  languages = [
    { code: 'ja', label: '日本語' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' }
  ];
  
  currentLang = this.api.currentLang;

  goHome() {
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  selectFilter(tag: string) {
    this.api.setFilter(tag);
    this.closeSidebar();
    this.goHome();
  }

  toggleLangMenu() {
    this.isLangMenuOpen.update(v => !v);
  }

  selectLanguage(code: string) {
    this.isLangMenuOpen.set(false);
    this.api.setLanguage(code);
    this.goHome();
  }
}