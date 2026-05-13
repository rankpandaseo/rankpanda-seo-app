export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface Keyword {
  id: string;
  userId: string;
  keyword: string;
  searchVolume?: number;
  intent?: string;
  status: string;
  createdAt: Date;
}

export interface Session {
  userId: string;
  expiresAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}
