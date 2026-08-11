// Tipos escritos a mano reflejando supabase/schema.sql.
// Reemplazar por el output de `supabase gen types typescript` una vez
// el proyecto Supabase esté conectado (ver README de setup).

export type UserRole = "admin" | "parent";
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

export interface Database {
  public: {
    Views: Record<string, never>;
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
          status: PlayerStatus;
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
          status?: PlayerStatus;
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
          storage_path: string;
          caption: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          storage_path: string;
          caption?: string | null;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_items"]["Insert"]>;
        Relationships: [];
      };
      site_content: {
        Row: {
          id: number;
          hero_eyebrow: string;
          hero_description: string;
          cta_description: string;
          footer_description: string;
          location: string;
        };
        Insert: {
          id?: number;
          hero_eyebrow?: string;
          hero_description?: string;
          cta_description?: string;
          footer_description?: string;
          location?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_content"]["Insert"]>;
        Relationships: [];
      };
    };
  };
}
