/**
 * Tipos do banco de dados Supabase
 * 
 * Este arquivo define a estrutura do banco de dados para tipagem forte.
 * IMPORTANTE: Mantenha sincronizado com o schema do Supabase.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      quizzes: {
        Row: {
          id: string;
          session_id: string;
          about_who: string;
          style: string;
          desired_tone: string | null;
          music_prompt: string | null;
          vocal_gender: string | null;
          customer_name: string | null;
          extra_info: string | null;
          language: string | null;
          relation: string | null;
          occasion: string | null;
          memories: string | null;
          qualities: string | null;
          emotions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          about_who: string;
          style: string;
          desired_tone?: string | null;
          music_prompt?: string | null;
          vocal_gender?: string | null;
          customer_name?: string | null;
          extra_info?: string | null;
          language?: string | null;
          relation?: string | null;
          occasion?: string | null;
          memories?: string | null;
          qualities?: string | null;
          emotions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          about_who?: string;
          style?: string;
          desired_tone?: string | null;
          music_prompt?: string | null;
          vocal_gender?: string | null;
          customer_name?: string | null;
          extra_info?: string | null;
          language?: string | null;
          relation?: string | null;
          occasion?: string | null;
          memories?: string | null;
          qualities?: string | null;
          emotions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          quiz_id: string;
          customer_email: string;
          customer_whatsapp: string | null;
          plan: string;
          amount_cents: number;
          status: string;
          provider: string;
          transaction_id: string | null;
          magic_token: string;
          user_id: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          customer_email: string;
          customer_whatsapp?: string | null;
          plan: string;
          amount_cents: number;
          status?: string;
          provider: string;
          transaction_id?: string | null;
          magic_token?: string;
          user_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          customer_email?: string;
          customer_whatsapp?: string | null;
          plan?: string;
          amount_cents?: number;
          status?: string;
          provider?: string;
          transaction_id?: string | null;
          magic_token?: string;
          user_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      songs: {
        Row: {
          id: string;
          order_id: string;
          title: string;
          variant_number: number;
          cover_url: string | null;
          audio_url: string | null;
          download_url: string | null;
          vocals_url: string | null;
          instrumental_url: string | null;
          status: string;
          style: string | null;
          release_at: string | null;
          email_sent: boolean;
          stems_separated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          title: string;
          variant_number?: number;
          cover_url?: string | null;
          audio_url?: string | null;
          download_url?: string | null;
          vocals_url?: string | null;
          instrumental_url?: string | null;
          status?: string;
          style?: string | null;
          release_at?: string | null;
          email_sent?: boolean;
          stems_separated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          title?: string;
          variant_number?: number;
          cover_url?: string | null;
          audio_url?: string | null;
          download_url?: string | null;
          vocals_url?: string | null;
          instrumental_url?: string | null;
          status?: string;
          style?: string | null;
          release_at?: string | null;
          email_sent?: boolean;
          stems_separated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lyrics_approvals: {
        Row: {
          id: string;
          order_id: string;
          job_id: string | null;
          quiz_id: string;
          lyrics: Json;
          lyrics_preview: string;
          status: string;
          expires_at: string;
          rejection_reason: string | null;
          regeneration_count: number;
          approval_token: string;
          voice: string | null;
          is_highlighted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          job_id?: string | null;
          quiz_id: string;
          lyrics: Json;
          lyrics_preview: string;
          status?: string;
          expires_at: string;
          rejection_reason?: string | null;
          regeneration_count?: number;
          approval_token?: string;
          voice?: string | null;
          is_highlighted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          job_id?: string | null;
          quiz_id?: string;
          lyrics?: Json;
          lyrics_preview?: string;
          status?: string;
          expires_at?: string;
          rejection_reason?: string | null;
          regeneration_count?: number;
          approval_token?: string;
          voice?: string | null;
          is_highlighted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          song_id: string | null;
          order_id: string | null;
          email_type: string;
          recipient: string;
          status: string;
          error_message: string | null;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          song_id?: string | null;
          order_id?: string | null;
          email_type: string;
          recipient: string;
          status?: string;
          error_message?: string | null;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          song_id?: string | null;
          order_id?: string | null;
          email_type?: string;
          recipient?: string;
          status?: string;
          error_message?: string | null;
          sent_at?: string;
          created_at?: string;
        };
      };
      email_templates: {
        Row: {
          id: string;
          template_type: string;
          subject: string;
          content: string;
          language: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_type: string;
          subject: string;
          content: string;
          language?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_type?: string;
          subject?: string;
          content?: string;
          language?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          author: string;
          avatar_url: string | null;
          content: string;
          rating: number;
          language: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author: string;
          avatar_url?: string | null;
          content: string;
          rating?: number;
          language?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author?: string;
          avatar_url?: string | null;
          content?: string;
          rating?: number;
          language?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          language: string;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          language?: string;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          language?: string;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      regional_pricing: {
        Row: {
          id: string;
          country_code: string;
          currency: string;
          standard_price: number;
          express_price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          country_code: string;
          currency: string;
          standard_price: number;
          express_price: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          country_code?: string;
          currency?: string;
          standard_price?: number;
          express_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      social_proof_messages: {
        Row: {
          id: string;
          message: string;
          language: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          message: string;
          language?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          message?: string;
          language?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      collaborators: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          name: string | null;
          permissions: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          name?: string | null;
          permissions?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          name?: string | null;
          permissions?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      affiliates: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          name: string;
          code: string;
          commission_rate: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          name: string;
          code: string;
          commission_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          name?: string;
          code?: string;
          commission_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      checkout_logs: {
        Row: {
          id: string;
          session_id: string;
          event_type: string;
          event_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          event_type: string;
          event_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          event_type?: string;
          event_data?: Json;
          created_at?: string;
        };
      };
      behavior_events: {
        Row: {
          id: string;
          session_id: string;
          event_type: string;
          page: string | null;
          element: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          event_type: string;
          page?: string | null;
          element?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          event_type?: string;
          page?: string | null;
          element?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      app_logs: {
        Row: {
          id: string;
          level: string;
          message: string;
          context: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          level: string;
          message: string;
          context?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          level?: string;
          message?: string;
          context?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Tipos auxiliares para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Aliases comuns
export type Quiz = Tables<'quizzes'>;
export type Order = Tables<'orders'>;
export type Song = Tables<'songs'>;
export type LyricsApproval = Tables<'lyrics_approvals'>;
export type EmailLog = Tables<'email_logs'>;
export type EmailTemplate = Tables<'email_templates'>;
export type Testimonial = Tables<'testimonials'>;
export type FAQ = Tables<'faqs'>;
export type RegionalPricing = Tables<'regional_pricing'>;
export type AdminUser = Tables<'admin_users'>;
export type Collaborator = Tables<'collaborators'>;
export type Affiliate = Tables<'affiliates'>;
