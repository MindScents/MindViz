export interface EEGStream {
  name: string;
  srate: number;
  ch_names: string[];
  duration: number;
  data: number[][];
}

export interface UploadResponse {
  session_id: string;
  streams: EEGStream[];
}

export interface Ingredient {
  name: string;
  percentage: number;
  note: "top" | "middle" | "base";
}

export interface AnalyzeResponse {
  perfume_name: string;
  ingredients: Ingredient[];
}

export interface SaveResultRequest {
  perfume_name: string;
  ingredients: Ingredient[];
  user_name: string;
  user_email: string;
}

export interface SaveResultResponse {
  id: string;
  url: string;
}
