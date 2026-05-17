/**
 * Tipos do banco Supabase (projeto zagkvtxarndluusiluhb — Musiclovely).
 * Gerado via MCP user-supabase generate_typescript_types.
 * Regenerar: MCP no projeto ligado ou `npx supabase gen types typescript --project-id zagkvtxarndluusiluhb`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_auto_jobs: {
        Row: {
          enabled: boolean
          id: string
          job_type: string
          last_run_at: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          id?: string
          job_type: string
          last_run_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          id?: string
          job_type?: string
          last_run_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          changes: Json | null
          created_at: string | null
          id: string
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: string
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: string
          target_id?: string | null
          target_table?: string
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          commission_amount: number
          created_at: string
          id: string
          notes: string | null
          order_id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["affiliate_commission_status"]
        }
        Insert: {
          affiliate_id: string
          commission_amount: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["affiliate_commission_status"]
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["affiliate_commission_status"]
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          affiliate_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          slug: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          slug: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_withdrawals: {
        Row: {
          affiliate_id: string
          amount_cents: number
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: Database["public"]["Enums"]["affiliate_withdrawal_status"]
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          amount_cents: number
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["affiliate_withdrawal_status"]
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          amount_cents?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["affiliate_withdrawal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_withdrawals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          commission_percentage: number
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_active: boolean
          must_change_password: boolean | null
          name: string
          password_hash: string | null
          payment_details: Json | null
          payment_method: string | null
          updated_at: string
        }
        Insert: {
          commission_percentage?: number
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean
          must_change_password?: boolean | null
          name: string
          password_hash?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          updated_at?: string
        }
        Update: {
          commission_percentage?: number
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean
          must_change_password?: boolean | null
          name?: string
          password_hash?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      arquivo_audio: {
        Row: {
          created_at: string
          duracao_seconds: number | null
          formato: string
          id: string
          jingle_id: string | null
          parody_id: string | null
          stem_id: string | null
          storage_path: string
          tamanho_bytes: number | null
          tipo: string
          url_interna: string
        }
        Insert: {
          created_at?: string
          duracao_seconds?: number | null
          formato?: string
          id?: string
          jingle_id?: string | null
          parody_id?: string | null
          stem_id?: string | null
          storage_path: string
          tamanho_bytes?: number | null
          tipo: string
          url_interna: string
        }
        Update: {
          created_at?: string
          duracao_seconds?: number | null
          formato?: string
          id?: string
          jingle_id?: string | null
          parody_id?: string | null
          stem_id?: string | null
          storage_path?: string
          tamanho_bytes?: number | null
          tipo?: string
          url_interna?: string
        }
        Relationships: [
          {
            foreignKeyName: "arquivo_audio_jingle_id_fkey"
            columns: ["jingle_id"]
            isOneToOne: false
            referencedRelation: "jingles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arquivo_audio_parody_id_fkey"
            columns: ["parody_id"]
            isOneToOne: false
            referencedRelation: "parodies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arquivo_audio_stem_id_fkey"
            columns: ["stem_id"]
            isOneToOne: false
            referencedRelation: "stems"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_generations: {
        Row: {
          audio_id: string
          audio_url: string | null
          completed_at: string | null
          created_at: string | null
          generation_task_id: string
          id: string
          job_id: string | null
          order_id: string | null
          song_id: string | null
          status: Database["public"]["Enums"]["audio_generation_status"]
          updated_at: string | null
        }
        Insert: {
          audio_id: string
          audio_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          generation_task_id: string
          id?: string
          job_id?: string | null
          order_id?: string | null
          song_id?: string | null
          status?: Database["public"]["Enums"]["audio_generation_status"]
          updated_at?: string | null
        }
        Update: {
          audio_id?: string
          audio_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          generation_task_id?: string
          id?: string
          job_id?: string | null
          order_id?: string | null
          song_id?: string | null
          status?: Database["public"]["Enums"]["audio_generation_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_generations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_generations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "lyrics_with_approvals"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "audio_generations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_generations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_generations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "audio_generations_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_generations_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["song_id"]
          },
        ]
      }
      behavior_analytics: {
        Row: {
          created_at: string | null
          date: string
          event_count: number
          event_type: string
          id: string
          metadata: Json | null
          page_path: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          event_count?: number
          event_type: string
          id?: string
          metadata?: Json | null
          page_path: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          event_count?: number
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cakto_webhook_failures: {
        Row: {
          checkout_url: string | null
          created_at: string
          customer_email: string | null
          customer_phone: string | null
          id: string
          order_id_from_webhook: string | null
          reprocess_error: string | null
          reprocessed_at: string | null
          reprocessed_order_id: string | null
          transaction_id: string | null
          webhook_payload: Json | null
        }
        Insert: {
          checkout_url?: string | null
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          order_id_from_webhook?: string | null
          reprocess_error?: string | null
          reprocessed_at?: string | null
          reprocessed_order_id?: string | null
          transaction_id?: string | null
          webhook_payload?: Json | null
        }
        Update: {
          checkout_url?: string | null
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          order_id_from_webhook?: string | null
          reprocess_error?: string | null
          reprocessed_at?: string | null
          reprocessed_order_id?: string | null
          transaction_id?: string | null
          webhook_payload?: Json | null
        }
        Relationships: []
      }
      cakto_webhook_logs: {
        Row: {
          amount_cents: number | null
          created_at: string
          customer_email: string | null
          customer_phone: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          order_found: boolean | null
          order_id: string | null
          order_id_from_webhook: string | null
          order_status_after: string | null
          order_status_before: string | null
          processing_success: boolean | null
          processing_time_ms: number | null
          status_received: string | null
          strategy_used: string | null
          transaction_id: string | null
          user_agent: string | null
          webhook_body: Json | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          order_found?: boolean | null
          order_id?: string | null
          order_id_from_webhook?: string | null
          order_status_after?: string | null
          order_status_before?: string | null
          processing_success?: boolean | null
          processing_time_ms?: number | null
          status_received?: string | null
          strategy_used?: string | null
          transaction_id?: string | null
          user_agent?: string | null
          webhook_body?: Json | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          order_found?: boolean | null
          order_id?: string | null
          order_id_from_webhook?: string | null
          order_status_after?: string | null
          order_status_before?: string | null
          processing_success?: boolean | null
          processing_time_ms?: number | null
          status_received?: string | null
          strategy_used?: string | null
          transaction_id?: string | null
          user_agent?: string | null
          webhook_body?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cakto_webhook_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cakto_webhook_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cakto_webhook_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      cakto_webhooks: {
        Row: {
          amount: number | null
          amount_cents: number | null
          created_at: string | null
          currency: string | null
          customer_document: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          event_type: string | null
          headers: Json | null
          id: string
          ip_address: string | null
          order_id: string | null
          processed: boolean | null
          processed_at: string | null
          processing_error: string | null
          product_id: string | null
          product_name: string | null
          received_at: string | null
          signature: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
          user_agent: string | null
          webhook_data: Json
        }
        Insert: {
          amount?: number | null
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          customer_document?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          event_type?: string | null
          headers?: Json | null
          id?: string
          ip_address?: string | null
          order_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
          processing_error?: string | null
          product_id?: string | null
          product_name?: string | null
          received_at?: string | null
          signature?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_agent?: string | null
          webhook_data: Json
        }
        Update: {
          amount?: number | null
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          customer_document?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          event_type?: string | null
          headers?: Json | null
          id?: string
          ip_address?: string | null
          order_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
          processing_error?: string | null
          product_id?: string | null
          product_name?: string | null
          received_at?: string | null
          signature?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_agent?: string | null
          webhook_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "cakto_webhooks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cakto_webhooks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cakto_webhooks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "fk_cakto_webhooks_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cakto_webhooks_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cakto_webhooks_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      checkout_events: {
        Row: {
          created_at: string | null
          error: string | null
          event_type: string
          id: string
          order_id: string | null
          payload: Json | null
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          event_type: string
          id?: string
          order_id?: string | null
          payload?: Json | null
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          event_type?: string
          id?: string
          order_id?: string | null
          payload?: Json | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      checkout_links: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          order_id: string
          quiz_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          order_id: string
          quiz_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          order_id?: string
          quiz_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_links_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_links_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_links_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "checkout_links_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "orders_at_risk"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "checkout_links_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborator_permissions: {
        Row: {
          created_at: string | null
          granted: boolean
          id: string
          permission_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted?: boolean
          id?: string
          permission_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted?: boolean
          id?: string
          permission_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      download_logs: {
        Row: {
          created_at: string | null
          customer_email: string
          download_method: string | null
          downloaded_at: string
          id: string
          ip_address: string | null
          song_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          download_method?: string | null
          downloaded_at?: string
          id?: string
          ip_address?: string | null
          song_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          download_method?: string | null
          downloaded_at?: string
          id?: string
          ip_address?: string | null
          song_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_logs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["song_id"]
          },
        ]
      }
      email_funnel_completed: {
        Row: {
          ab_variant: string | null
          completed_at: string | null
          created_at: string | null
          current_step: number
          customer_email: string
          exit_reason: string | null
          id: string
          is_paused: boolean
          last_email_sent_at: string | null
          next_email_at: string | null
          order_amount_cents: number | null
          order_created_at: string | null
          order_id: string
          order_plan: string | null
          order_status: string
          quiz_about_who: string | null
          quiz_id: string | null
          updated_at: string | null
        }
        Insert: {
          ab_variant?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: number
          customer_email: string
          exit_reason?: string | null
          id?: string
          is_paused?: boolean
          last_email_sent_at?: string | null
          next_email_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id: string
          order_plan?: string | null
          order_status?: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ab_variant?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: number
          customer_email?: string
          exit_reason?: string | null
          id?: string
          is_paused?: boolean
          last_email_sent_at?: string | null
          next_email_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id?: string
          order_plan?: string | null
          order_status?: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_funnel_completed_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_funnel_completed_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_funnel_completed_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      email_funnel_exited: {
        Row: {
          ab_variant: string | null
          created_at: string | null
          current_step: number
          customer_email: string
          exit_reason: string
          exited_at: string | null
          id: string
          is_paused: boolean
          last_email_sent_at: string | null
          next_email_at: string | null
          order_amount_cents: number | null
          order_created_at: string | null
          order_id: string
          order_plan: string | null
          order_status: string
          quiz_about_who: string | null
          quiz_id: string | null
          updated_at: string | null
        }
        Insert: {
          ab_variant?: string | null
          created_at?: string | null
          current_step?: number
          customer_email: string
          exit_reason: string
          exited_at?: string | null
          id?: string
          is_paused?: boolean
          last_email_sent_at?: string | null
          next_email_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id: string
          order_plan?: string | null
          order_status: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ab_variant?: string | null
          created_at?: string | null
          current_step?: number
          customer_email?: string
          exit_reason?: string
          exited_at?: string | null
          id?: string
          is_paused?: boolean
          last_email_sent_at?: string | null
          next_email_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id?: string
          order_plan?: string | null
          order_status?: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_funnel_exited_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_funnel_exited_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_funnel_exited_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      email_funnel_pending: {
        Row: {
          ab_variant: string | null
          created_at: string | null
          current_step: number
          customer_email: string
          exit_reason: string | null
          id: string
          is_paused: boolean
          last_email_sent_at: string | null
          next_email_at: string | null
          order_amount_cents: number | null
          order_created_at: string | null
          order_id: string
          order_plan: string | null
          order_status: string
          quiz_about_who: string | null
          quiz_id: string | null
          updated_at: string | null
        }
        Insert: {
          ab_variant?: string | null
          created_at?: string | null
          current_step?: number
          customer_email: string
          exit_reason?: string | null
          id?: string
          is_paused?: boolean
          last_email_sent_at?: string | null
          next_email_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id: string
          order_plan?: string | null
          order_status?: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ab_variant?: string | null
          created_at?: string | null
          current_step?: number
          customer_email?: string
          exit_reason?: string | null
          id?: string
          is_paused?: boolean
          last_email_sent_at?: string | null
          next_email_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id?: string
          order_plan?: string | null
          order_status?: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_funnel_pending_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_funnel_pending_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_funnel_pending_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      email_logs: {
        Row: {
          bounce_reason: string | null
          bounced_at: string | null
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          email_type: string
          id: string
          metadata: Json | null
          opened_at: string | null
          order_id: string | null
          recipient_email: string
          resend_email_id: string | null
          sent_at: string
          song_id: string | null
          status: string
          template_used: string | null
        }
        Insert: {
          bounce_reason?: string | null
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_type: string
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          order_id?: string | null
          recipient_email: string
          resend_email_id?: string | null
          sent_at?: string
          song_id?: string | null
          status?: string
          template_used?: string | null
        }
        Update: {
          bounce_reason?: string | null
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_type?: string
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          order_id?: string | null
          recipient_email?: string
          resend_email_id?: string | null
          sent_at?: string
          song_id?: string | null
          status?: string
          template_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "email_logs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["song_id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string
          email_type: string
          id: string
          last_error: string | null
          max_retries: number
          metadata: Json | null
          next_retry_at: string | null
          order_id: string
          recipient_email: string
          retry_count: number
          song_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_type?: string
          id?: string
          last_error?: string | null
          max_retries?: number
          metadata?: Json | null
          next_retry_at?: string | null
          order_id: string
          recipient_email: string
          retry_count?: number
          song_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_type?: string
          id?: string
          last_error?: string | null
          max_retries?: number
          metadata?: Json | null
          next_retry_at?: string | null
          order_id?: string
          recipient_email?: string
          retry_count?: number
          song_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          language: string | null
          name: string
          subject: string
          template_type: string | null
          text_content: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          language?: string | null
          name: string
          subject: string
          template_type?: string | null
          text_content?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          language?: string | null
          name?: string
          subject?: string
          template_type?: string | null
          text_content?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates_en: {
        Row: {
          created_at: string | null
          from_email: string | null
          from_name: string | null
          html_content: string
          id: string
          reply_to: string | null
          subject: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content: string
          id?: string
          reply_to?: string | null
          subject: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content?: string
          id?: string
          reply_to?: string | null
          subject?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      email_templates_es: {
        Row: {
          created_at: string | null
          from_email: string | null
          from_name: string | null
          html_content: string
          id: string
          reply_to: string | null
          subject: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content: string
          id?: string
          reply_to?: string | null
          subject: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content?: string
          id?: string
          reply_to?: string | null
          subject?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      email_templates_i18n: {
        Row: {
          created_at: string | null
          from_email: string | null
          from_name: string | null
          html_content: string
          id: string
          language: string
          reply_to: string | null
          subject: string
          template_type: string
          text_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content: string
          id?: string
          language: string
          reply_to?: string | null
          subject: string
          template_type: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content?: string
          id?: string
          language?: string
          reply_to?: string | null
          subject?: string
          template_type?: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      email_templates_pt: {
        Row: {
          created_at: string | null
          from_email: string | null
          from_name: string | null
          html_content: string
          id: string
          reply_to: string | null
          subject: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content: string
          id?: string
          reply_to?: string | null
          subject: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content?: string
          id?: string
          reply_to?: string | null
          subject?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      email_unsubscribes: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string | null
          source: string | null
          unsubscribe_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          source?: string | null
          unsubscribe_token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          source?: string | null
          unsubscribe_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      example_tracks: {
        Row: {
          artist: string
          audio_path: string
          cover_path: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          language: string
          title: string
          updated_at: string | null
        }
        Insert: {
          artist: string
          audio_path: string
          cover_path?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          language: string
          title: string
          updated_at?: string | null
        }
        Update: {
          artist?: string
          audio_path?: string
          cover_path?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          language?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          locale: string | null
          question: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          locale?: string | null
          question: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          locale?: string | null
          question?: string
        }
        Relationships: []
      }
      generated_lyrics: {
        Row: {
          approved_at: string | null
          created_at: string | null
          customer_email: string
          id: string
          language: string | null
          lyrics_style: string | null
          lyrics_text: string
          order_id: string
          plan: string
          quiz_id: string | null
          rejected_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          customer_email: string
          id?: string
          language?: string | null
          lyrics_style?: string | null
          lyrics_text: string
          order_id: string
          plan: string
          quiz_id?: string | null
          rejected_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          customer_email?: string
          id?: string
          language?: string | null
          lyrics_style?: string | null
          lyrics_text?: string
          order_id?: string
          plan?: string
          quiz_id?: string | null
          rejected_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_lyrics_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_lyrics_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_lyrics_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "generated_lyrics_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "orders_at_risk"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "generated_lyrics_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_music: {
        Row: {
          created_at: string | null
          customer_email: string
          generated_at: string | null
          id: string
          instruments: string[] | null
          lyrics_id: string | null
          lyrics_text: string | null
          lyrics_theme: string | null
          mood: string | null
          music_style: string | null
          order_id: string
          plan: string
          prompt_used: string | null
          quiz_id: string | null
          status: string | null
          suno_response: Json | null
          tempo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          generated_at?: string | null
          id?: string
          instruments?: string[] | null
          lyrics_id?: string | null
          lyrics_text?: string | null
          lyrics_theme?: string | null
          mood?: string | null
          music_style?: string | null
          order_id: string
          plan: string
          prompt_used?: string | null
          quiz_id?: string | null
          status?: string | null
          suno_response?: Json | null
          tempo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          generated_at?: string | null
          id?: string
          instruments?: string[] | null
          lyrics_id?: string | null
          lyrics_text?: string | null
          lyrics_theme?: string | null
          mood?: string | null
          music_style?: string | null
          order_id?: string
          plan?: string
          prompt_used?: string | null
          quiz_id?: string | null
          status?: string | null
          suno_response?: Json | null
          tempo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_music_lyrics_id_fkey"
            columns: ["lyrics_id"]
            isOneToOne: false
            referencedRelation: "generated_lyrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_music_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_music_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_music_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "generated_music_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "orders_at_risk"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "generated_music_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      home_example_track: {
        Row: {
          artist: string | null
          audio_path: string | null
          cover_path: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          artist?: string | null
          audio_path?: string | null
          cover_path?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          artist?: string | null
          audio_path?: string | null
          cover_path?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      home_media: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          poster_path: string | null
          updated_at: string | null
          video_path: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          poster_path?: string | null
          updated_at?: string | null
          video_path?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          poster_path?: string | null
          updated_at?: string | null
          video_path?: string | null
        }
        Relationships: []
      }
      hotmart_webhook_logs: {
        Row: {
          amount_cents: number | null
          created_at: string
          customer_email: string | null
          error_message: string | null
          id: string
          order_found: boolean
          order_id_from_webhook: string | null
          processing_success: boolean
          processing_time_ms: number | null
          status_received: string | null
          strategy_used: string | null
          transaction_id: string | null
          updated_at: string
          webhook_body: Json
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          customer_email?: string | null
          error_message?: string | null
          id?: string
          order_found?: boolean
          order_id_from_webhook?: string | null
          processing_success?: boolean
          processing_time_ms?: number | null
          status_received?: string | null
          strategy_used?: string | null
          transaction_id?: string | null
          updated_at?: string
          webhook_body: Json
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          customer_email?: string | null
          error_message?: string | null
          id?: string
          order_found?: boolean
          order_id_from_webhook?: string | null
          processing_success?: boolean
          processing_time_ms?: number | null
          status_received?: string | null
          strategy_used?: string | null
          transaction_id?: string | null
          updated_at?: string
          webhook_body?: Json
        }
        Relationships: []
      }
      jingles: {
        Row: {
          approved_lyrics: string | null
          audience: string
          audio_storage_path: string | null
          audio_url: string | null
          audio_variant_a_url: string | null
          audio_variant_b_url: string | null
          briefing_json: Json | null
          company_name: string
          created_at: string
          customer_email: string | null
          customer_phone: string | null
          draft_lyrics: string | null
          duration: string
          extra_instructions: string | null
          id: string
          regeneration_count: number | null
          segment: string
          slogan: string | null
          status: string
          style: string
          suno_audio_id: string | null
          suno_task_id: string | null
          tone: string
          updated_at: string
        }
        Insert: {
          approved_lyrics?: string | null
          audience: string
          audio_storage_path?: string | null
          audio_url?: string | null
          audio_variant_a_url?: string | null
          audio_variant_b_url?: string | null
          briefing_json?: Json | null
          company_name: string
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          draft_lyrics?: string | null
          duration: string
          extra_instructions?: string | null
          id?: string
          regeneration_count?: number | null
          segment: string
          slogan?: string | null
          status?: string
          style: string
          suno_audio_id?: string | null
          suno_task_id?: string | null
          tone: string
          updated_at?: string
        }
        Update: {
          approved_lyrics?: string | null
          audience?: string
          audio_storage_path?: string | null
          audio_url?: string | null
          audio_variant_a_url?: string | null
          audio_variant_b_url?: string | null
          briefing_json?: Json | null
          company_name?: string
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          draft_lyrics?: string | null
          duration?: string
          extra_instructions?: string | null
          id?: string
          regeneration_count?: number | null
          segment?: string
          slogan?: string | null
          status?: string
          style?: string
          suno_audio_id?: string | null
          suno_task_id?: string | null
          tone?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          audio_url: string | null
          completed_at: string | null
          created_at: string | null
          error: string | null
          gpt_lyrics: Json | null
          gpt_prompt: string | null
          id: string
          order_id: string
          quiz_id: string
          status: Database["public"]["Enums"]["job_status"]
          suno_audio_url: string | null
          suno_cover_url: string | null
          suno_job_id: string | null
          suno_task_id: string | null
          suno_video_url: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          gpt_lyrics?: Json | null
          gpt_prompt?: string | null
          id?: string
          order_id: string
          quiz_id: string
          status?: Database["public"]["Enums"]["job_status"]
          suno_audio_url?: string | null
          suno_cover_url?: string | null
          suno_job_id?: string | null
          suno_task_id?: string | null
          suno_video_url?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          gpt_lyrics?: Json | null
          gpt_prompt?: string | null
          id?: string
          order_id?: string
          quiz_id?: string
          status?: Database["public"]["Enums"]["job_status"]
          suno_audio_url?: string | null
          suno_cover_url?: string | null
          suno_job_id?: string | null
          suno_task_id?: string | null
          suno_video_url?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "jobs_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "orders_at_risk"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "jobs_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      language_detections: {
        Row: {
          accept_language: string | null
          confidence: number | null
          created_at: string | null
          detected_country: string
          detected_currency: string
          detected_locale: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          accept_language?: string | null
          confidence?: number | null
          created_at?: string | null
          detected_country: string
          detected_currency: string
          detected_locale: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          accept_language?: string | null
          confidence?: number | null
          created_at?: string | null
          detected_country?: string
          detected_currency?: string
          detected_locale?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      lyrics_approvals: {
        Row: {
          approval_token: string
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          expires_at: string
          id: string
          is_highlighted: boolean | null
          job_id: string
          lyrics: Json
          lyrics_generated_id: string | null
          lyrics_preview: string | null
          order_id: string
          quiz_id: string
          regeneration_count: number | null
          regeneration_feedback: string | null
          rejected_at: string | null
          rejection_reason: string | null
          reviewing_at: string | null
          reviewing_by: string | null
          status: string
          updated_at: string | null
          voice: string | null
        }
        Insert: {
          approval_token?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          is_highlighted?: boolean | null
          job_id: string
          lyrics: Json
          lyrics_generated_id?: string | null
          lyrics_preview?: string | null
          order_id: string
          quiz_id: string
          regeneration_count?: number | null
          regeneration_feedback?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          reviewing_at?: string | null
          reviewing_by?: string | null
          status?: string
          updated_at?: string | null
          voice?: string | null
        }
        Update: {
          approval_token?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          is_highlighted?: boolean | null
          job_id?: string
          lyrics?: Json
          lyrics_generated_id?: string | null
          lyrics_preview?: string | null
          order_id?: string
          quiz_id?: string
          regeneration_count?: number | null
          regeneration_feedback?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          reviewing_at?: string | null
          reviewing_by?: string | null
          status?: string
          updated_at?: string | null
          voice?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lyrics_approvals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lyrics_approvals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "lyrics_with_approvals"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "lyrics_approvals_lyrics_generated_id_fkey"
            columns: ["lyrics_generated_id"]
            isOneToOne: false
            referencedRelation: "lyrics_generated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lyrics_approvals_lyrics_generated_id_fkey"
            columns: ["lyrics_generated_id"]
            isOneToOne: false
            referencedRelation: "lyrics_with_approvals"
            referencedColumns: ["lyrics_id"]
          },
          {
            foreignKeyName: "lyrics_approvals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lyrics_approvals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lyrics_approvals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "lyrics_approvals_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "orders_at_risk"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "lyrics_approvals_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      lyrics_generated: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          job_id: string
          language: string | null
          lyrics: string
          order_id: string
          quiz_id: string
          regeneration_count: number | null
          regeneration_feedback: string | null
          rejected_at: string | null
          rejection_reason: string | null
          status: string
          style: string | null
          title: string
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          language?: string | null
          lyrics: string
          order_id: string
          quiz_id: string
          regeneration_count?: number | null
          regeneration_feedback?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          style?: string | null
          title: string
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          language?: string | null
          lyrics?: string
          order_id?: string
          quiz_id?: string
          regeneration_count?: number | null
          regeneration_feedback?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          style?: string | null
          title?: string
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lyrics_generated_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lyrics_generated_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "lyrics_with_approvals"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "lyrics_generated_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lyrics_generated_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lyrics_generated_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "lyrics_generated_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "orders_at_risk"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "lyrics_generated_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_events: {
        Row: {
          created_at: string
          custom_data: Json | null
          event_id: string | null
          event_name: string
          event_time: string
          id: string
          order_id: string | null
          pixel_id: string
          response_body: string | null
          response_code: number | null
          status: string
          user_data: Json | null
        }
        Insert: {
          created_at?: string
          custom_data?: Json | null
          event_id?: string | null
          event_name: string
          event_time?: string
          id?: string
          order_id?: string | null
          pixel_id: string
          response_body?: string | null
          response_code?: number | null
          status?: string
          user_data?: Json | null
        }
        Update: {
          created_at?: string
          custom_data?: Json | null
          event_id?: string | null
          event_name?: string
          event_time?: string
          id?: string
          order_id?: string | null
          pixel_id?: string
          response_body?: string | null
          response_code?: number | null
          status?: string
          user_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      meta_pixels: {
        Row: {
          access_token: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          pixel_id: string
          test_event_code: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          pixel_id: string
          test_event_code?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          pixel_id?: string
          test_event_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      n8n_webhook_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          order_id: string
          sent_at: string
          success: boolean
          webhook_url: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          order_id: string
          sent_at?: string
          success?: boolean
          webhook_url: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          order_id?: string
          sent_at?: string
          success?: boolean
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "n8n_webhook_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "n8n_webhook_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "n8n_webhook_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      order_creation_logs: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_whatsapp: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          ip_address: string | null
          order_data: Json | null
          order_id: string | null
          quiz_data: Json | null
          quiz_id: string | null
          session_id: string | null
          source: string
          status: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_whatsapp?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          order_data?: Json | null
          order_id?: string | null
          quiz_data?: Json | null
          quiz_id?: string | null
          session_id?: string | null
          source: string
          status: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_whatsapp?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          order_data?: Json | null
          order_id?: string | null
          quiz_data?: Json | null
          quiz_id?: string | null
          session_id?: string | null
          source?: string
          status?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_creation_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_creation_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_creation_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_creation_logs_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "orders_at_risk"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "order_creation_logs_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          affiliate_id: string | null
          affiliate_link_id: string | null
          amount_cents: number
          cakto_customer_document: string | null
          cakto_customer_name: string | null
          cakto_event_type: string | null
          cakto_installments: number | null
          cakto_payment_date: string | null
          cakto_payment_method: string | null
          cakto_payment_status: string | null
          cakto_payment_url: string | null
          cakto_product_id: string | null
          cakto_product_name: string | null
          cakto_transaction_id: string | null
          cakto_webhook_id: string | null
          cakto_webhook_metadata: Json | null
          cakto_webhook_received_at: string | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_whatsapp: string | null
          detected_country: string | null
          id: string
          is_test_order: boolean | null
          locale: string | null
          magic_token: string | null
          music_generated: boolean | null
          music_generated_at: string | null
          music_generation_error: string | null
          music_generation_failed_at: string | null
          music_id: string | null
          paid_at: string | null
          payment_id: string | null
          payment_mode: string | null
          payment_provider:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          pending_at: string | null
          plan: Database["public"]["Enums"]["plan_type"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_ref: string | null
          purchase_time: string
          quiz_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          tracking_data: Json | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_id?: string | null
          affiliate_link_id?: string | null
          amount_cents: number
          cakto_customer_document?: string | null
          cakto_customer_name?: string | null
          cakto_event_type?: string | null
          cakto_installments?: number | null
          cakto_payment_date?: string | null
          cakto_payment_method?: string | null
          cakto_payment_status?: string | null
          cakto_payment_url?: string | null
          cakto_product_id?: string | null
          cakto_product_name?: string | null
          cakto_transaction_id?: string | null
          cakto_webhook_id?: string | null
          cakto_webhook_metadata?: Json | null
          cakto_webhook_received_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_whatsapp?: string | null
          detected_country?: string | null
          id?: string
          is_test_order?: boolean | null
          locale?: string | null
          magic_token?: string | null
          music_generated?: boolean | null
          music_generated_at?: string | null
          music_generation_error?: string | null
          music_generation_failed_at?: string | null
          music_id?: string | null
          paid_at?: string | null
          payment_id?: string | null
          payment_mode?: string | null
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          pending_at?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_ref?: string | null
          purchase_time?: string
          quiz_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          tracking_data?: Json | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_id?: string | null
          affiliate_link_id?: string | null
          amount_cents?: number
          cakto_customer_document?: string | null
          cakto_customer_name?: string | null
          cakto_event_type?: string | null
          cakto_installments?: number | null
          cakto_payment_date?: string | null
          cakto_payment_method?: string | null
          cakto_payment_status?: string | null
          cakto_payment_url?: string | null
          cakto_product_id?: string | null
          cakto_product_name?: string | null
          cakto_transaction_id?: string | null
          cakto_webhook_id?: string | null
          cakto_webhook_metadata?: Json | null
          cakto_webhook_received_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_whatsapp?: string | null
          detected_country?: string | null
          id?: string
          is_test_order?: boolean | null
          locale?: string | null
          magic_token?: string | null
          music_generated?: boolean | null
          music_generated_at?: string | null
          music_generation_error?: string | null
          music_generation_failed_at?: string | null
          music_id?: string | null
          paid_at?: string | null
          payment_id?: string | null
          payment_mode?: string | null
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          pending_at?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_ref?: string | null
          purchase_time?: string
          quiz_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          tracking_data?: Json | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_cakto_webhook_id_fkey"
            columns: ["cakto_webhook_id"]
            isOneToOne: false
            referencedRelation: "cakto_webhooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_music_id_fkey"
            columns: ["music_id"]
            isOneToOne: false
            referencedRelation: "generated_music"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "orders_at_risk"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "orders_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_backup_antes_restore: {
        Row: {
          amount_cents: number | null
          cakto_customer_document: string | null
          cakto_customer_name: string | null
          cakto_event_type: string | null
          cakto_installments: number | null
          cakto_payment_date: string | null
          cakto_payment_method: string | null
          cakto_payment_status: string | null
          cakto_payment_url: string | null
          cakto_product_id: string | null
          cakto_product_name: string | null
          cakto_transaction_id: string | null
          cakto_webhook_id: string | null
          cakto_webhook_metadata: Json | null
          cakto_webhook_received_at: string | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_whatsapp: string | null
          detected_country: string | null
          id: string | null
          is_test_order: boolean | null
          locale: string | null
          magic_token: string | null
          music_generated: boolean | null
          music_generated_at: string | null
          music_generation_error: string | null
          music_generation_failed_at: string | null
          music_id: string | null
          paid_at: string | null
          payment_id: string | null
          payment_mode: string | null
          payment_provider:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          pending_at: string | null
          plan: Database["public"]["Enums"]["plan_type"] | null
          provider: Database["public"]["Enums"]["payment_provider"] | null
          provider_ref: string | null
          purchase_time: string | null
          quiz_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          cakto_customer_document?: string | null
          cakto_customer_name?: string | null
          cakto_event_type?: string | null
          cakto_installments?: number | null
          cakto_payment_date?: string | null
          cakto_payment_method?: string | null
          cakto_payment_status?: string | null
          cakto_payment_url?: string | null
          cakto_product_id?: string | null
          cakto_product_name?: string | null
          cakto_transaction_id?: string | null
          cakto_webhook_id?: string | null
          cakto_webhook_metadata?: Json | null
          cakto_webhook_received_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_whatsapp?: string | null
          detected_country?: string | null
          id?: string | null
          is_test_order?: boolean | null
          locale?: string | null
          magic_token?: string | null
          music_generated?: boolean | null
          music_generated_at?: string | null
          music_generation_error?: string | null
          music_generation_failed_at?: string | null
          music_id?: string | null
          paid_at?: string | null
          payment_id?: string | null
          payment_mode?: string | null
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          pending_at?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          provider?: Database["public"]["Enums"]["payment_provider"] | null
          provider_ref?: string | null
          purchase_time?: string | null
          quiz_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          cakto_customer_document?: string | null
          cakto_customer_name?: string | null
          cakto_event_type?: string | null
          cakto_installments?: number | null
          cakto_payment_date?: string | null
          cakto_payment_method?: string | null
          cakto_payment_status?: string | null
          cakto_payment_url?: string | null
          cakto_product_id?: string | null
          cakto_product_name?: string | null
          cakto_transaction_id?: string | null
          cakto_webhook_id?: string | null
          cakto_webhook_metadata?: Json | null
          cakto_webhook_received_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_whatsapp?: string | null
          detected_country?: string | null
          id?: string | null
          is_test_order?: boolean | null
          locale?: string | null
          magic_token?: string | null
          music_generated?: boolean | null
          music_generated_at?: string | null
          music_generation_error?: string | null
          music_generation_failed_at?: string | null
          music_id?: string | null
          paid_at?: string | null
          payment_id?: string | null
          payment_mode?: string | null
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          pending_at?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          provider?: Database["public"]["Enums"]["payment_provider"] | null
          provider_ref?: string | null
          purchase_time?: string | null
          quiz_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      orders_backup_temp: {
        Row: {
          amount_cents: number | null
          cakto_customer_document: string | null
          cakto_customer_name: string | null
          cakto_event_type: string | null
          cakto_installments: number | null
          cakto_payment_date: string | null
          cakto_payment_method: string | null
          cakto_payment_status: string | null
          cakto_payment_url: string | null
          cakto_product_id: string | null
          cakto_product_name: string | null
          cakto_transaction_id: string | null
          cakto_webhook_id: string | null
          cakto_webhook_metadata: Json | null
          cakto_webhook_received_at: string | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_whatsapp: string | null
          detected_country: string | null
          id: string
          is_test_order: boolean | null
          locale: string | null
          magic_token: string | null
          music_generated: boolean | null
          music_generated_at: string | null
          music_generation_error: string | null
          music_generation_failed_at: string | null
          music_id: string | null
          paid_at: string | null
          payment_id: string | null
          payment_mode: string | null
          payment_provider: string | null
          pending_at: string | null
          plan: string | null
          provider: string | null
          provider_ref: string | null
          purchase_time: string | null
          quiz_id: string | null
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          cakto_customer_document?: string | null
          cakto_customer_name?: string | null
          cakto_event_type?: string | null
          cakto_installments?: number | null
          cakto_payment_date?: string | null
          cakto_payment_method?: string | null
          cakto_payment_status?: string | null
          cakto_payment_url?: string | null
          cakto_product_id?: string | null
          cakto_product_name?: string | null
          cakto_transaction_id?: string | null
          cakto_webhook_id?: string | null
          cakto_webhook_metadata?: Json | null
          cakto_webhook_received_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_whatsapp?: string | null
          detected_country?: string | null
          id: string
          is_test_order?: boolean | null
          locale?: string | null
          magic_token?: string | null
          music_generated?: boolean | null
          music_generated_at?: string | null
          music_generation_error?: string | null
          music_generation_failed_at?: string | null
          music_id?: string | null
          paid_at?: string | null
          payment_id?: string | null
          payment_mode?: string | null
          payment_provider?: string | null
          pending_at?: string | null
          plan?: string | null
          provider?: string | null
          provider_ref?: string | null
          purchase_time?: string | null
          quiz_id?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          cakto_customer_document?: string | null
          cakto_customer_name?: string | null
          cakto_event_type?: string | null
          cakto_installments?: number | null
          cakto_payment_date?: string | null
          cakto_payment_method?: string | null
          cakto_payment_status?: string | null
          cakto_payment_url?: string | null
          cakto_product_id?: string | null
          cakto_product_name?: string | null
          cakto_transaction_id?: string | null
          cakto_webhook_id?: string | null
          cakto_webhook_metadata?: Json | null
          cakto_webhook_received_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_whatsapp?: string | null
          detected_country?: string | null
          id?: string
          is_test_order?: boolean | null
          locale?: string | null
          magic_token?: string | null
          music_generated?: boolean | null
          music_generated_at?: string | null
          music_generation_error?: string | null
          music_generation_failed_at?: string | null
          music_id?: string | null
          paid_at?: string | null
          payment_id?: string | null
          payment_mode?: string | null
          payment_provider?: string | null
          pending_at?: string | null
          plan?: string | null
          provider?: string | null
          provider_ref?: string | null
          purchase_time?: string | null
          quiz_id?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      parodies: {
        Row: {
          audio_storage_path: string | null
          audio_url: string | null
          briefing_json: Json
          created_at: string
          customer_email: string
          customer_phone: string | null
          id: string
          original_audio_storage_path: string | null
          original_audio_url: string
          status: string
          suno_audio_id: string | null
          suno_task_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          audio_storage_path?: string | null
          audio_url?: string | null
          briefing_json: Json
          created_at?: string
          customer_email: string
          customer_phone?: string | null
          id?: string
          original_audio_storage_path?: string | null
          original_audio_url: string
          status?: string
          suno_audio_id?: string | null
          suno_task_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          audio_storage_path?: string | null
          audio_url?: string | null
          briefing_json?: Json
          created_at?: string
          customer_email?: string
          customer_phone?: string | null
          id?: string
          original_audio_storage_path?: string | null
          original_audio_url?: string
          status?: string
          suno_audio_id?: string | null
          suno_task_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_email_queue: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          max_retries: number
          order_created_at: string
          order_id: string
          processed_at: string | null
          retry_count: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          max_retries?: number
          order_created_at: string
          order_id: string
          processed_at?: string | null
          retry_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          max_retries?: number
          order_created_at?: string
          order_id?: string
          processed_at?: string | null
          retry_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_email_queue_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_email_queue_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_email_queue_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: number
          occurred_at: string
          payload: Json
          provider: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: number
          occurred_at?: string
          payload: Json
          provider: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: number
          occurred_at?: string
          payload?: Json
          provider?: string
        }
        Relationships: []
      }
      payment_products: {
        Row: {
          cakto_product_id: string | null
          created_at: string | null
          currency: string
          description: string | null
          id: string
          is_active: boolean | null
          locale: string
          name: string
          price_cents: number
          stripe_price_id_live: string | null
          stripe_price_id_test: string | null
          updated_at: string | null
        }
        Insert: {
          cakto_product_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string
          name: string
          price_cents: number
          stripe_price_id_live?: string | null
          stripe_price_id_test?: string | null
          updated_at?: string | null
        }
        Update: {
          cakto_product_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string
          name?: string
          price_cents?: number
          stripe_price_id_live?: string | null
          stripe_price_id_test?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          currency: string
          customer_id: string | null
          event_id: string
          id: number
          last_event_type: string | null
          order_id: string | null
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          currency?: string
          customer_id?: string | null
          event_id: string
          id?: number
          last_event_type?: string | null
          order_id?: string | null
          provider: string
          status: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          currency?: string
          customer_id?: string | null
          event_id?: string
          id?: number
          last_event_type?: string | null
          order_id?: string | null
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string | null
          currency: string
          features: Json | null
          id: string
          is_active: boolean | null
          plan_name: string
          price_cents: number
          region: string
          stripe_price_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          plan_name: string
          price_cents: number
          region: string
          stripe_price_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          plan_name?: string
          price_cents?: number
          region?: string
          stripe_price_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      processed_events: {
        Row: {
          created_at: string | null
          event_id: string
          event_type: string
          id: number
          processed_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          event_type: string
          id?: number
          processed_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          event_type?: string
          id?: number
          processed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email_notifications: boolean | null
          id: string
          preferred_language: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email_notifications?: boolean | null
          id: string
          preferred_language?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email_notifications?: boolean | null
          id?: string
          preferred_language?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_analytics: {
        Row: {
          created_at: string | null
          currency: string | null
          detected_country: string | null
          id: string
          ip_address_hash: string | null
          locked_region: string | null
          order_id: string | null
          price_cents: number | null
          selected_language: string | null
          suspicious_activity: boolean | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          detected_country?: string | null
          id?: string
          ip_address_hash?: string | null
          locked_region?: string | null
          order_id?: string | null
          price_cents?: number | null
          selected_language?: string | null
          suspicious_activity?: boolean | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          detected_country?: string | null
          id?: string
          ip_address_hash?: string | null
          locked_region?: string | null
          order_id?: string | null
          price_cents?: number | null
          selected_language?: string | null
          suspicious_activity?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_analytics_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_analytics_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_analytics_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      quiz_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_date: string
          orders_created: number | null
          orders_with_quiz: number | null
          orders_without_quiz: number | null
          quizzes_lost: number | null
          quizzes_saved: number | null
          quizzes_saved_with_session_id: number | null
          retry_queue_size: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_date: string
          orders_created?: number | null
          orders_with_quiz?: number | null
          orders_without_quiz?: number | null
          quizzes_lost?: number | null
          quizzes_saved?: number | null
          quizzes_saved_with_session_id?: number | null
          retry_queue_size?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_date?: string
          orders_created?: number | null
          orders_with_quiz?: number | null
          orders_without_quiz?: number | null
          quizzes_lost?: number | null
          quizzes_saved?: number | null
          quizzes_saved_with_session_id?: number | null
          retry_queue_size?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_retry_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          last_error: string | null
          max_attempts: number | null
          next_retry_at: string | null
          quiz_payload: Json
          session_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number | null
          next_retry_at?: string | null
          quiz_payload: Json
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number | null
          next_retry_at?: string | null
          quiz_payload?: Json
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          about_who: string
          answers: Json | null
          created_at: string | null
          customer_email: string | null
          customer_whatsapp: string | null
          desired_tone: string | null
          id: string
          key_moments: string | null
          language: string
          memories: string | null
          message: string | null
          music_prompt: string | null
          occasion: string | null
          order_id: string | null
          qualities: string | null
          relationship: string | null
          session_id: string | null
          style: string
          transaction_id: string | null
          updated_at: string
          user_id: string | null
          vocal_gender: string | null
        }
        Insert: {
          about_who: string
          answers?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_whatsapp?: string | null
          desired_tone?: string | null
          id?: string
          key_moments?: string | null
          language: string
          memories?: string | null
          message?: string | null
          music_prompt?: string | null
          occasion?: string | null
          order_id?: string | null
          qualities?: string | null
          relationship?: string | null
          session_id?: string | null
          style: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
          vocal_gender?: string | null
        }
        Update: {
          about_who?: string
          answers?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_whatsapp?: string | null
          desired_tone?: string | null
          id?: string
          key_moments?: string | null
          language?: string
          memories?: string | null
          message?: string | null
          music_prompt?: string | null
          occasion?: string | null
          order_id?: string | null
          qualities?: string | null
          relationship?: string | null
          session_id?: string | null
          style?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
          vocal_gender?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      quizzes_backup_temp: {
        Row: {
          about_who: string | null
          answers: Json | null
          created_at: string | null
          customer_email: string | null
          customer_whatsapp: string | null
          desired_tone: string | null
          id: string
          key_moments: string | null
          language: string | null
          memories: string | null
          message: string | null
          music_prompt: string | null
          occasion: string | null
          order_id: string | null
          qualities: string | null
          relationship: string | null
          style: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
          vocal_gender: string | null
        }
        Insert: {
          about_who?: string | null
          answers?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_whatsapp?: string | null
          desired_tone?: string | null
          id: string
          key_moments?: string | null
          language?: string | null
          memories?: string | null
          message?: string | null
          music_prompt?: string | null
          occasion?: string | null
          order_id?: string | null
          qualities?: string | null
          relationship?: string | null
          style?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vocal_gender?: string | null
        }
        Update: {
          about_who?: string | null
          answers?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_whatsapp?: string | null
          desired_tone?: string | null
          id?: string
          key_moments?: string | null
          language?: string | null
          memories?: string | null
          message?: string | null
          music_prompt?: string | null
          occasion?: string | null
          order_id?: string | null
          qualities?: string | null
          relationship?: string | null
          style?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vocal_gender?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          count: number | null
          created_at: string | null
          id: string
          identifier: string
          window_start: string | null
        }
        Insert: {
          action: string
          count?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          window_start?: string | null
        }
        Update: {
          action?: string
          count?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      received_emails: {
        Row: {
          attachments: Json | null
          created_at: string | null
          from_email: string
          from_name: string | null
          headers: Json | null
          html_content: string | null
          id: string
          in_reply_to: string | null
          is_archived: boolean | null
          is_read: boolean | null
          replied_at: string | null
          replied_by: string | null
          resend_email_id: string | null
          subject: string | null
          text_content: string | null
          thread_id: string | null
          to_email: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          from_email: string
          from_name?: string | null
          headers?: Json | null
          html_content?: string | null
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          replied_at?: string | null
          replied_by?: string | null
          resend_email_id?: string | null
          subject?: string | null
          text_content?: string | null
          thread_id?: string | null
          to_email: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          from_email?: string
          from_name?: string | null
          headers?: Json | null
          html_content?: string | null
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          replied_at?: string | null
          replied_by?: string | null
          resend_email_id?: string | null
          subject?: string | null
          text_content?: string | null
          thread_id?: string | null
          to_email?: string
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          content: Json
          id: string
          is_active: boolean | null
          section_key: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content: Json
          id?: string
          is_active?: boolean | null
          section_key: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          is_active?: boolean | null
          section_key?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      song_assets: {
        Row: {
          asset_type: string
          bucket_name: string
          bucket_path: string
          created_at: string | null
          duration: number | null
          file_size: number | null
          generation_id: string
          id: string
          job_id: string | null
          mime_type: string | null
          order_id: string | null
          original_url: string | null
          task_id: string | null
          title: string | null
          track_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          asset_type: string
          bucket_name: string
          bucket_path: string
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          generation_id: string
          id?: string
          job_id?: string | null
          mime_type?: string | null
          order_id?: string | null
          original_url?: string | null
          task_id?: string | null
          title?: string | null
          track_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          asset_type?: string
          bucket_name?: string
          bucket_path?: string
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          generation_id?: string
          id?: string
          job_id?: string | null
          mime_type?: string | null
          order_id?: string | null
          original_url?: string | null
          task_id?: string | null
          title?: string | null
          track_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_song_assets_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_song_assets_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "lyrics_with_approvals"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "fk_song_assets_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_song_assets_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_song_assets_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      songs: {
        Row: {
          audio_url: string | null
          automaeia_recebimentos_notified_at: string | null
          cover_url: string | null
          created_at: string | null
          duration: number | null
          duration_sec: number | null
          emotion: string | null
          id: string
          image_url: string | null
          instrumental_url: string | null
          job_id: string | null
          language: string
          lyrics: string | null
          order_id: string
          quiz_id: string
          release_at: string
          released_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["song_status"]
          stems_separated_at: string | null
          style: string | null
          suno_clip_id: string | null
          suno_id: string | null
          suno_task_id: string | null
          title: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
          variant_number: number | null
          vocals_url: string | null
        }
        Insert: {
          audio_url?: string | null
          automaeia_recebimentos_notified_at?: string | null
          cover_url?: string | null
          created_at?: string | null
          duration?: number | null
          duration_sec?: number | null
          emotion?: string | null
          id?: string
          image_url?: string | null
          instrumental_url?: string | null
          job_id?: string | null
          language: string
          lyrics?: string | null
          order_id: string
          quiz_id: string
          release_at: string
          released_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["song_status"]
          stems_separated_at?: string | null
          style?: string | null
          suno_clip_id?: string | null
          suno_id?: string | null
          suno_task_id?: string | null
          title: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_number?: number | null
          vocals_url?: string | null
        }
        Update: {
          audio_url?: string | null
          automaeia_recebimentos_notified_at?: string | null
          cover_url?: string | null
          created_at?: string | null
          duration?: number | null
          duration_sec?: number | null
          emotion?: string | null
          id?: string
          image_url?: string | null
          instrumental_url?: string | null
          job_id?: string | null
          language?: string
          lyrics?: string | null
          order_id?: string
          quiz_id?: string
          release_at?: string
          released_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["song_status"]
          stems_separated_at?: string | null
          style?: string | null
          suno_clip_id?: string | null
          suno_id?: string | null
          suno_task_id?: string | null
          title?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_number?: number | null
          vocals_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "lyrics_with_approvals"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "songs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "songs_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "orders_at_risk"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "songs_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      stem_separations: {
        Row: {
          audio_id: string
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          generation_task_id: string | null
          id: string
          instrumental_mime_type: string | null
          instrumental_size_bytes: number | null
          instrumental_url: string | null
          origin_url: string | null
          separation_task_id: string | null
          song_id: string | null
          status: Database["public"]["Enums"]["stem_separation_status"]
          type: string
          updated_at: string | null
          vocal_mime_type: string | null
          vocal_size_bytes: number | null
          vocal_url: string | null
        }
        Insert: {
          audio_id: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          generation_task_id?: string | null
          id?: string
          instrumental_mime_type?: string | null
          instrumental_size_bytes?: number | null
          instrumental_url?: string | null
          origin_url?: string | null
          separation_task_id?: string | null
          song_id?: string | null
          status?: Database["public"]["Enums"]["stem_separation_status"]
          type?: string
          updated_at?: string | null
          vocal_mime_type?: string | null
          vocal_size_bytes?: number | null
          vocal_url?: string | null
        }
        Update: {
          audio_id?: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          generation_task_id?: string | null
          id?: string
          instrumental_mime_type?: string | null
          instrumental_size_bytes?: number | null
          instrumental_url?: string | null
          origin_url?: string | null
          separation_task_id?: string | null
          song_id?: string | null
          status?: Database["public"]["Enums"]["stem_separation_status"]
          type?: string
          updated_at?: string | null
          vocal_mime_type?: string | null
          vocal_size_bytes?: number | null
          vocal_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stem_separations_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stem_separations_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["song_id"]
          },
        ]
      }
      stems: {
        Row: {
          created_at: string
          files_json: Json | null
          id: string
          mode: string
          source_jingle_id: string | null
          source_parody_id: string | null
          status: string
          suno_task_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          files_json?: Json | null
          id?: string
          mode: string
          source_jingle_id?: string | null
          source_parody_id?: string | null
          status?: string
          suno_task_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          files_json?: Json | null
          id?: string
          mode?: string
          source_jingle_id?: string | null
          source_parody_id?: string | null
          status?: string
          suno_task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stems_source_jingle_id_fkey"
            columns: ["source_jingle_id"]
            isOneToOne: false
            referencedRelation: "jingles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stems_source_parody_id_fkey"
            columns: ["source_parody_id"]
            isOneToOne: false
            referencedRelation: "parodies"
            referencedColumns: ["id"]
          },
        ]
      }
      suno_credits: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string | null
          remaining_credits: number
          total_credits: number
          updated_at: string | null
          used_credits: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          remaining_credits?: number
          total_credits?: number
          updated_at?: string | null
          used_credits?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          remaining_credits?: number
          total_credits?: number
          updated_at?: string | null
          used_credits?: number
        }
        Relationships: []
      }
      suno_credits_history: {
        Row: {
          created_at: string | null
          credits_used: number
          description: string | null
          id: string
          job_id: string | null
          order_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits_used: number
          description?: string | null
          id?: string
          job_id?: string | null
          order_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          description?: string | null
          id?: string
          job_id?: string | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suno_credits_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suno_credits_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "lyrics_with_approvals"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "suno_credits_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suno_credits_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suno_credits_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      suno_events: {
        Row: {
          created_at: string | null
          generation_id: string
          id: number
          payload: Json | null
          processed_at: string | null
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          generation_id: string
          id?: number
          payload?: Json | null
          processed_at?: string | null
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          generation_id?: string
          id?: number
          payload?: Json | null
          processed_at?: string | null
          task_id?: string | null
        }
        Relationships: []
      }
      suno_tasks: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          jingle_id: string | null
          parody_id: string | null
          raw_response: Json | null
          status: string
          stem_id: string | null
          suno_audio_id: string | null
          suno_task_id: string
          task_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          jingle_id?: string | null
          parody_id?: string | null
          raw_response?: Json | null
          status?: string
          stem_id?: string | null
          suno_audio_id?: string | null
          suno_task_id: string
          task_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          jingle_id?: string | null
          parody_id?: string | null
          raw_response?: Json | null
          status?: string
          stem_id?: string | null
          suno_audio_id?: string | null
          suno_task_id?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_suno_tasks_parody"
            columns: ["parody_id"]
            isOneToOne: false
            referencedRelation: "parodies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_suno_tasks_stem"
            columns: ["stem_id"]
            isOneToOne: false
            referencedRelation: "stems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suno_tasks_jingle_id_fkey"
            columns: ["jingle_id"]
            isOneToOne: false
            referencedRelation: "jingles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string | null
          description: string | null
          event: string
          id: number
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event: string
          id?: number
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event?: string
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          content: string
          content_en: string | null
          content_es: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          locale: string | null
          name: string
          name_en: string | null
          name_es: string | null
          rating: number | null
          role: string | null
          role_en: string | null
          role_es: string | null
        }
        Insert: {
          avatar_url?: string | null
          content: string
          content_en?: string | null
          content_es?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          locale?: string | null
          name: string
          name_en?: string | null
          name_es?: string | null
          rating?: number | null
          role?: string | null
          role_en?: string | null
          role_es?: string | null
        }
        Update: {
          avatar_url?: string | null
          content?: string
          content_en?: string | null
          content_es?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          locale?: string | null
          name?: string
          name_en?: string | null
          name_es?: string | null
          rating?: number | null
          role?: string | null
          role_en?: string | null
          role_es?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          detected_country: string
          detected_region: string
          expires_at: string | null
          id: string
          ip_address_hash: string | null
          locked_at: string | null
          session_token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          detected_country: string
          detected_region: string
          expires_at?: string | null
          id?: string
          ip_address_hash?: string | null
          locked_at?: string | null
          session_token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          detected_country?: string
          detected_region?: string
          expires_at?: string | null
          id?: string
          ip_address_hash?: string | null
          locked_at?: string | null
          session_token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_cakto_log: {
        Row: {
          body: Json | null
          error_message: string | null
          headers: Json | null
          id: number
          order_id: string | null
          processed: boolean | null
          received_at: string | null
        }
        Insert: {
          body?: Json | null
          error_message?: string | null
          headers?: Json | null
          id?: number
          order_id?: string | null
          processed?: boolean | null
          received_at?: string | null
        }
        Update: {
          body?: Json | null
          error_message?: string | null
          headers?: Json | null
          id?: number
          order_id?: string | null
          processed?: boolean | null
          received_at?: string | null
        }
        Relationships: []
      }
      whatsapp_funnel: {
        Row: {
          ab_variant: string | null
          created_at: string | null
          current_step: number
          customer_email: string
          customer_whatsapp: string
          exit_reason: string | null
          funnel_status: string
          id: string
          last_message_sent_at: string | null
          next_message_at: string | null
          order_id: string
          updated_at: string | null
        }
        Insert: {
          ab_variant?: string | null
          created_at?: string | null
          current_step?: number
          customer_email: string
          customer_whatsapp: string
          exit_reason?: string | null
          funnel_status?: string
          id?: string
          last_message_sent_at?: string | null
          next_message_at?: string | null
          order_id: string
          updated_at?: string | null
        }
        Update: {
          ab_variant?: string | null
          created_at?: string | null
          current_step?: number
          customer_email?: string
          customer_whatsapp?: string
          exit_reason?: string | null
          funnel_status?: string
          id?: string
          last_message_sent_at?: string | null
          next_message_at?: string | null
          order_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_funnel_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_funnel_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_funnel_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      whatsapp_funnel_completed: {
        Row: {
          ab_variant: string | null
          completed_at: string | null
          created_at: string | null
          current_step: number
          customer_email: string
          customer_whatsapp: string
          exit_reason: string | null
          id: string
          is_paused: boolean
          last_message_sent_at: string | null
          next_message_at: string | null
          order_amount_cents: number | null
          order_created_at: string | null
          order_id: string
          order_plan: string | null
          order_status: string
          quiz_about_who: string | null
          quiz_id: string | null
          updated_at: string | null
        }
        Insert: {
          ab_variant?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: number
          customer_email: string
          customer_whatsapp: string
          exit_reason?: string | null
          id?: string
          is_paused?: boolean
          last_message_sent_at?: string | null
          next_message_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id: string
          order_plan?: string | null
          order_status?: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ab_variant?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: number
          customer_email?: string
          customer_whatsapp?: string
          exit_reason?: string | null
          id?: string
          is_paused?: boolean
          last_message_sent_at?: string | null
          next_message_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id?: string
          order_plan?: string | null
          order_status?: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_funnel_completed_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_funnel_completed_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_funnel_completed_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      whatsapp_funnel_exited: {
        Row: {
          ab_variant: string | null
          created_at: string | null
          current_step: number
          customer_email: string
          customer_whatsapp: string
          exit_reason: string
          exited_at: string | null
          id: string
          is_paused: boolean
          last_message_sent_at: string | null
          next_message_at: string | null
          order_amount_cents: number | null
          order_created_at: string | null
          order_id: string
          order_plan: string | null
          order_status: string
          quiz_about_who: string | null
          quiz_id: string | null
          updated_at: string | null
        }
        Insert: {
          ab_variant?: string | null
          created_at?: string | null
          current_step?: number
          customer_email: string
          customer_whatsapp: string
          exit_reason: string
          exited_at?: string | null
          id?: string
          is_paused?: boolean
          last_message_sent_at?: string | null
          next_message_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id: string
          order_plan?: string | null
          order_status: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ab_variant?: string | null
          created_at?: string | null
          current_step?: number
          customer_email?: string
          customer_whatsapp?: string
          exit_reason?: string
          exited_at?: string | null
          id?: string
          is_paused?: boolean
          last_message_sent_at?: string | null
          next_message_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id?: string
          order_plan?: string | null
          order_status?: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_funnel_exited_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_funnel_exited_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_funnel_exited_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      whatsapp_funnel_pending: {
        Row: {
          ab_variant: string | null
          created_at: string | null
          current_step: number
          customer_email: string
          customer_whatsapp: string
          exit_reason: string | null
          id: string
          is_paused: boolean
          last_message_sent_at: string | null
          next_message_at: string | null
          order_amount_cents: number | null
          order_created_at: string | null
          order_id: string
          order_plan: string | null
          order_status: string
          quiz_about_who: string | null
          quiz_id: string | null
          updated_at: string | null
        }
        Insert: {
          ab_variant?: string | null
          created_at?: string | null
          current_step?: number
          customer_email: string
          customer_whatsapp: string
          exit_reason?: string | null
          id?: string
          is_paused?: boolean
          last_message_sent_at?: string | null
          next_message_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id: string
          order_plan?: string | null
          order_status?: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ab_variant?: string | null
          created_at?: string | null
          current_step?: number
          customer_email?: string
          customer_whatsapp?: string
          exit_reason?: string | null
          id?: string
          is_paused?: boolean
          last_message_sent_at?: string | null
          next_message_at?: string | null
          order_amount_cents?: number | null
          order_created_at?: string | null
          order_id?: string
          order_plan?: string | null
          order_status?: string
          quiz_about_who?: string | null
          quiz_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_funnel_pending_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_funnel_pending_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_funnel_pending_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      whatsapp_interactions: {
        Row: {
          button_id: string | null
          button_text: string | null
          created_at: string | null
          delivery_status: string | null
          event_data: Json | null
          funnel_id: string | null
          id: string
          interaction_type: string
          message_id: string | null
          message_text: string | null
          order_id: string | null
          updated_at: string | null
          whatsapp_number: string
        }
        Insert: {
          button_id?: string | null
          button_text?: string | null
          created_at?: string | null
          delivery_status?: string | null
          event_data?: Json | null
          funnel_id?: string | null
          id?: string
          interaction_type: string
          message_id?: string | null
          message_text?: string | null
          order_id?: string | null
          updated_at?: string | null
          whatsapp_number: string
        }
        Update: {
          button_id?: string | null
          button_text?: string | null
          created_at?: string | null
          delivery_status?: string | null
          event_data?: Json | null
          funnel_id?: string | null
          id?: string
          interaction_type?: string
          message_id?: string | null
          message_text?: string | null
          order_id?: string | null
          updated_at?: string | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_interactions_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_funnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_interactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_interactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_interactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_with_songs"
            referencedColumns: ["order_id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          created_at: string | null
          error_message: string | null
          funnel_id: string
          id: string
          message_text: string | null
          message_type: string
          response_data: Json | null
          sent_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          funnel_id: string
          id?: string
          message_text?: string | null
          message_type: string
          response_data?: Json | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          funnel_id?: string
          id?: string
          message_text?: string | null
          message_type?: string
          response_data?: Json | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_funnel"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates_i18n: {
        Row: {
          button_configs: Json | null
          created_at: string | null
          id: string
          language: string
          message_text: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          button_configs?: Json | null
          created_at?: string | null
          id?: string
          language: string
          message_text: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          button_configs?: Json | null
          created_at?: string | null
          id?: string
          language?: string
          message_text?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      lyrics_with_approvals: {
        Row: {
          about_who: string | null
          approval_id: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          customer_email: string | null
          desired_tone: string | null
          job_id: string | null
          job_status: Database["public"]["Enums"]["job_status"] | null
          language: string | null
          lyrics: string | null
          lyrics_created_at: string | null
          lyrics_id: string | null
          lyrics_preview: string | null
          lyrics_status: string | null
          rejected_at: string | null
          style: string | null
          suno_task_id: string | null
          title: string | null
          tone: string | null
        }
        Relationships: []
      }
      orders_at_risk: {
        Row: {
          customer_email: string | null
          customer_whatsapp: string | null
          error_message: string | null
          log_created_at: string | null
          log_id: string | null
          log_status: string | null
          quiz_created_at: string | null
          quiz_id: string | null
          session_id: string | null
        }
        Relationships: []
      }
      payment_reports: {
        Row: {
          amount_cents: number | null
          amount_cents_usd: number | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          formatted_price: string | null
          id: string | null
          plan: Database["public"]["Enums"]["plan_type"] | null
          provider: Database["public"]["Enums"]["payment_provider"] | null
          status: Database["public"]["Enums"]["order_status"] | null
        }
        Insert: {
          amount_cents?: number | null
          amount_cents_usd?: never
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          formatted_price?: never
          id?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          provider?: Database["public"]["Enums"]["payment_provider"] | null
          status?: Database["public"]["Enums"]["order_status"] | null
        }
        Update: {
          amount_cents?: number | null
          amount_cents_usd?: never
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          formatted_price?: never
          id?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          provider?: Database["public"]["Enums"]["payment_provider"] | null
          status?: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: []
      }
      v_orders_with_songs: {
        Row: {
          order_id: string | null
          order_status: Database["public"]["Enums"]["order_status"] | null
          release_at: string | null
          song_id: string | null
          song_status: Database["public"]["Enums"]["song_status"] | null
          title: string | null
        }
        Relationships: []
      }
      whatsapp_funnel_unified: {
        Row: {
          ab_variant: string | null
          created_at: string | null
          current_step: number | null
          customer_email: string | null
          customer_whatsapp: string | null
          exit_reason: string | null
          id: string | null
          is_paused: boolean | null
          last_message_sent_at: string | null
          next_message_at: string | null
          order_amount_cents: number | null
          order_created_at: string | null
          order_id: string | null
          order_plan: string | null
          order_status: string | null
          quiz_about_who: string | null
          quiz_id: string | null
          source_table: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_email_unsubscribe: {
        Args: {
          p_email: string
          p_metadata?: Json
          p_reason?: string
          p_source?: string
          p_token: string
        }
        Returns: string
      }
      audit_pending_orders_funnel: {
        Args: never
        Returns: {
          details: Json
          metric_name: string
          metric_value: string
          section: string
        }[]
      }
      auto_migrate_all_pending_orders: {
        Args: never
        Returns: {
          failed_orders: Json
          funnels_created: number
          orders_processed: string[]
        }[]
      }
      call_process_email_queue: { Args: never; Returns: undefined }
      call_process_quiz_retry_queue: { Args: never; Returns: undefined }
      check_and_log_payment_email_needed: {
        Args: { p_order_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          _action: string
          _identifier: string
          _max_count: number
          _window_minutes: number
        }
        Returns: boolean
      }
      cleanup_old_checkout_events: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      count_lyrics_approvals_by_status: {
        Args: { p_include_expired?: boolean; p_status: string }
        Returns: number
      }
      create_funnel_for_order: { Args: { p_order_id: string }; Returns: string }
      create_order_atomic: {
        Args: {
          p_amount_cents: number
          p_customer_email: string
          p_customer_whatsapp: string
          p_ip_address?: string
          p_plan: string
          p_provider: string
          p_quiz_data: Json
          p_session_id: string
          p_source?: string
          p_transaction_id?: string
          p_user_agent?: string
        }
        Returns: Json
      }
      create_whatsapp_funnels_for_pending_orders: {
        Args: never
        Returns: {
          funnels_created: number
          orders_processed: string[]
        }[]
      }
      date_brasilia: { Args: never; Returns: string }
      deduct_suno_credits: {
        Args: {
          credits_to_deduct: number
          p_description?: string
          p_job_id?: string
          p_order_id?: string
        }
        Returns: Json
      }
      diagnose_pending_orders_without_funnel: {
        Args: never
        Returns: {
          can_create_funnel: boolean
          created_at: string
          customer_email: string
          customer_whatsapp: string
          order_id: string
          pending_at: string
          quiz_id: string
          reason: string
          status: string
        }[]
      }
      ensure_checkout_links_for_order: {
        Args: { p_order_id: string }
        Returns: {
          cakto_url: string
          checkout_link_id: string
          checkout_token: string
          checkout_url: string
          edit_quiz_url: string
        }[]
      }
      fix_jobs_without_audio_url: { Args: never; Returns: number }
      fix_songs_without_audio_url: { Args: never; Returns: number }
      formatar_data_brasilia: {
        Args: { timestamp_with_timezone: string }
        Returns: string
      }
      gerar_urls_cakto_em_lote: {
        Args: never
        Returns: {
          cakto_url: string
          customer_email: string
          erro: string
          order_id: string
          status_resultado: string
        }[]
      }
      gerar_urls_cakto_pendentes: {
        Args: never
        Returns: {
          cakto_url: string
          order_id: string
          status_resultado: string
        }[]
      }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_email_template: {
        Args: { p_language?: string; p_template_type: string }
        Returns: {
          html_content: string
          subject: string
          template_id: string
          variables: Json
        }[]
      }
      get_music_released_variables: {
        Args: { p_song_id: string }
        Returns: Json
      }
      get_order_paid_variables: { Args: { p_order_id: string }; Returns: Json }
      get_quiz_by_id: {
        Args: { quiz_id_param: string }
        Returns: {
          about_who: string
          answers: Json
          created_at: string
          customer_email: string
          customer_whatsapp: string
          desired_tone: string
          id: string
          key_moments: Json
          language: string
          memories: string
          message: string
          occasion: string
          qualities: string
          relationship: string
          style: string
          updated_at: string
          vocal_gender: string
        }[]
      }
      get_quiz_metrics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          metric_date: string
          orders_created: number
          orders_with_quiz: number
          orders_without_quiz: number
          quizzes_lost: number
          quizzes_saved: number
          quizzes_saved_with_session_id: number
          retry_queue_size: number
          session_id_adoption_rate: number
          success_rate: number
        }[]
      }
      get_service_role_key: { Args: never; Returns: string }
      get_service_role_key_for_cron: { Args: never; Returns: string }
      get_utm_analytics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          first_order: string
          last_order: string
          paid_orders: number
          revenue_cents: number
          total_orders: number
          utm_campaign: string
          utm_content: string
          utm_medium: string
          utm_source: string
          utm_term: string
        }[]
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_collaborator: { Args: never; Returns: boolean }
      is_email_unsubscribed: { Args: { p_email: string }; Returns: boolean }
      is_user_admin: { Args: { user_id?: string }; Returns: boolean }
      log_email_send: {
        Args: {
          p_error_message?: string
          p_language: string
          p_order_id?: string
          p_recipient_email: string
          p_resend_id?: string
          p_song_id?: string
          p_status: string
          p_subject: string
          p_template_type: string
          p_variables?: Json
        }
        Returns: string
      }
      marcar_pedidos_csv_total_auditoria: {
        Args: never
        Returns: {
          erros: number
          ja_pagos: number
          marcados: number
          nao_encontrados: number
        }[]
      }
      mark_email_funnel_and_order_as_paid: {
        Args: { p_order_id: string }
        Returns: string
      }
      mark_funnel_and_order_as_paid: {
        Args: { p_order_id: string }
        Returns: string
      }
      mark_order_as_paid_manual: {
        Args: {
          p_admin_user_id?: string
          p_evidence?: Json
          p_order_id: string
          p_reason: string
        }
        Returns: boolean
      }
      md5_hash: { Args: { text_value: string }; Returns: string }
      migrate_all_pending_orders_to_funnel: {
        Args: never
        Returns: {
          failed_orders: Json
          funnels_created: number
          orders_processed: string[]
        }[]
      }
      move_funnel_to_completed: {
        Args: { p_funnel_id: string }
        Returns: string
      }
      move_funnel_to_exited: {
        Args: { p_exit_reason: string; p_funnel_id: string }
        Returns: string
      }
      move_funnel_to_pending: { Args: { p_funnel_id: string }; Returns: string }
      normalize_lyrics: { Args: { lyrics_value: Json }; Returns: string }
      now_brasilia: { Args: never; Returns: string }
      now_brasilia_tz: { Args: never; Returns: string }
      ops_stuck_audio_retry_candidates: {
        Args: { p_days?: number; p_include_today?: boolean }
        Returns: {
          job_id: string
          lyrics_approval_id: string
          lyrics_approved_at: string
          order_id: string
        }[]
      }
      process_payment_email_queue: { Args: never; Returns: number }
      process_pending_jobs_without_approval: {
        Args: never
        Returns: {
          job_id: string
          message: string
          order_id: string
          processed: boolean
        }[]
      }
      process_quiz_retry_queue_direct: { Args: never; Returns: undefined }
      recover_failed_orders: {
        Args: never
        Returns: {
          recovered_count: number
          recovered_order_ids: string[]
        }[]
      }
      recover_payment_emails: { Args: never; Returns: number }
      reprocess_order: { Args: { p_order_id: string }; Returns: string }
      send_music_released_email: {
        Args: { p_language?: string; p_song_id: string }
        Returns: Json
      }
      send_order_paid_email: {
        Args: { p_language?: string; p_order_id: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      sync_funnel_order_data: {
        Args: { p_order_id: string; p_quiz_id?: string }
        Returns: {
          order_amount_cents: number
          order_created_at: string
          order_plan: string
          order_status: string
          quiz_about_who: string
          quiz_id: string
        }[]
      }
      sync_funnel_order_data_by_id: {
        Args: { p_funnel_id: string }
        Returns: boolean
      }
      test_email_variables: {
        Args: { p_order_id?: string; p_song_id?: string }
        Returns: Json
      }
      to_brasilia: { Args: { ts: string }; Returns: string }
      toggle_funnel_pause: {
        Args: { p_funnel_id: string; p_table_name?: string }
        Returns: boolean
      }
      update_email_templates: { Args: never; Returns: string }
      update_quiz_metrics: { Args: never; Returns: undefined }
      user_has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      verify_affiliate_password: {
        Args: { p_email: string; p_password_hash: string }
        Returns: {
          commission_percentage: number
          email: string
          id: string
          is_active: boolean
          name: string
        }[]
      }
      verify_templates: {
        Args: never
        Returns: {
          language: string
          subject: string
          template_type: string
          total_count: number
        }[]
      }
    }
    Enums: {
      affiliate_commission_status: "pending" | "approved" | "paid" | "cancelled"
      affiliate_withdrawal_status:
        | "pending"
        | "processing"
        | "completed"
        | "cancelled"
      app_role: "admin" | "user" | "collaborator"
      audio_generation_status: "pending" | "processing" | "completed" | "failed"
      job_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "generating_audio"
        | "audio_processing"
        | "retry_pending"
      lyrics_status: "pending" | "approved" | "rejected" | "failed"
      order_status: "pending" | "paid" | "failed" | "refunded"
      payment_provider: "stripe" | "cakto" | "hotmart"
      plan_type: "standard" | "express"
      role_t: "user" | "admin"
      song_status: "pending" | "ready" | "released" | "approved" | "scheduled"
      stem_separation_status: "pending" | "processing" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      affiliate_commission_status: ["pending", "approved", "paid", "cancelled"],
      affiliate_withdrawal_status: [
        "pending",
        "processing",
        "completed",
        "cancelled",
      ],
      app_role: ["admin", "user", "collaborator"],
      audio_generation_status: ["pending", "processing", "completed", "failed"],
      job_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "generating_audio",
        "audio_processing",
        "retry_pending",
      ],
      lyrics_status: ["pending", "approved", "rejected", "failed"],
      order_status: ["pending", "paid", "failed", "refunded"],
      payment_provider: ["stripe", "cakto", "hotmart"],
      plan_type: ["standard", "express"],
      role_t: ["user", "admin"],
      song_status: ["pending", "ready", "released", "approved", "scheduled"],
      stem_separation_status: ["pending", "processing", "completed", "failed"],
    },
  },
} as const

// Aliases comuns (helpers Tables/Insert/Update já vêm do gerador acima)
export type Quiz = Tables<'quizzes'>;
export type Order = Tables<'orders'>;
export type Song = Tables<'songs'>;
export type LyricsApproval = Tables<'lyrics_approvals'>;
export type AdminAutoJob = Tables<'admin_auto_jobs'>;
export type EmailLog = Tables<'email_logs'>;
export type EmailTemplate = Tables<'email_templates'>;
export type Testimonial = Tables<'testimonials'>;
export type FAQ = Tables<'faqs'>;
export type Affiliate = Tables<'affiliates'>;
