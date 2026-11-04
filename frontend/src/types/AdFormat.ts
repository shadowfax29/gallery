export interface AdFormat {
  id: string;
  name: string;
  type: 'display' | 'video';
  category: string;
  description: string;
  examples: AdExample[];
  previewUrl?: string;
}

export interface AdExample {
  id: string;
  title: string;
  siteUrl: string;
  previewImage: string;
  description: string;
}

export interface AdSize {
  width: number;
  height: number;
  label: string;
  type: 'banner' | 'rectangle' | 'leaderboard' | 'mobile' | 'skyscraper';
}

export interface SliderAdSize {
  width: number;
  height: number;
  label: string;
  type: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface IntAdSize {
  width: number;
  height: number;
  label: string;
  type: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface StayOnAdSize {
  width: number;
  height: number;
  label: string;
  type: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface IntAdTags {
  label: string;
  tag: string;
}

export interface StayOnAdTags {
  label: string;
  device: string;
  tag: string;
}

export interface SliderAdTags {
  label: string;
  tag: string;
}

export interface DeviceType {
  id:  'desktop' | 'mobile' | 'tablet';
  name: string;
  width: number;
  height: number;
  hasFrame: boolean;
}

export interface PreviewSettings {
  adFormat: AdFormat;
  adSize: AdSize;
  deviceType: DeviceType;
  siteUrl: string;
  tagScript: string;
}