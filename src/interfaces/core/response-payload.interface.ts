export interface ResponsePayload {
  success: boolean;
  data?: any;
  count?: number;
  message?: string;
  total?: any;
  calculation?: any;
}

export interface ImageUploadResponse {
  name: string;
  size: number;
  url: string;
}


