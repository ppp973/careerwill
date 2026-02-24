export enum AppState {
  SPLASH = 'SPLASH',
  BATCH_SELECT = 'BATCH_SELECT',
  FOLDER_SELECT = 'FOLDER_SELECT',
  SUBFOLDER_SELECT = 'SUBFOLDER_SELECT',
  LOADING = 'LOADING',
  PLAYER = 'PLAYER'
}

export interface Batch {
  id: string;
  title: string;
  thumbnail?: string;
  folders?: Folder[];
}

export interface Folder {
  name: string;
  subfolders: Subfolder[];
}

export interface Subfolder {
  name: string;
  items: ContentItem[];
}

export interface ContentItem {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'pdf';
  duration?: string;
  thumbnail?: string;
}

export interface PlaylistItem extends ContentItem {}
