export interface Post {
  id: string; // usually the guid or link
  title: string;
  summary: string; // derived from description or truncated content
  content: string; // content:encoded
  date: string; // pubDate
  imageUrl: string | null; // extracted from content or enclosure
  tags: string[]; // <category> tags
  author: string; // dc:creator
  link: string; // original link
  isFullContent?: boolean; // Track if we have fetched the full HTML
}

export interface AppState {
  posts: Post[];
  lastFetch: number;
  theme: 'dark' | 'light' | 'angel';
}