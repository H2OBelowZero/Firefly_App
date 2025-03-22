export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          client_name: string
          location: string
          municipality: string
          description: string
          building_type: string
          stories: number
          total_area: number
          occupancy_load: number
          fire_protection: Json
          floor_plans: string[]
          floor_names: string[]
          auto_detection: Json
          status: 'draft' | 'review' | 'approved' | 'rejected'
          compliance_score: number
          last_edited_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          client_name: string
          location: string
          municipality: string
          description: string
          building_type: string
          stories: number
          total_area: number
          occupancy_load: number
          fire_protection: Json
          floor_plans: string[]
          floor_names: string[]
          auto_detection: Json
          status: 'draft' | 'review' | 'approved' | 'rejected'
          compliance_score: number
          last_edited_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          client_name?: string
          location?: string
          municipality?: string
          description?: string
          building_type?: string
          stories?: number
          total_area?: number
          occupancy_load?: number
          fire_protection?: Json
          floor_plans?: string[]
          floor_names?: string[]
          auto_detection?: Json
          status?: 'draft' | 'review' | 'approved' | 'rejected'
          compliance_score?: number
          last_edited_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string | null
          avatar_url: string | null
          company: string | null
          role: string | null
        }
        Insert: {
          id: string
          created_at?: string
          full_name?: string | null
          avatar_url?: string | null
          company?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string | null
          avatar_url?: string | null
          company?: string | null
          role?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 