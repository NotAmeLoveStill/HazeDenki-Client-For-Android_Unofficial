
import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  template: `
    <!-- Search Bar -->
    <div class="mb-4 relative group">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 group-focus-within:text-denki-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
      <input 
        #searchInput
        (input)="updateSearch(searchInput.value)"
        type="text" 
        placeholder="Search..." 
        class="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-denki-500 focus:ring-1 focus:ring-denki-500 sm:text-sm transition-all shadow-sm"
      >
    </div>

    <!-- Active Filter Indicator -->
    @if (api.activeFilter() !== 'All') {
       <div class="mb-4 flex items-center gap-2 animate-fade-in">
         <span class="px-3 py-1 bg-denki-600 text-white rounded-full text-xs font-medium flex items-center gap-2 shadow-lg shadow-denki-900/50">
            # {{ api.activeFilter() }}
            <button (click)="api.setFilter('All')" class="hover:text-denki-200">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                 <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
               </svg>
            </button>
         </span>
       </div>
    }

    <!-- Content State -->
    @if (api.loading() && api.posts().length === 0) {
      <div class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="w-8 h-8 border-2 border-denki-900 border-t-denki-400 rounded-full animate-spin"></div>
      </div>
    } @else {
      <!-- Posts Grid (Cinematic / Premium Layout) -->
      <div class="flex flex-col gap-4">
        @for (post of filteredPosts(); track post.id; let i = $index) {
          <article class="group relative bg-[#1e293b]/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-denki-900/20 border border-[#334155]/50 transition-all duration-300 h-[200px] md:h-[260px]">
            
            <!-- ANGEL THEME HEADER (Hidden by default, shown via CSS in Angel theme) -->
            <div class="angel-window-header hidden w-full h-6 items-center justify-between px-2 shrink-0 z-20 relative">
               <div class="text-[10px] text-white font-mono pl-1 truncate font-bold tracking-wider">
                  {{ post.tags[0] || 'No Tag' }}
               </div>
               <div class="flex gap-1">
                  <!-- Fake buttons -->
                  <div class="w-2 h-2 bg-white border border-slate-400"></div>
                  <div class="w-2 h-2 bg-white border border-slate-400"></div>
               </div>
            </div>

            <a [routerLink]="['/post', post.id]" class="block w-full h-full relative z-0 flex-1">
              
              <!-- 
                 1. Image Layer with CSS MASK
              -->
              @if (post.imageUrl) {
                <div class="absolute inset-0 z-0">
                  @if (i < 2) {
                    <img 
                      [ngSrc]="post.imageUrl" 
                      fill
                      priority
                      alt="" 
                      class="object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                      style="-webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 5%, black 60%, black 100%); mask-image: linear-gradient(to right, transparent 0%, transparent 5%, black 60%, black 100%);"
                    >
                  } @else {
                    <img 
                      [ngSrc]="post.imageUrl" 
                      fill
                      alt="" 
                      class="object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                      style="-webkit-mask-image: linear-gradient(to right, transparent 0%, transparent 5%, black 60%, black 100%); mask-image: linear-gradient(to right, transparent 0%, transparent 5%, black 60%, black 100%);"
                    >
                  }
                  <!-- Subtle dark tint -->
                  <div class="absolute inset-0 bg-slate-900/10 mix-blend-multiply pointer-events-none"></div>
                </div>
              }

              <!-- 2. Content Layer (Relative on top) -->
              <div class="relative z-10 h-full w-full flex flex-col justify-center p-5 md:p-8 pointer-events-none">
                <!-- Wrapper for text to handle pointer events -->
                 <div class="pointer-events-auto w-[75%] md:w-[65%] flex flex-col h-full justify-center items-start">
                   
                   <!-- Tags (Targeted by CSS to hide in Angel Theme) -->
                   <div class="original-tags flex items-center gap-2 mb-3">
                     @if (post.tags.length > 0) {
                        <span class="text-[10px] uppercase tracking-wider font-bold text-denki-400 bg-denki-950/80 backdrop-blur-sm px-2 py-0.5 rounded border border-denki-500/20 shadow-sm">
                           {{ post.tags[0] }}
                        </span>
                     }
                     <span class="text-[10px] text-[#94a3b8] font-mono shadow-black drop-shadow-md">{{ post.date | date:'MM/dd' }}</span>
                   </div>

                   <!-- Title with Background Highlight -->
                   <h2 class="text-lg md:text-2xl font-bold leading-loose line-clamp-3 mb-3">
                      <span class="bg-slate-900/20 text-[#ffffff] box-decoration-clone px-2 py-1 rounded-md shadow-sm group-hover:text-denki-300 transition-colors">
                        {{ post.title }}
                      </span>
                   </h2>

                   <!-- Author (Subtle footer) -->
                   <div class="mt-auto pt-2 flex items-center gap-2 opacity-70">
                      <div class="w-4 h-px bg-[#64748b] shadow-sm"></div>
                      <span class="text-[10px] text-[#cbd5e1] uppercase tracking-widest drop-shadow-md">{{ post.author }}</span>
                   </div>
                </div>
              </div>

              <!-- Interactive Highlight Border -->
              <div class="absolute inset-0 border border-transparent group-hover:border-denki-500/30 rounded-2xl pointer-events-none transition-colors duration-300 z-20"></div>
            </a>
          </article>
        } @empty {
          <div class="text-center py-20">
            <p class="text-slate-500 text-sm">No signals found.</p>
            <button (click)="api.setFilter('All'); searchQuery.set('')" class="mt-2 text-denki-400 text-xs hover:underline">Reset</button>
          </div>
        }
      </div>

      <!-- Load More / Footer -->
      @if (!api.loading()) {
        <div class="flex justify-center py-6">
          @if (api.hasMorePosts()) {
            <button 
              (click)="api.loadMorePosts()" 
              [disabled]="api.isLoadingMore()"
              class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-6 rounded-full transition-all flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-50 disabled:cursor-wait">
              @if (api.isLoadingMore()) {
                <div class="w-4 h-4 border-2 border-slate-500 border-t-slate-200 rounded-full animate-spin"></div>
                <span>Loading...</span>
              } @else {
                <span>Load More</span>
              }
            </button>
          } @else if (filteredPosts().length > 0) {
            <p class="text-sm text-slate-600 font-mono">-- End of Signals --</p>
          }
        </div>
      }
    }
  `
})
export class HomeComponent {
  api = inject(ApiService);
  
  searchQuery = signal('');

  filteredPosts = computed(() => {
    let posts = this.api.posts();
    const q = this.searchQuery().toLowerCase();
    const f = this.api.activeFilter();

    if (f !== 'All') {
      posts = posts.filter(p => p.tags.includes(f));
    }

    if (q) {
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.summary.toLowerCase().includes(q)
      );
    }
    return posts;
  });

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }
}
