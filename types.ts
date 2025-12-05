export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetScreenId: string | null;
}

export interface Screen {
  id: string;
  name: string;
  imageUrl: string;
  hotspots: Hotspot[];
  description?: string;
}

export enum AppMode {
  EDIT = 'EDIT',
  PREVIEW = 'PREVIEW',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
