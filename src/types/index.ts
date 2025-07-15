export interface ConceptResponse {
  concept: string;
  explanation: string;
}

// Authentication types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthError {
  detail: string;
}

// History types
export interface HistoryEntry {
  id: number;
  concept: string;
  explanation: string;
  created_at: string;
  user_id: number;
}

export interface HistoryResponse {
  entries: HistoryEntry[];
  total: number;
}
