export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar: string
          level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro'
          points: number
          streak: number
          last_active_date: string | null
          total_sessions: number
          total_minutes: number
          learning_goal: string | null
          proficiency_level: string | null
          wins: number
          losses: number
          draws: number
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar?: string
          level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro'
          points?: number
          streak?: number
          last_active_date?: string | null
          total_sessions?: number
          total_minutes?: number
          learning_goal?: string | null
          proficiency_level?: string | null
          wins?: number
          losses?: number
          draws?: number
          created_at?: string
        }
        Update: {
          username?: string
          avatar?: string
          level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro'
          points?: number
          streak?: number
          last_active_date?: string | null
          total_sessions?: number
          total_minutes?: number
          learning_goal?: string | null
          proficiency_level?: string | null
          wins?: number
          losses?: number
          draws?: number
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          topic: string
          duration_minutes: number
          grammar_score: number
          fluency_score: number
          confidence_score: number
          error_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          duration_minutes?: number
          grammar_score?: number
          fluency_score?: number
          confidence_score?: number
          error_count?: number
          created_at?: string
        }
        Update: {
          duration_minutes?: number
          grammar_score?: number
          fluency_score?: number
          confidence_score?: number
          error_count?: number
        }
        Relationships: []
      }
      battle_rooms: {
        Row: {
          id: string
          error_limit: number
          status: 'waiting' | 'active' | 'completed'
          winner_id: string | null
          created_at: string
          started_at: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          error_limit: number
          status?: 'waiting' | 'active' | 'completed'
          winner_id?: string | null
          created_at?: string
          started_at?: string | null
          ended_at?: string | null
        }
        Update: {
          status?: 'waiting' | 'active' | 'completed'
          winner_id?: string | null
          started_at?: string | null
          ended_at?: string | null
        }
        Relationships: []
      }
      battle_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          error_count: number
          accuracy: number
          is_ready: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          error_count?: number
          accuracy?: number
          is_ready?: boolean
          joined_at?: string
        }
        Update: {
          error_count?: number
          accuracy?: number
          is_ready?: boolean
        }
        Relationships: []
      }
      matchmaking_queue: {
        Row: {
          id: string
          user_id: string
          error_limit: number
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          error_limit: number
          joined_at?: string
        }
        Update: {
          error_limit?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_session_stats: {
        Args: { p_user_id: string; p_minutes: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
