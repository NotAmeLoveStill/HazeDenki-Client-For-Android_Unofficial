import { Injectable, signal, computed } from '@angular/core';
import { Post } from '../models/post.model';
import { StorageService, ThemeType } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private postsSignal = signal<Post[]>([]);
  readonly posts = this.postsSignal.asReadonly();
  
  private loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  // Pagination State
  private currentPage = signal(1);
  readonly isLoadingMore = signal(false);
  readonly hasMorePosts = signal(true);

  // UI State
  readonly activeFilter = signal<string>('All');
  readonly siteLogo = signal<string | null>(null);
  readonly theme = signal<ThemeType>('pearl');
  
  // Language State
  readonly currentLang = signal<string>('ja');

  // Derived State
  readonly allTags = computed(() => {
    const tags = new Set<string>();
    this.postsSignal().forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  });

  constructor(private storage: StorageService) {
    // Initialize language from storage
    this.currentLang.set(this.storage.getLanguage());
    
    // Initialize Theme
    const savedTheme = this.storage.getTheme();
    this.setTheme(savedTheme);

    this.loadInitialData();
  }

  setFilter(tag: string) {
    this.activeFilter.set(tag);
  }

  setTheme(newTheme: ThemeType) {
    this.theme.set(newTheme);
    this.storage.setTheme(newTheme);
    
    const html = document.documentElement;
    html.classList.remove('dark', 'theme-angel');
    
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else if (newTheme === 'angel') {
      html.classList.add('dark', 'theme-angel');
    }
  }

  async setLanguage(lang: string) {
    if (this.currentLang() === lang) return;
    this.currentLang.set(lang);
    this.storage.setLanguage(lang);
    this.postsSignal.set([]); 
    await this.refreshPosts();
  }

  private loadInitialData() {
    const cached = this.storage.getCache<Post[]>();
    if (cached && cached.length > 0) {
      this.postsSignal.set(cached);
    }
    this.refreshPosts();
  }

  private getFeedCandidates(lang: string, page: number): string[] {
    const baseUrl = 'https://hazedenki.net';
    const applyPaging = (url: string) => {
        if (page <= 1) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}paged=${page}`;
    };

    let urls: string[] = [];

    switch (lang) {
        case 'en':
            urls = [`${baseUrl}/en/feed/`, `${baseUrl}/feed/?lang=en`];
            break;
        case 'zh':
            urls = [`${baseUrl}/zh-hans/feed/`, `${baseUrl}/zh/feed/`, `${baseUrl}/feed/?lang=zh`];
            break;
        case 'ja': 
        default: 
            urls = [`${baseUrl}/feed/?lang=ja`, `${baseUrl}/feed/`];
            break;
    }
    return urls.map(applyPaging);
  }

  async refreshPosts(): Promise<void> {
    this.loadingSignal.set(true);
    this.currentPage.set(1);
    this.hasMorePosts.set(true);

    const lang = this.currentLang();
    const candidates = this.getFeedCandidates(lang, 1);
    
    let success = false;

    for (const url of candidates) {
        if (success) break;
        try {
            const text = await this.fetchNative(url);
            const posts = this.parseRSS(text);
            
            if (posts.length > 0) {
                this.postsSignal.set(posts);
                this.storage.saveCache(posts);
                success = true;
            } else { 
                this.hasMorePosts.set(false);
            }
        } catch (error) {
            // console.warn(`Failed to fetch ${url}`, error);
        }
    }

    this.loadingSignal.set(false);
  }

  async loadMorePosts(): Promise<void> {
    if (this.isLoadingMore() || !this.hasMorePosts() || this.loading()) return;

    this.isLoadingMore.set(true);
    const nextPage = this.currentPage() + 1;
    const lang = this.currentLang();
    const candidates = this.getFeedCandidates(lang, nextPage);

    let success = false;
    let newPosts: Post[] = [];

    for (const url of candidates) {
        if (success) break;
        try {
            const text = await this.fetchNative(url);
            const parsed = this.parseRSS(text);
            newPosts = parsed;
            success = true;
        } catch (error) {
            // continue
        }
    }

    if (success) {
        if (newPosts.length > 0) {
            const currentIds = new Set(this.postsSignal().map(p => p.id));
            const filteredNewPosts = newPosts.filter(p => !currentIds.has(p.id));

            if (filteredNewPosts.length > 0) {
                this.postsSignal.update(existingPosts => {
                    const updatedPosts = [...existingPosts, ...filteredNewPosts];
                    this.storage.saveCache(updatedPosts);
                    return updatedPosts;
                });
            }
            this.currentPage.set(nextPage);
        } else {
            this.hasMorePosts.set(false);
        }
    } else {
        this.hasMorePosts.set(false);
    }

    this.isLoadingMore.set(false);
  }

  async fetchFullArticleHtml(url: string): Promise<string> {
    try {
        const html = await this.fetchNative(url);
        return this.parseArticleHtml(html);
    } catch (e) {
        console.error('Failed to fetch full article', e);
        throw e;
    }
  }

  // Pure Native Fetch - No Proxies
  private async fetchNative(url: string): Promise<string> {
    // Capacitor's patched fetch automatically handles the native HTTP request
    // bypassing browser CORS restrictions.
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Native HTTP Error: ${response.status}`);
    }
    return await response.text();
  }

  private parseArticleHtml(htmlText: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    
    const selectors = ['.entry-content', '.post-content', 'article .content', '#content', 'main'];
    for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (element) {
            element.querySelectorAll('script, style, .share-buttons, .related-posts, #jp-relatedposts').forEach(el => el.remove());
            return element.innerHTML;
        }
    }
    throw new Error('Could not extract main content');
  }

  private parseRSS(xmlText: string): Post[] {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    
    const channel = xml.getElementsByTagName('channel')[0];
    if (channel) {
      const images = channel.getElementsByTagName('image');
      if (images.length > 0) {
        const urls = images[0].getElementsByTagName('url');
        if (urls.length > 0 && urls[0].textContent) {
          this.siteLogo.set(urls[0].textContent);
        }
      }
    }

    const items = Array.from(xml.getElementsByTagName('item'));
    return items.map(item => {
      const title = this.getTagValue(item, 'title');
      const link = this.getTagValue(item, 'link');
      const date = this.getTagValue(item, 'pubDate');
      const creator = this.getTagValue(item, 'dc:creator') || 'HazeDenki';
      
      const contentEncoded = this.getTagValue(item, 'content:encoded');
      const description = this.getTagValue(item, 'description');
      const fullContent = contentEncoded || description;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = description || fullContent;
      const plainText = tempDiv.textContent || '';
      const summary = plainText.substring(0, 150) + '...';

      const categories = Array.from(item.getElementsByTagName('category')).map(c => c.textContent || '').filter(t => t);

      let imageUrl = item.getElementsByTagName('enclosure')[0]?.getAttribute('url') || null;
      if (!imageUrl) {
         const imgMatch = fullContent.match(/<img[^>]+src="([^">]+)"/);
         if (imgMatch) {
           imageUrl = imgMatch[1];
         }
      }
      if (!imageUrl) {
        imageUrl = 'https://picsum.photos/seed/' + encodeURIComponent(title) + '/800/600'; 
      }

      return {
        id: this.getTagValue(item, 'guid') || link,
        title,
        link,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        author: creator,
        content: fullContent,
        summary,
        imageUrl,
        tags: categories.slice(0, 5),
        isFullContent: false
      };
    });
  }

  private getTagValue(parent: Element, tagName: string): string {
    const elements = parent.getElementsByTagName(tagName);
    return elements.length > 0 ? elements[0].textContent || '' : '';
  }

  getPostById(id: string): Post | undefined {
    return this.posts().find(p => p.id === id);
  }
}