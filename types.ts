export enum AppStep {
  SELECT_PERSON = 1,
  SELECT_CLOTHES = 2,
  GENERATE_RESULT = 3,
}

export interface ImageAsset {
  id: string;
  url: string; // Can be a remote URL or a base64 data URI
  isBase64?: boolean;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_CLOTHES = 'GENERATING_CLOTHES',
  GENERATING_TRYON = 'GENERATING_TRYON',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface HistoryItem {
  id: string;
  personUrl: string;
  clothesUrl: string;
  resultUrl: string;
  timestamp: number;
}