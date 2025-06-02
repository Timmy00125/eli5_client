export interface ConceptResponse {
  concept: string;
  explanation: string;
}

// Authentication types
export interface User {
  id: string;
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
  id: string;
  concept: string;
  explanation: string;
  created_at: string;
  user_id: string;
}

export interface HistoryResponse {
  entries: HistoryEntry[];
  total: number;
}
