
export interface ReportData {
  title: string;
  programDate: string;
  description: string;
  objective: string;
  impact: string;
  images: string[];
  layoutType: 'vertical' | 'horizontal';
  themeColor?: string; // Hex color extracted from images
}

export interface GeminiResponse {
  title: string;
  description: string;
  objective: string;
  impact: string;
}
