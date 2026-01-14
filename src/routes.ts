import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'post/:id', component: PostDetailComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];