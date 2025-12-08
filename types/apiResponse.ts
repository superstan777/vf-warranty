// types/apiResponse.ts
export interface ApiResponse<T = unknown, D = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  details?: D;
}
