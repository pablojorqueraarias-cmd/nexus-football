// Tipos escritos a mano reflejando supabase/schema.sql +
// supabase/migration_site_content.sql + supabase/migration_player_features.sql.
// Reemplazar por el output de `supabase gen types typescript` cuando se pueda.

export type UserRole = "admin" | "parent" | "player";
export type PlayerStatus = "activo" | "inactivo";
export type InscriptionStatus = "pendiente" | "aprobada" | "rechazada";
export type PaymentMethod = "transferencia" | "efectivo";
export type PaymentStatus = "pendiente" | "pagado";
export type DayOfWeek =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";
export type CriterionPhase = "general" | "defensiva" | "ofensiva";
export type MediaType = "photo" | "video";

export interface Database {
  public: {
    Views: {
      player_stats_summary: {
        Row: {
          player_id: string;
          full_name: string;
          total_minutes: number;
          total_goals: number;
          total_assists: number;
          matches_played: number;
          sessions_present: number;
          sessions_total: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          phone?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          age_range: string | null;
          description: string | null;
          display_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          age_range?: string | null;
          description?: string | null;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      schedules: {
        Row: {
          id: string;
          category_id: string;
          day_of_week: DayOfWeek;
          start_time: string;
          end_time: string;
          location: string;
          display_order: number;
        };
        Insert: {
          id?: string;
          category_id: string;
          day_of_week: DayOfWeek;
          start_time: string;
          end_time: string;
          location: string;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["schedules"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "schedules_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      players: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string | null;
          category_id: string | null;
          parent_id: string | null;
          user_id: string | null;
          position_id: string | null;
          status: PlayerStatus;
          is_scholarship: boolean;
          notes: string | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date?: string | null;
          category_id?: string | null;
          parent_id?: string | null;
          user_id?: string | null;
          position_id?: string | null;
          status?: PlayerStatus;
          is_scholarship?: boolean;
          notes?: string | null;
          photo_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["players"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "players_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "players_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "players_position_id_fkey";
            columns: ["position_id"];
            isOneToOne: false;
            referencedRelation: "positions";
            referencedColumns: ["id"];
          }
        ];
      };
      inscriptions: {
        Row: {
          id: string;
          child_full_name: string;
          birth_date: string | null;
          desired_category_id: string | null;
          parent_full_name: string;
          parent_email: string;
          parent_phone: string | null;
          message: string | null;
          status: InscriptionStatus;
          reviewed_by: string | null;
          created_player_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_full_name: string;
          birth_date?: string | null;
          desired_category_id?: string | null;
          parent_full_name: string;
          parent_email: string;
          parent_phone?: string | null;
          message?: string | null;
          status?: InscriptionStatus;
          reviewed_by?: string | null;
          created_player_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["inscriptions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "inscriptions_desired_category_id_fkey";
            columns: ["desired_category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inscriptions_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inscriptions_created_player_id_fkey";
            columns: ["created_player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          player_id: string;
          period: string;
          amount: number;
          method: PaymentMethod;
          status: PaymentStatus;
          due_date: string | null;
          registered_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          period: string;
          amount: number;
          method?: PaymentMethod;
          status?: PaymentStatus;
          due_date?: string | null;
          registered_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "payments_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_registered_by_fkey";
            columns: ["registered_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          is_read?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
        Relationships: [];
      };
      gallery_items: {
        Row: {
          id: string;
          storage_path: string | null;
          media_type: MediaType;
          video_url: string | null;
          category_id: string | null;
          is_featured: boolean;
          caption: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          storage_path?: string | null;
          media_type?: MediaType;
          video_url?: string | null;
          category_id?: string | null;
          is_featured?: boolean;
          caption?: string | null;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "gallery_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      player_media: {
        Row: {
          id: string;
          player_id: string;
          media_type: MediaType;
          storage_path: string | null;
          video_url: string | null;
          caption: string | null;
          uploaded_by: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          media_type: MediaType;
          storage_path?: string | null;
          video_url?: string | null;
          caption?: string | null;
          uploaded_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["player_media"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "player_media_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      site_content: {
        Row: {
          id: number;
          hero_eyebrow: string;
          hero_description: string;
          cta_description: string;
          footer_description: string;
          location: string;
          bank_name: string | null;
          bank_account_type: string | null;
          bank_account_number: string | null;
          bank_account_holder: string | null;
          bank_account_rut: string | null;
          bank_transfer_email: string | null;
        };
        Insert: {
          id?: number;
          hero_eyebrow?: string;
          hero_description?: string;
          cta_description?: string;
          footer_description?: string;
          location?: string;
          bank_name?: string | null;
          bank_account_type?: string | null;
          bank_account_number?: string | null;
          bank_account_holder?: string | null;
          bank_account_rut?: string | null;
          bank_transfer_email?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["site_content"]["Insert"]>;
        Relationships: [];
      };
      positions: {
        Row: {
          id: string;
          code: string;
          name: string;
          has_phases: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          has_phases?: boolean;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["positions"]["Insert"]>;
        Relationships: [];
      };
      checklist_criteria: {
        Row: {
          id: string;
          position_id: string | null;
          phase: CriterionPhase;
          label: string;
          description: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          position_id?: string | null;
          phase?: CriterionPhase;
          label: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["checklist_criteria"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "checklist_criteria_position_id_fkey";
            columns: ["position_id"];
            isOneToOne: false;
            referencedRelation: "positions";
            referencedColumns: ["id"];
          }
        ];
      };
      evaluations: {
        Row: {
          id: string;
          player_id: string;
          evaluated_by: string;
          strengths: string | null;
          weaknesses: string | null;
          conclusion: string | null;
          match_context: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          evaluated_by: string;
          strengths?: string | null;
          weaknesses?: string | null;
          conclusion?: string | null;
          match_context?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["evaluations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "evaluations_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluations_evaluated_by_fkey";
            columns: ["evaluated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      evaluation_items: {
        Row: {
          id: string;
          evaluation_id: string;
          criterion_id: string;
          highlight: boolean;
          comment: string | null;
        };
        Insert: {
          id?: string;
          evaluation_id: string;
          criterion_id: string;
          highlight: boolean;
          comment?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["evaluation_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "evaluation_items_evaluation_id_fkey";
            columns: ["evaluation_id"];
            isOneToOne: false;
            referencedRelation: "evaluations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluation_items_criterion_id_fkey";
            columns: ["criterion_id"];
            isOneToOne: false;
            referencedRelation: "checklist_criteria";
            referencedColumns: ["id"];
          }
        ];
      };
      attendance: {
        Row: {
          id: string;
          player_id: string;
          session_date: string;
          present: boolean;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          session_date: string;
          present?: boolean;
          notes?: string | null;
          recorded_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["attendance"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "attendance_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          match_date: string;
          opponent: string | null;
          category_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_date: string;
          opponent?: string | null;
          category_id?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "matches_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      player_match_stats: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          minutes_played: number;
          goals: number;
          assists: number;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          minutes_played?: number;
          goals?: number;
          assists?: number;
        };
        Update: Partial<Database["public"]["Tables"]["player_match_stats"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "player_match_stats_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_match_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      player_documents: {
        Row: {
          id: string;
          player_id: string;
          storage_path: string;
          file_name: string;
          category: string | null;
          uploaded_by: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          storage_path: string;
          file_name: string;
          category?: string | null;
          uploaded_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["player_documents"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "player_documents_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
    };
  };
}
