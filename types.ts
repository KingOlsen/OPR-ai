
export interface ImageEntry {
  url: string;
  focalPoint: { x: number; y: number } | null;
  isProcessing?: boolean;
}

export interface ReportData {
  title: string;
  programDate: string;
  description: string;
  objective: string;
  impact: string;
  images: ImageEntry[];
  layoutType: 'vertical' | 'horizontal';
  themeColor?: string;
}

export interface GeminiResponse {
  title: string;
  description: string;
  objective: string;
  impact: string;
}
