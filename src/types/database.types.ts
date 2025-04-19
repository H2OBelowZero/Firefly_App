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
        }
      }
      facility_locations: {
        Row: {
          id: string
          created_at: string
          town: string
          province: string
        }
        Insert: {
          id?: string
          created_at?: string
          town: string
          province: string
        }
        Update: {
          id?: string
          created_at?: string
          town?: string
          province?: string
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
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          classification: string
          total_building_area: number
          cad_drawing: string
          aerial_view: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          classification?: string
          total_building_area?: number
          cad_drawing?: string
          aerial_view?: string
        }
      }
      building_construction_materials: {
        Row: {
          id: string
          brick: boolean
          steel: boolean
          concrete: boolean
          timber: boolean
          other: string | null
        }
        Insert: {
          id?: string
          brick: boolean
          steel: boolean
          concrete: boolean
          timber: boolean
          other?: string | null
        }
        Update: {
          id?: string
          brick?: boolean
          steel?: boolean
          concrete?: boolean
          timber?: boolean
          other?: string | null
        }
      }
      expected_commodities: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
          category: string
          stacking_height: number
          storage_type: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
          category: string
          stacking_height: number
          storage_type: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
          category?: string
          stacking_height?: number
          storage_type?: string
        }
      }
      zones: {
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
      zone_photos: {
        Row: {
          id: string
          created_at: string
          zone_id: string
          photo_url: string
        }
        Insert: {
          id?: string
          created_at?: string
          zone_id: string
          photo_url: string
        }
        Update: {
          id?: string
          created_at?: string
          zone_id?: string
          photo_url?: string
        }
      }
      special_risks: {
        Row: {
          id: string
          created_at: string
          project_id: string
          risk_type: string
          location: string
          details: string
          photo_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          risk_type: string
          location: string
          details: string
          photo_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          risk_type?: string
          location?: string
          details?: string
          photo_url?: string | null
        }
      }
      escape_routes: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
          travel_distance: number
          width: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
          travel_distance: number
          width: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
          travel_distance?: number
          width?: number
        }
      }
      emergency_staircases: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
          width: number
          fire_rated: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
          width: number
          fire_rated: boolean
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
          width?: number
          fire_rated?: boolean
        }
      }
      signage_items: {
        Row: {
          id: string
          created_at: string
          project_id: string
          sign_type: string
          location: string
          photoluminescent: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          sign_type: string
          location: string
          photoluminescent: boolean
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          sign_type?: string
          location?: string
          photoluminescent?: boolean
        }
      }
      emergency_lighting_zones: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
          duration: number
          lux_level: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
          duration: number
          lux_level: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
          duration?: number
          lux_level?: number
        }
      }
      fire_hose_reels: {
        Row: {
          id: string
          created_at: string
          project_id: string
          location: string
          hose_length: number
          coverage_radius: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          location: string
          hose_length: number
          coverage_radius: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          location?: string
          hose_length?: number
          coverage_radius?: number
        }
      }
      fire_extinguishers: {
        Row: {
          id: string
          created_at: string
          project_id: string
          extinguisher_type: string
          location: string
          capacity: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          extinguisher_type: string
          location: string
          capacity: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          extinguisher_type?: string
          location?: string
          capacity?: number
        }
      }
      fire_hydrants: {
        Row: {
          id: string
          created_at: string
          project_id: string
          location: string
          hydrant_type: string
          flow_rate: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          location: string
          hydrant_type: string
          flow_rate: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          location?: string
          hydrant_type?: string
          flow_rate?: number
        }
      }
      firewater: {
        Row: {
          id: string
          created_at: string
          source: string
          capacity: number
          pressure: number
        }
        Insert: {
          id?: string
          created_at?: string
          source: string
          capacity: number
          pressure: number
        }
        Update: {
          id?: string
          created_at?: string
          source?: string
          capacity?: number
          pressure?: number
        }
      }
      fire_detection: {
        Row: {
          id: string
          created_at: string
          system_type: string
          number_of_zones: number
          battery_backup: number
        }
        Insert: {
          id?: string
          created_at?: string
          system_type: string
          number_of_zones: number
          battery_backup: number
        }
        Update: {
          id?: string
          created_at?: string
          system_type?: string
          number_of_zones?: number
          battery_backup?: number
        }
      }
      fire_alarm_panel: {
        Row: {
          id: string
          created_at: string
          panel_layout: string
          zone_name: string
        }
        Insert: {
          id?: string
          created_at?: string
          panel_layout: string
          zone_name: string
        }
        Update: {
          id?: string
          created_at?: string
          panel_layout?: string
          zone_name?: string
        }
      }
      smoke_ventilation_zones: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
          area: number
          ventilation_rate: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
          area: number
          ventilation_rate: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
          area?: number
          ventilation_rate?: number
        }
      }
      mandatory_actions: {
        Row: {
          id: string
          created_at: string
          project_id: string
          description: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          description: string
        }
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          description?: string
        }
      }
      optional_actions: {
        Row: {
          id: string
          created_at: string
          project_id: string
          description: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          description: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          description?: string
        }
      }
      engineer_signoff: {
        Row: {
          id: string
          created_at: string
          project_id: string
          engineer_name: string
          license_number: string
          date: string
          comments: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          engineer_name: string
          license_number: string
          date: string
          comments: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          engineer_name?: string
          license_number?: string
          date?: string
          comments?: string
        }
      }
      occupancy_separations: {
        Row: {
          id: string
          created_at: string
          separation_type: string
          rating: number
        }
        Insert: {
          id?: string
          created_at?: string
          separation_type: string
          rating: number
        }
        Update: {
          id?: string
          created_at?: string
          separation_type?: string
          rating?: number
        }
      }
      divisional_separations: {
        Row: {
          id: string
          created_at: string
          fire_rated_walls: boolean
          fire_rated_doors: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          fire_rated_walls: boolean
          fire_rated_doors: boolean
        }
        Update: {
          id?: string
          created_at?: string
          fire_rated_walls?: boolean
          fire_rated_doors?: boolean
        }
      }
      automatic_fire_extinguishment_areas: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
          commodity_name: string
          maximum_stacking_height: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
          commodity_name: string
          maximum_stacking_height: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
          commodity_name?: string
          maximum_stacking_height?: number
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