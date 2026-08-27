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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          owner_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          owner_id?: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          owner_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      clients: {
        Row: {
          city_region: string | null
          company: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          instagram: string | null
          name: string
          notes: string | null
          owner_id: string
          segment: string | null
          site_url: string | null
          source_lead_id: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          city_region?: string | null
          company?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          name: string
          notes?: string | null
          owner_id?: string
          segment?: string | null
          site_url?: string | null
          source_lead_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          city_region?: string | null
          company?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          segment?: string | null
          site_url?: string | null
          source_lead_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_source_lead_id_fkey"
            columns: ["source_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_batches: {
        Row: {
          created_at: string
          created_by: string
          duplicate_count: number
          error_count: number
          id: string
          imported_lead_count: number
          metadata: Json
          name: string | null
          original_lead_count: number
          schema_name: string | null
          schema_version: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string
          duplicate_count?: number
          error_count?: number
          id?: string
          imported_lead_count?: number
          metadata?: Json
          name?: string | null
          original_lead_count?: number
          schema_name?: string | null
          schema_version?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          duplicate_count?: number
          error_count?: number
          id?: string
          imported_lead_count?: number
          metadata?: Json
          name?: string | null
          original_lead_count?: number
          schema_name?: string | null
          schema_version?: string | null
          source?: string | null
        }
        Relationships: []
      }
      lead_history: {
        Row: {
          created_at: string
          event_type: string
          id: string
          lead_id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          lead_id: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          approached_at: string | null
          batch_id: string | null
          business_name: string | null
          city: string | null
          closed_at: string | null
          contact_url: string | null
          country: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          external_id: string | null
          extra: Json
          followup_at: string | null
          followup_message: string | null
          id: string
          instagram: string | null
          instagram_status: string | null
          maps_search_url: string | null
          message: string
          name: string
          normalized_phone: string | null
          notes: string | null
          opportunity: string | null
          pain: string | null
          phone: string | null
          priority: string
          proposal_at: string | null
          rating: number | null
          responded_at: string | null
          review_count: number | null
          score: number | null
          segment: string | null
          source: string | null
          state: string | null
          status: string
          updated_at: string
          validation_required: boolean
          website: string | null
          website_status: string | null
          whatsapp_url: string | null
        }
        Insert: {
          address?: string | null
          approached_at?: string | null
          batch_id?: string | null
          business_name?: string | null
          city?: string | null
          closed_at?: string | null
          contact_url?: string | null
          country?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          external_id?: string | null
          extra?: Json
          followup_at?: string | null
          followup_message?: string | null
          id?: string
          instagram?: string | null
          instagram_status?: string | null
          maps_search_url?: string | null
          message?: string
          name: string
          normalized_phone?: string | null
          notes?: string | null
          opportunity?: string | null
          pain?: string | null
          phone?: string | null
          priority?: string
          proposal_at?: string | null
          rating?: number | null
          responded_at?: string | null
          review_count?: number | null
          score?: number | null
          segment?: string | null
          source?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          validation_required?: boolean
          website?: string | null
          website_status?: string | null
          whatsapp_url?: string | null
        }
        Update: {
          address?: string | null
          approached_at?: string | null
          batch_id?: string | null
          business_name?: string | null
          city?: string | null
          closed_at?: string | null
          contact_url?: string | null
          country?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          external_id?: string | null
          extra?: Json
          followup_at?: string | null
          followup_message?: string | null
          id?: string
          instagram?: string | null
          instagram_status?: string | null
          maps_search_url?: string | null
          message?: string
          name?: string
          normalized_phone?: string | null
          notes?: string | null
          opportunity?: string | null
          pain?: string | null
          phone?: string | null
          priority?: string
          proposal_at?: string | null
          rating?: number | null
          responded_at?: string | null
          review_count?: number | null
          score?: number | null
          segment?: string | null
          source?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          validation_required?: boolean
          website?: string | null
          website_status?: string | null
          whatsapp_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "lead_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      site_methodologies: {
        Row: {
          created_at: string
          definition: Json
          description: string | null
          is_active: boolean
          name: string
          version: string
        }
        Insert: {
          created_at?: string
          definition?: Json
          description?: string | null
          is_active?: boolean
          name: string
          version: string
        }
        Update: {
          created_at?: string
          definition?: Json
          description?: string | null
          is_active?: boolean
          name?: string
          version?: string
        }
        Relationships: []
      }
      site_methodology_stage_items: {
        Row: {
          definition: Json
          group_key: string | null
          item_key: string
          item_type: string
          label: string
          methodology_version: string
          required: boolean
          sort_order: number
          stage_key: string
          weight: number
        }
        Insert: {
          definition?: Json
          group_key?: string | null
          item_key: string
          item_type?: string
          label: string
          methodology_version: string
          required?: boolean
          sort_order?: number
          stage_key: string
          weight?: number
        }
        Update: {
          definition?: Json
          group_key?: string | null
          item_key?: string
          item_type?: string
          label?: string
          methodology_version?: string
          required?: boolean
          sort_order?: number
          stage_key?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "site_methodology_stage_items_methodology_version_stage_key_fkey"
            columns: ["methodology_version", "stage_key"]
            isOneToOne: false
            referencedRelation: "site_methodology_stages"
            referencedColumns: ["methodology_version", "stage_key"]
          },
        ]
      }
      site_methodology_stages: {
        Row: {
          definition: Json
          methodology_version: string
          position: number
          requires_approval: boolean
          stage_key: string
          title: string
        }
        Insert: {
          definition?: Json
          methodology_version: string
          position: number
          requires_approval?: boolean
          stage_key: string
          title: string
        }
        Update: {
          definition?: Json
          methodology_version?: string
          position?: number
          requires_approval?: boolean
          stage_key?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_methodology_stages_methodology_version_fkey"
            columns: ["methodology_version"]
            isOneToOne: false
            referencedRelation: "site_methodologies"
            referencedColumns: ["version"]
          },
        ]
      }
      site_project_approvals: {
        Row: {
          created_at: string
          decided_by: string
          decision: string
          id: string
          note: string | null
          project_id: string
          stage_key: string
        }
        Insert: {
          created_at?: string
          decided_by?: string
          decision: string
          id?: string
          note?: string | null
          project_id: string
          stage_key: string
        }
        Update: {
          created_at?: string
          decided_by?: string
          decision?: string
          id?: string
          note?: string | null
          project_id?: string
          stage_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_artifacts: {
        Row: {
          artifact_type: string
          created_at: string
          external_url: string | null
          file_id: string | null
          id: string
          metadata: Json
          notes: string | null
          page_id: string | null
          project_id: string
          section_id: string | null
          status: string
          updated_at: string
          version: number
          viewport: string | null
        }
        Insert: {
          artifact_type: string
          created_at?: string
          external_url?: string | null
          file_id?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          page_id?: string | null
          project_id: string
          section_id?: string | null
          status?: string
          updated_at?: string
          version?: number
          viewport?: string | null
        }
        Update: {
          artifact_type?: string
          created_at?: string
          external_url?: string | null
          file_id?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          page_id?: string | null
          project_id?: string
          section_id?: string | null
          status?: string
          updated_at?: string
          version?: number
          viewport?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_project_artifacts_file_id_project_id_fkey"
            columns: ["file_id", "project_id"]
            isOneToOne: false
            referencedRelation: "site_project_files"
            referencedColumns: ["id", "project_id"]
          },
          {
            foreignKeyName: "site_project_artifacts_page_id_project_id_fkey"
            columns: ["page_id", "project_id"]
            isOneToOne: false
            referencedRelation: "site_project_pages"
            referencedColumns: ["id", "project_id"]
          },
          {
            foreignKeyName: "site_project_artifacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_artifacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_project_artifacts_section_id_project_id_fkey"
            columns: ["section_id", "project_id"]
            isOneToOne: false
            referencedRelation: "site_project_sections"
            referencedColumns: ["id", "project_id"]
          },
        ]
      }
      site_project_assets: {
        Row: {
          asset_type: string
          created_at: string
          file_id: string
          id: string
          metadata: Json
          page_id: string | null
          project_id: string
          section_id: string | null
          status: string
          updated_at: string
          usage: string | null
        }
        Insert: {
          asset_type: string
          created_at?: string
          file_id: string
          id?: string
          metadata?: Json
          page_id?: string | null
          project_id: string
          section_id?: string | null
          status?: string
          updated_at?: string
          usage?: string | null
        }
        Update: {
          asset_type?: string
          created_at?: string
          file_id?: string
          id?: string
          metadata?: Json
          page_id?: string | null
          project_id?: string
          section_id?: string | null
          status?: string
          updated_at?: string
          usage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_project_assets_file_id_project_id_fkey"
            columns: ["file_id", "project_id"]
            isOneToOne: false
            referencedRelation: "site_project_files"
            referencedColumns: ["id", "project_id"]
          },
          {
            foreignKeyName: "site_project_assets_page_id_project_id_fkey"
            columns: ["page_id", "project_id"]
            isOneToOne: false
            referencedRelation: "site_project_pages"
            referencedColumns: ["id", "project_id"]
          },
          {
            foreignKeyName: "site_project_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_project_assets_section_id_project_id_fkey"
            columns: ["section_id", "project_id"]
            isOneToOne: false
            referencedRelation: "site_project_sections"
            referencedColumns: ["id", "project_id"]
          },
        ]
      }
      site_project_competitors: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          notes: string | null
          project_id: string
          strengths: string | null
          updated_at: string
          url: string | null
          weaknesses: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          notes?: string | null
          project_id: string
          strengths?: string | null
          updated_at?: string
          url?: string | null
          weaknesses?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          notes?: string | null
          project_id?: string
          strengths?: string | null
          updated_at?: string
          url?: string | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_project_competitors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_competitors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_design_tokens: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          project_id: string
          token_key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          project_id: string
          token_key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string
          token_key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_project_design_tokens_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_design_tokens_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_files: {
        Row: {
          bucket_id: string
          category: string
          checksum: string | null
          created_at: string
          deleted_at: string | null
          height: number | null
          id: string
          metadata: Json
          mime_type: string
          object_path: string
          original_name: string
          project_id: string
          size_bytes: number
          uploaded_by: string
          width: number | null
        }
        Insert: {
          bucket_id?: string
          category: string
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          height?: number | null
          id?: string
          metadata?: Json
          mime_type: string
          object_path: string
          original_name: string
          project_id: string
          size_bytes: number
          uploaded_by?: string
          width?: number | null
        }
        Update: {
          bucket_id?: string
          category?: string
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          height?: number | null
          id?: string
          metadata?: Json
          mime_type?: string
          object_path?: string
          original_name?: string
          project_id?: string
          size_bytes?: number
          uploaded_by?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_gate_overrides: {
        Row: {
          created_at: string
          created_by: string
          gate_key: string
          id: string
          project_id: string
          reason: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          gate_key: string
          id?: string
          project_id: string
          reason: string
        }
        Update: {
          created_at?: string
          created_by?: string
          gate_key?: string
          id?: string
          project_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_gate_overrides_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_gate_overrides_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_history: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json
          new_value: Json | null
          old_value: Json | null
          project_id: string | null
          project_name: string | null
          stage_key: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          new_value?: Json | null
          old_value?: Json | null
          project_id?: string | null
          project_name?: string | null
          stage_key?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          new_value?: Json | null
          old_value?: Json | null
          project_id?: string | null
          project_name?: string | null
          stage_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_project_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_members: {
        Row: {
          added_by: string | null
          created_at: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_pages: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          project_id: string
          purpose: string | null
          slug: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          project_id: string
          purpose?: string | null
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          project_id?: string
          purpose?: string | null
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_prompt_runs: {
        Row: {
          created_at: string
          created_by: string
          id: string
          input_snapshot: Json
          output_text: string
          project_id: string
          prompt_type: string
          prompt_version: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          input_snapshot?: Json
          output_text: string
          project_id: string
          prompt_type: string
          prompt_version?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          input_snapshot?: Json
          output_text?: string
          project_id?: string
          prompt_type?: string
          prompt_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_prompt_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_prompt_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_qa_items: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          evidence_file_id: string | null
          id: string
          metadata: Json
          project_id: string
          qa_type: string
          resolved_at: string | null
          severity: string
          stage_key: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          evidence_file_id?: string | null
          id?: string
          metadata?: Json
          project_id: string
          qa_type: string
          resolved_at?: string | null
          severity?: string
          stage_key?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          evidence_file_id?: string | null
          id?: string
          metadata?: Json
          project_id?: string
          qa_type?: string
          resolved_at?: string | null
          severity?: string
          stage_key?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_qa_items_evidence_file_id_project_id_fkey"
            columns: ["evidence_file_id", "project_id"]
            isOneToOne: false
            referencedRelation: "site_project_files"
            referencedColumns: ["id", "project_id"]
          },
          {
            foreignKeyName: "site_project_qa_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_qa_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_references: {
        Row: {
          created_at: string
          file_id: string | null
          id: string
          liked_aspects: Json
          metadata: Json
          must_not_copy: string | null
          observation: string | null
          project_id: string
          title: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          file_id?: string | null
          id?: string
          liked_aspects?: Json
          metadata?: Json
          must_not_copy?: string | null
          observation?: string | null
          project_id: string
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          file_id?: string | null
          id?: string
          liked_aspects?: Json
          metadata?: Json
          must_not_copy?: string | null
          observation?: string | null
          project_id?: string
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_project_references_file_project_fk"
            columns: ["file_id", "project_id"]
            isOneToOne: false
            referencedRelation: "site_project_files"
            referencedColumns: ["id", "project_id"]
          },
          {
            foreignKeyName: "site_project_references_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_references_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_responsive_tests: {
        Row: {
          area: string | null
          created_at: string
          id: string
          notes: string | null
          page_id: string | null
          project_id: string
          status: string
          tested_at: string | null
          tested_by: string | null
          updated_at: string
          viewport: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          page_id?: string | null
          project_id: string
          status?: string
          tested_at?: string | null
          tested_by?: string | null
          updated_at?: string
          viewport: string
        }
        Update: {
          area?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          page_id?: string | null
          project_id?: string
          status?: string
          tested_at?: string | null
          tested_by?: string | null
          updated_at?: string
          viewport?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_responsive_tests_page_id_project_id_fkey"
            columns: ["page_id", "project_id"]
            isOneToOne: false
            referencedRelation: "site_project_pages"
            referencedColumns: ["id", "project_id"]
          },
          {
            foreignKeyName: "site_project_responsive_tests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_responsive_tests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_scores: {
        Row: {
          comment: string | null
          created_at: string
          dimension: string
          id: string
          is_pending: boolean
          metadata: Json
          project_id: string
          score: number | null
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          dimension: string
          id?: string
          is_pending?: boolean
          metadata?: Json
          project_id: string
          score?: number | null
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          dimension?: string
          id?: string
          is_pending?: boolean
          metadata?: Json
          project_id?: string
          score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_scores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_scores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          name: string
          page_id: string
          project_id: string
          revision: number
          section_type: string | null
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          name: string
          page_id: string
          project_id: string
          revision?: number
          section_type?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          name?: string
          page_id?: string
          project_id?: string
          revision?: number
          section_type?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_sections_page_id_project_id_fkey"
            columns: ["page_id", "project_id"]
            isOneToOne: false
            referencedRelation: "site_project_pages"
            referencedColumns: ["id", "project_id"]
          },
          {
            foreignKeyName: "site_project_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_services: {
        Row: {
          audience: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json
          name: string
          priority: number
          project_id: string
          updated_at: string
        }
        Insert: {
          audience?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          priority?: number
          project_id: string
          updated_at?: string
        }
        Update: {
          audience?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          priority?: number
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_stage_items: {
        Row: {
          created_at: string
          group_key: string | null
          id: string
          item_key: string
          item_type: string
          label: string
          required: boolean
          revision: number
          sort_order: number
          stage_id: string
          status: string
          updated_at: string
          value: Json
          weight: number
        }
        Insert: {
          created_at?: string
          group_key?: string | null
          id?: string
          item_key: string
          item_type?: string
          label: string
          required?: boolean
          revision?: number
          sort_order?: number
          stage_id: string
          status?: string
          updated_at?: string
          value?: Json
          weight?: number
        }
        Update: {
          created_at?: string
          group_key?: string | null
          id?: string
          item_key?: string
          item_type?: string
          label?: string
          required?: boolean
          revision?: number
          sort_order?: number
          stage_id?: string
          status?: string
          updated_at?: string
          value?: Json
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "site_project_stage_items_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "site_project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      site_project_stages: {
        Row: {
          completed_at: string | null
          created_at: string
          data: Json
          id: string
          position: number
          project_id: string
          revision: number
          schema_version: number
          stage_key: string
          started_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          position: number
          project_id: string
          revision?: number
          schema_version?: number
          stage_key: string
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          position?: number
          project_id?: string
          revision?: number
          schema_version?: number
          stage_key?: string
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_project_progress_v"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "site_project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "site_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_projects: {
        Row: {
          business_description: string | null
          client_id: string | null
          created_at: string
          current_stage_key: string
          deleted_at: string | null
          differentials: Json
          estimated_deadline: string | null
          id: string
          main_offer: string | null
          methodology_version: string
          name: string
          notes: string | null
          owner_id: string
          platform: string | null
          platform_other: string | null
          primary_cta: string | null
          primary_goal: string | null
          priority_audience: string | null
          problems: string | null
          responsible_user_id: string | null
          revision: number
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_description?: string | null
          client_id?: string | null
          created_at?: string
          current_stage_key?: string
          deleted_at?: string | null
          differentials?: Json
          estimated_deadline?: string | null
          id?: string
          main_offer?: string | null
          methodology_version?: string
          name: string
          notes?: string | null
          owner_id?: string
          platform?: string | null
          platform_other?: string | null
          primary_cta?: string | null
          primary_goal?: string | null
          priority_audience?: string | null
          problems?: string | null
          responsible_user_id?: string | null
          revision?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_description?: string | null
          client_id?: string | null
          created_at?: string
          current_stage_key?: string
          deleted_at?: string | null
          differentials?: Json
          estimated_deadline?: string | null
          id?: string
          main_offer?: string | null
          methodology_version?: string
          name?: string
          notes?: string | null
          owner_id?: string
          platform?: string | null
          platform_other?: string | null
          primary_cta?: string | null
          primary_goal?: string | null
          priority_audience?: string | null
          problems?: string | null
          responsible_user_id?: string | null
          revision?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_projects_methodology_version_fkey"
            columns: ["methodology_version"]
            isOneToOne: false
            referencedRelation: "site_methodologies"
            referencedColumns: ["version"]
          },
        ]
      }
    }
    Views: {
      site_project_progress_v: {
        Row: {
          progress_percent: number | null
          project_id: string | null
        }
        Insert: {
          progress_percent?: never
          project_id?: string | null
        }
        Update: {
          progress_percent?: never
          project_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      active_site_methodology_version: { Args: never; Returns: string }
      can_access_site_project_object: {
        Args: { p_object_name: string; p_write?: boolean }
        Returns: boolean
      }
      decide_site_project_stage: {
        Args: {
          p_decision: string
          p_note?: string
          p_project_id: string
          p_stage_key: string
        }
        Returns: {
          created_at: string
          decided_by: string
          decision: string
          id: string
          note: string | null
          project_id: string
          stage_key: string
        }
        SetofOptions: {
          from: "*"
          to: "site_project_approvals"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_site_project_role: {
        Args: { p_project_id: string; p_roles?: string[] }
        Returns: boolean
      }
      permanently_delete_site_project: {
        Args: { p_confirmation: string; p_project_id: string }
        Returns: undefined
      }
      revert_lead_approach: {
        Args: { p_lead_id: string }
        Returns: {
          address: string | null
          approached_at: string | null
          batch_id: string | null
          business_name: string | null
          city: string | null
          closed_at: string | null
          contact_url: string | null
          country: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          external_id: string | null
          extra: Json
          followup_at: string | null
          followup_message: string | null
          id: string
          instagram: string | null
          instagram_status: string | null
          maps_search_url: string | null
          message: string
          name: string
          normalized_phone: string | null
          notes: string | null
          opportunity: string | null
          pain: string | null
          phone: string | null
          priority: string
          proposal_at: string | null
          rating: number | null
          responded_at: string | null
          review_count: number | null
          score: number | null
          segment: string | null
          source: string | null
          state: string | null
          status: string
          updated_at: string
          validation_required: boolean
          website: string | null
          website_status: string | null
          whatsapp_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "leads"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_site_project_stage_status: {
        Args: {
          p_override_reason?: string
          p_project_id: string
          p_stage_key: string
          p_status: string
        }
        Returns: {
          completed_at: string | null
          created_at: string
          data: Json
          id: string
          position: number
          project_id: string
          revision: number
          schema_version: number
          stage_key: string
          started_at: string | null
          status: string
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "site_project_stages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      site_project_progress: { Args: { p_project_id: string }; Returns: number }
      soft_delete_site_project: {
        Args: { p_project_id: string }
        Returns: {
          business_description: string | null
          client_id: string | null
          created_at: string
          current_stage_key: string
          deleted_at: string | null
          differentials: Json
          estimated_deadline: string | null
          id: string
          main_offer: string | null
          methodology_version: string
          name: string
          notes: string | null
          owner_id: string
          platform: string | null
          platform_other: string | null
          primary_cta: string | null
          primary_goal: string | null
          priority_audience: string | null
          problems: string | null
          responsible_user_id: string | null
          revision: number
          start_date: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "site_projects"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_lead_approach: {
        Args: { p_lead_id: string; p_message: string }
        Returns: {
          address: string | null
          approached_at: string | null
          batch_id: string | null
          business_name: string | null
          city: string | null
          closed_at: string | null
          contact_url: string | null
          country: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          external_id: string | null
          extra: Json
          followup_at: string | null
          followup_message: string | null
          id: string
          instagram: string | null
          instagram_status: string | null
          maps_search_url: string | null
          message: string
          name: string
          normalized_phone: string | null
          notes: string | null
          opportunity: string | null
          pain: string | null
          phone: string | null
          priority: string
          proposal_at: string | null
          rating: number | null
          responded_at: string | null
          review_count: number | null
          score: number | null
          segment: string | null
          source: string | null
          state: string | null
          status: string
          updated_at: string
          validation_required: boolean
          website: string | null
          website_status: string | null
          whatsapp_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "leads"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
          versioning_status: string
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
          versioning_status?: string
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
          versioning_status?: string
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          archived_at: string | null
          bucket_id: string | null
          created_at: string | null
          id: string
          is_delete_marker: boolean
          is_versioned: boolean
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          archived_at?: string | null
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          is_delete_marker?: boolean
          is_versioned?: boolean
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          archived_at?: string | null
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          is_delete_marker?: boolean
          is_versioned?: boolean
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
