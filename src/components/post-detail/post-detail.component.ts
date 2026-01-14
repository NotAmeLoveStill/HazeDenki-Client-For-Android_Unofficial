import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post } from '../../models/post.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    @if (post(); as currentPost) {
      <article class="pb-20 transition-all duration-300">
        <!-- Top Navigation -->
        <div class="post-header-nav flex items-center justify-between mb-4 gap-2">
           <div class="flex items-center gap-1">
              <button (click)="goBack()" class="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
              </button>
            </div>
        </div>

        <!-- Reader Mode Content -->
        <div class="post-content-body animate-fade-in">
          <!-- Header Image -->
          @if(currentPost.imageUrl) {
            <div class="rounded-2xl overflow-hidden mb-6 border border-slate-700 shadow-2xl relative group">
              <img 
                [ngSrc]="currentPost.imageUrl!" 
                [width]="800" 
                [height]="450" 
                priority
                class="w-full h-auto object-cover"
                alt="Article cover"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
            </div>
          }

          <!-- Meta -->
          <div class="post-meta flex flex-col gap-2 mb-6 border-b border-slate-800 pb-6">
            <h1 class="text-2xl md:text-4xl font-bold text-white leading-tight break-words">{{ currentPost.title }}</h1>
            <div class="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-400 font-mono mt-2">
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ currentPost.date | date:'mediumDate' }}
              </span>
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {{ currentPost.author }}
              </span>
            </div>
          </div>

          <!-- Body -->
          <div class="prose prose-invert prose-lg max-w-none text-slate-300 prose-headings:text-denki-50 prose-a:text-denki-400 hover:prose-a:text-denki-300 prose-strong:text-white prose-blockquote:border-denki-500 prose-blockquote:bg-slate-800/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full prose-img:h-auto">
            <div [innerHTML]="sanitizedContent()"></div>
          </div>
          
          <!-- Loading State (Skeleton) -->
          @if (isLoadingFull()) {
             <div class="mt-8 space-y-4 animate-pulse">
                <div class="h-4 bg-slate-800 rounded w-3/4"></div>
                <div class="h-4 bg-slate-800 rounded w-full"></div>
                <div class="h-4 bg-slate-800 rounded w-5/6"></div>
                <div class="h-48 bg-slate-800 rounded-xl w-full mt-6"></div>
                <div class="h-4 bg-slate-800 rounded w-full mt-6"></div>
                <div class="h-4 bg-slate-800 rounded w-4/5"></div>
                <div class="flex justify-center mt-4">
                   <span class="text-xs text-slate-500 font-mono">Fetching full content...</span>
                </div>
             </div>
          }

          <!-- Retry Button (Only if failed and not loading and not full) -->
          @if (!isLoadingFull() && !currentPost.isFullContent && fetchFailed()) {
             <div class="mt-8 pt-8 border-t border-slate-800 flex flex-col items-center justify-center gap-3">
                <p class="text-sm text-red-400/80">Auto-load failed.</p>
                <button 
                  (click)="loadFullArticle()"
                  class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full transition-all border border-slate-700 cursor-pointer">
                  Retry Full Load
                </button>
             </div>
          }

          <!-- Original Link -->
          <div class="mt-8 flex justify-center">
              <a [href]="currentPost.link" target="_blank" class="inline-flex items-center gap-2 text-denki-400 hover:text-denki-300 underline font-mono text-sm">
                  Open in System Browser
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
              </a>
          </div>

          <!-- Tags Footer -->
          <div class="mt-6 pt-6 border-t border-slate-800">
            <div class="flex flex-wrap gap-2">
              @for (tag of currentPost.tags; track tag) {
                <span class="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm font-medium border border-slate-700 cursor-default">#{{ tag }}</span>
              }
            </div>
          </div>
        </div>
      </article>
    } @else {
      <div class="py-20 text-center">
         <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-denki-500 mb-4"></div>
         <p class="text-slate-500">Loading signal...</p>
      </div>
    }
  `
})
export class PostDetailComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private api: ApiService = inject(ApiService);
  private location: Location = inject(Location);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  post = signal<Post | undefined>(undefined);
  isLoadingFull = signal(false);
  fetchFailed = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const p = this.api.getPostById(id);
        if (p) {
            this.post.set(p);
            // Auto-trigger full load if not already loaded
            if (!p.isFullContent) {
                this.loadFullArticle();
            }
        } else {
            // Attempt to fetch if not found in memory (deep link scenario)
            this.api.refreshPosts().then(() => {
                const fetchedPost = this.api.getPostById(id);
                this.post.set(fetchedPost);
                if (fetchedPost && !fetchedPost.isFullContent) {
                    this.loadFullArticle();
                }
            });
        }
      }
    });
  }

  sanitizedContent(): SafeHtml {
    // Remove inline style that might break mobile layout
    let content = this.post()?.content || '';
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  async loadFullArticle() {
    const p = this.post();
    if (!p) return;

    this.isLoadingFull.set(true);
    this.fetchFailed.set(false);

    try {
      const fullHtml = await this.api.fetchFullArticleHtml(p.link);
      this.post.update(current => {
        if (!current) return undefined;
        return {
          ...current,
          content: fullHtml,
          isFullContent: true
        };
      });
    } catch (error) {
      console.warn('Auto-load failed', error);
      this.fetchFailed.set(true);
    } finally {
      this.isLoadingFull.set(false);
    }
  }

  goBack() {
    this.location.back();
  }
}