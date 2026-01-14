import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private router: Router = inject(Router);
  public api: ApiService = inject(ApiService);

  isSidebarOpen = signal(false);
  isLangMenuOpen = signal(false);
  
  // Available languages mimicking the original site
  languages = [
    { code: 'ja', label: '日本語' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' }
  ];
  
  // Use the API's currentLang signal as the source of truth
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
    this.goHome(); // Ensure we are on the home page to see results
  }

  toggleLangMenu() {
    this.isLangMenuOpen.update(v => !v);
  }

  selectLanguage(code: string) {
    // Close menu immediately for better UX
    this.isLangMenuOpen.set(false);
    
    // Call API service to switch language and reload feed
    this.api.setLanguage(code);
    
    // If we are not on home, go home to see the new feed
    this.goHome();
  }
}