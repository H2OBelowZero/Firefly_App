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
          report_type: string
          client_name: string
          company_name: string
          facility_process: string
          construction_year: number
          status: 'draft' | 'review' | 'approved' | 'rejected'
          facility_location_id: string
          updated_at: string
          facility_location: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          report_type: string
          client_name: string
          company_name: string
          facility_process: string
          construction_year: number
          status: 'draft' | 'review' | 'approved' | 'rejected'
          facility_location_id: string
          updated_at?: string
          facility_location: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          report_type?: string
          client_name?: string
          company_name?: string
          facility_process?: string
          construction_year?: number
          status?: 'draft' | 'review' | 'approved' | 'rejected'
          facility_location_id?: string
          updated_at?: string
          facility_location?: string
        }
      }
      buildings: {
        Row: {
          id: string
          project_id: string
          name: string
          classification: string
          total_building_area: number
          cad_drawing: string
          aerial_view: string
          description: string
          lower_wall_materials: string
          upper_wall_materials: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          classification: string
          total_building_area: number
          cad_drawing: string
          aerial_view: string
          description: string
          lower_wall_materials: string
          upper_wall_materials: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          classification?: string
          total_building_area?: number
          cad_drawing?: string
          aerial_view?: string
          description?: string
          lower_wall_materials?: string
          upper_wall_materials?: string
        }
      }
      expected_commodities: {
        Row: {
          id: string
          created_at?: string
          project_id: string
          area_id: string
          name: string
          category: string
          stacking_height: number
          storage_type: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          area_id: string
          name: string
          category: string
          stacking_height: number
          storage_type: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          area_id?: string
          name?: string
          category?: string
          stacking_height?: number
          storage_type?: string
        }
      }
      rooms: {
        Row: {
          id: string
          created_at?: string
          project_id: string
          name: string
          description: string
          area_id: string
          photo: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
          description: string
          area_id: string
          photo: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
          description?: string
          area_id?: string
          photo?: string
        }
      }
      areas: {
        Row: {
          id: string
          created_at?: string
          project_id: string
          building_id: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          building_id: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          building_id?: string
          name?: string
        }
      }
      special_risks: {
        Row: {
          id: string
          created_at?: string
          project_id: string
          risk_type: string
          photo: string | null
          description: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          risk_type: string
          photo: string | null
          description: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          risk_type?: string
          photo?: string | null
          description?: string
        }
      }
      escape_routes: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
        }
    }
      fire_hose_reels: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
        }
      }
      fire_extinguishers: {
        Row: {
          id: string
          created_at: string
          project_id: string
          extinguisher_type: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          extinguisher_type: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          extinguisher_type?: string
        }
      }
      fire_hydrants: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
        }
      }
      fire_detection: {
        Row: {
          id: string
          created_at: string
          system_type: string
          alarm_panel_photo: string
        }
        Insert: {
          id?: string
          created_at?: string
          system_type: string
          alarm_panel_photo: string
        }
        Update: {
          id?: string
          created_at?: string
          system_type?: string
          alarm_panel_photo?: string
        }
      }
      separations: {
        Row: {
          id: string
          created_at?: string
          project_id: string
          first_building_id: string
          second_building_id: string
          first_area_id: string
          second_area_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          first_building_id: string
          second_building_id: string
          first_area_id: string
          second_area_id: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          first_building_id?: string
          second_building_id?: string
          first_area_id?: string
          second_area_id?: string
        }
      }
      automatic_fire_extinguishment_areas: {
        Row: {
          id: string
          project_id: string
          area_id: string
        }
        Insert: {
          id?: string
          project_id: string
          area_id: string
        }
        Update: {
          id?: string
          project_id?: string
          area_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          company: string | null
          role: string | null
          email: string | null
          phone: string | null
          address: string | null
          notifications_enabled: boolean
          dark_mode: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          company?: string | null
          role?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          notifications_enabled?: boolean
          dark_mode?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          company?: string | null
          role?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          notifications_enabled?: boolean
          dark_mode?: boolean
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