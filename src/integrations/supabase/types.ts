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
          session_id: string | null;
          user_id: string | null;
          customer_email: string | null;
          customer_whatsapp: string | null;
          about_who: string;
          relationship: string | null;
          style: string;
          language: string | null;
          vocal_gender: string | null;
          qualities: Json | null;
          memories: Json | null;
          message: string | null;
          key_moments: Json | null;
          occasion: string | null;
          desired_tone: string | null;
          answers: Json | null;
          transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          user_id?: string | null;
          customer_email?: string | null;
          customer_whatsapp?: string | null;
          about_who: string;
          relationship?: string | null;
          style: string;
          language?: string | null;
          vocal_gender?: string | null;
          qualities?: Json | null;
          memories?: Json | null;
          message?: string | null;
          key_moments?: Json | null;
          occasion?: string | null;
          desired_tone?: string | null;
          answers?: Json | null;
          transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          user_id?: string | null;
          customer_email?: string | null;
          customer_whatsapp?: string | null;
          about_who?: string;
          relationship?: string | null;
          style?: string;
          language?: string | null;
          vocal_gender?: string | null;
          qualities?: Json | null;
          memories?: Json | null;
          message?: string | null;
          key_moments?: Json | null;
          occasion?: string | null;
          desired_tone?: string | null;
          answers?: Json | null;
          transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          payment_provider: string | null;
          cakto_payment_url: string | null;
          cakto_payment_status: string | null;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          provider_ref: string | null;
          is_test_order: boolean | null;
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
          payment_provider?: string | null;
          cakto_payment_url?: string | null;
          cakto_payment_status?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          provider_ref?: string | null;
          is_test_order?: boolean | null;
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
          payment_provider?: string | null;
          cakto_payment_url?: string | null;
          cakto_payment_status?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          provider_ref?: string | null;
          is_test_order?: boolean | null;
          transaction_id?: string | null;
          magic_token?: string;
          user_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      songs: {
        Row: {
          id: string;
          order_id: string;
          quiz_id: string | null;
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
          released_at: string | null;
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
          quiz_id?: string | null;
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      checkout_events: {
        Row: {
          id: string;
          transaction_id: string;
          order_id: string | null;
          event_type: string;
          payload: Json;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          order_id?: string | null;
          event_type: string;
          payload?: Json;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          order_id?: string | null;
          event_type?: string;
          payload?: Json;
          error?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_logs: {
        Row: {
          id: string;
          admin_user_id: string | null;
          action: string;
          target_table: string;
          target_id: string | null;
          changes: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id?: string | null;
          action: string;
          target_table: string;
          target_id?: string | null;
          changes?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string | null;
          action?: string;
          target_table?: string;
          target_id?: string | null;
          changes?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      checkout_links: {
        Row: {
          id: string;
          order_id: string;
          quiz_id: string;
          token: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          quiz_id: string;
          token: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          quiz_id?: string;
          token?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      user_roles: {
        Row: { id?: string; user_id: string; role: string };
        Insert: { id?: string; user_id: string; role?: string };
        Update: { id?: string; user_id?: string; role?: string };
        Relationships: [];
      };
      collaborator_permissions: {
        Row: { id?: string; user_id: string; permission_key: string; granted: boolean };
        Insert: { id?: string; user_id: string; permission_key?: string; granted?: boolean };
        Update: { id?: string; user_id?: string; permission_key?: string; granted?: boolean };
        Relationships: [];
      };
      example_tracks: {
        Row: { id?: string; title: string; artist: string; audio_path: string; cover_path: string; language?: string; is_active?: boolean };
        Insert: { id?: string; title?: string; artist?: string; audio_path?: string; cover_path?: string; language?: string; is_active?: boolean };
        Update: { id?: string; title?: string; artist?: string; audio_path?: string; cover_path?: string; language?: string; is_active?: boolean };
        Relationships: [];
      };
      quiz_retry_queue: {
        Row: {
          id: string;
          session_id: string | null;
          quiz_payload: Json;
          attempts: number;
          max_attempts: number;
          last_error: string | null;
          status: string;
          next_retry_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          quiz_payload: Json;
          attempts?: number;
          max_attempts?: number;
          last_error?: string | null;
          status?: string;
          next_retry_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          quiz_payload?: Json;
          attempts?: number;
          max_attempts?: number;
          last_error?: string | null;
          status?: string;
          next_retry_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          order_id: string;
          suno_task_id: string | null;
          suno_audio_url: string | null;
          status: string;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          suno_task_id?: string | null;
          suno_audio_url?: string | null;
          status?: string;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          suno_task_id?: string | null;
          suno_audio_url?: string | null;
          status?: string;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      /** Permite tabelas não declaradas - evita erros de tipo 'never' em tabelas dinâmicas */
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      count_lyrics_approvals_by_status: {
        Args: { p_status: string; p_include_expired: boolean };
        Returns: number;
      };
      get_quiz_by_id: {
        Args: { quiz_id_param: string };
        Returns: Database['public']['Tables']['quizzes']['Row'][];
      };
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
