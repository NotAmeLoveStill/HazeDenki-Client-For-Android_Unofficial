
import { Component, inject, signal } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-white mb-6">Settings</h2>

      <!-- Theme Section -->
      <section class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div class="flex items-center gap-3 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-denki-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
           </svg>
           <h3 class="text-lg font-semibold text-slate-100">Appearance</h3>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Pearl (Default/Light) -->
            <button 
                (click)="api.setTheme('pearl')"
                class="relative h-20 rounded-xl border-2 transition-all overflow-hidden group flex flex-col items-center justify-center gap-1 bg-slate-100 cursor-pointer"
                [class.border-denki-500]="api.theme() === 'pearl'"
                [class.border-transparent]="api.theme() !== 'pearl'"
                [class.ring-2]="api.theme() === 'pearl'"
                [class.ring-denki-500]="api.theme() === 'pearl'">
                <div class="w-full h-full absolute inset-0 bg-gradient-to-br from-white to-slate-200 opacity-50"></div>
                <span class="relative z-10 text-slate-900 font-bold">Pearl</span>
                <span class="relative z-10 text-slate-500 text-[10px]">Light</span>
            </button>

            <!-- Dark -->
            <button 
                (click)="api.setTheme('dark')"
                class="relative h-20 rounded-xl border-2 transition-all overflow-hidden group flex flex-col items-center justify-center gap-1 bg-slate-900 cursor-pointer"
                [class.border-denki-500]="api.theme() === 'dark'"
                [class.border-slate-700]="api.theme() !== 'dark'"
                [class.ring-2]="api.theme() === 'dark'"
                [class.ring-denki-500]="api.theme() === 'dark'">
                <span class="relative z-10 text-slate-100 font-bold">Abyss</span>
                <span class="relative z-10 text-slate-500 text-[10px]">Dark</span>
            </button>

            <!-- Angel -->
            <button 
                (click)="api.setTheme('angel')"
                class="relative h-20 rounded-xl border-2 transition-all overflow-hidden group flex flex-col items-center justify-center gap-1 bg-[#fff0f5] cursor-pointer"
                [class.border-denki-500]="api.theme() === 'angel'"
                [class.border-transparent]="api.theme() !== 'angel'"
                [class.ring-2]="api.theme() === 'angel'"
                [class.ring-denki-500]="api.theme() === 'angel'">
                <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#9c94e8 1px, transparent 1px); background-size: 8px 8px;"></div>
                <span class="relative z-10 text-[#31237a] font-bold">Angel</span>
                <span class="relative z-10 text-[#9c94e8] text-[10px]">Retro</span>
            </button>
        </div>
      </section>

      <!-- Cache Section -->
      <section class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
         <div class="flex items-center gap-3 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-denki-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
           </svg>
           <h3 class="text-lg font-semibold text-slate-100">Storage</h3>
        </div>
        <div class="flex items-center justify-between">
           <div class="text-sm text-slate-400">
              <p>Cache Size: <span class="text-white font-mono">{{ cacheSize() }}</span></p>
              <p class="text-xs text-slate-500 mt-1">Locally stored feed data</p>
           </div>
           <button (click)="clearCache()" class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-sm transition-colors cursor-pointer">
              Clear Cache
           </button>
        </div>
      </section>

      <!-- Footer -->
      <div class="pt-8 pb-4 text-center">
         <p class="text-xs text-slate-500 font-mono">unofficial HazeDenki Mobile Client</p>
         <p class="text-[10px] text-slate-600 mt-1">v1.0.0 • Build 1.0.0</p>
      </div>
    </div>
  `
})
export class SettingsComponent {
  api = inject(ApiService);
  storage = inject(StorageService);

  cacheSize = signal(this.storage.getCacheSize());

  clearCache() {
    this.storage.clearCache();
    this.cacheSize.set(this.storage.getCacheSize());
    // Optionally reload or notify
    alert('Cache cleared.');
    window.location.reload();
  }
}
