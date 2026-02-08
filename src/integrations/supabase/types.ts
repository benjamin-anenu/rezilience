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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bonds: {
        Row: {
          created_at: string
          id: string
          locked_until: string
          project_id: string
          staked_amount: number
          user_wallet: string
          yield_earned: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          locked_until: string
          project_id: string
          staked_amount: number
          user_wallet: string
          yield_earned?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          locked_until?: string
          project_id?: string
          staked_amount?: number
          user_wallet?: string
          yield_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bonds_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_blacklist: {
        Row: {
          attempt_count: number
          created_at: string
          first_attempt_at: string
          id: string
          is_permanent_ban: boolean
          last_attempt_at: string
          profile_id: string
          wallet_address: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          first_attempt_at?: string
          id?: string
          is_permanent_ban?: boolean
          last_attempt_at?: string
          profile_id: string
          wallet_address: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          first_attempt_at?: string
          id?: string
          is_permanent_ban?: boolean
          last_attempt_at?: string
          profile_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_blacklist_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "claimed_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claimed_profiles: {
        Row: {
          authority_signature: string | null
          authority_type: string | null
          authority_verified_at: string | null
          authority_wallet: string | null
          build_in_public_videos: Json | null
          bytecode_hash: string | null
          bytecode_match_status: string | null
          bytecode_verified_at: string | null
          category: string | null
          claim_status: string | null
          claimer_wallet: string | null
          country: string | null
          created_at: string
          description: string | null
          discord_url: string | null
          discovered_at: string | null
          github_access_token: string | null
          github_analyzed_at: string | null
          github_commit_velocity: number | null
          github_commits_30d: number | null
          github_contributors: number | null
          github_forks: number | null
          github_homepage: string | null
          github_is_fork: boolean | null
          github_issue_events_30d: number | null
          github_language: string | null
          github_last_activity: string | null
          github_last_commit: string | null
          github_open_issues: number | null
          github_org_url: string | null
          github_pr_events_30d: number | null
          github_push_events_30d: number | null
          github_recent_events: Json | null
          github_releases_30d: number | null
          github_stars: number | null
          github_token_scope: string | null
          github_top_contributors: Json | null
          github_topics: Json | null
          github_username: string | null
          id: string
          liveness_status: string | null
          logo_url: string | null
          media_assets: Json | null
          milestones: Json | null
          multisig_address: string | null
          multisig_verified_via: string | null
          program_id: string | null
          project_id: string | null
          project_name: string
          resilience_score: number | null
          squads_version: string | null
          staking_pitch: string | null
          team_members: Json | null
          telegram_url: string | null
          twitter_engagement_rate: number | null
          twitter_followers: number | null
          twitter_last_synced: string | null
          twitter_recent_tweets: Json | null
          updated_at: string
          verified: boolean
          verified_at: string | null
          wallet_address: string | null
          website_url: string | null
          x_user_id: string | null
          x_username: string | null
        }
        Insert: {
          authority_signature?: string | null
          authority_type?: string | null
          authority_verified_at?: string | null
          authority_wallet?: string | null
          build_in_public_videos?: Json | null
          bytecode_hash?: string | null
          bytecode_match_status?: string | null
          bytecode_verified_at?: string | null
          category?: string | null
          claim_status?: string | null
          claimer_wallet?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          discord_url?: string | null
          discovered_at?: string | null
          github_access_token?: string | null
          github_analyzed_at?: string | null
          github_commit_velocity?: number | null
          github_commits_30d?: number | null
          github_contributors?: number | null
          github_forks?: number | null
          github_homepage?: string | null
          github_is_fork?: boolean | null
          github_issue_events_30d?: number | null
          github_language?: string | null
          github_last_activity?: string | null
          github_last_commit?: string | null
          github_open_issues?: number | null
          github_org_url?: string | null
          github_pr_events_30d?: number | null
          github_push_events_30d?: number | null
          github_recent_events?: Json | null
          github_releases_30d?: number | null
          github_stars?: number | null
          github_token_scope?: string | null
          github_top_contributors?: Json | null
          github_topics?: Json | null
          github_username?: string | null
          id?: string
          liveness_status?: string | null
          logo_url?: string | null
          media_assets?: Json | null
          milestones?: Json | null
          multisig_address?: string | null
          multisig_verified_via?: string | null
          program_id?: string | null
          project_id?: string | null
          project_name: string
          resilience_score?: number | null
          squads_version?: string | null
          staking_pitch?: string | null
          team_members?: Json | null
          telegram_url?: string | null
          twitter_engagement_rate?: number | null
          twitter_followers?: number | null
          twitter_last_synced?: string | null
          twitter_recent_tweets?: Json | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          wallet_address?: string | null
          website_url?: string | null
          x_user_id?: string | null
          x_username?: string | null
        }
        Update: {
          authority_signature?: string | null
          authority_type?: string | null
          authority_verified_at?: string | null
          authority_wallet?: string | null
          build_in_public_videos?: Json | null
          bytecode_hash?: string | null
          bytecode_match_status?: string | null
          bytecode_verified_at?: string | null
          category?: string | null
          claim_status?: string | null
          claimer_wallet?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          discord_url?: string | null
          discovered_at?: string | null
          github_access_token?: string | null
          github_analyzed_at?: string | null
          github_commit_velocity?: number | null
          github_commits_30d?: number | null
          github_contributors?: number | null
          github_forks?: number | null
          github_homepage?: string | null
          github_is_fork?: boolean | null
          github_issue_events_30d?: number | null
          github_language?: string | null
          github_last_activity?: string | null
          github_last_commit?: string | null
          github_open_issues?: number | null
          github_org_url?: string | null
          github_pr_events_30d?: number | null
          github_push_events_30d?: number | null
          github_recent_events?: Json | null
          github_releases_30d?: number | null
          github_stars?: number | null
          github_token_scope?: string | null
          github_top_contributors?: Json | null
          github_topics?: Json | null
          github_username?: string | null
          id?: string
          liveness_status?: string | null
          logo_url?: string | null
          media_assets?: Json | null
          milestones?: Json | null
          multisig_address?: string | null
          multisig_verified_via?: string | null
          program_id?: string | null
          project_id?: string | null
          project_name?: string
          resilience_score?: number | null
          squads_version?: string | null
          staking_pitch?: string | null
          team_members?: Json | null
          telegram_url?: string | null
          twitter_engagement_rate?: number | null
          twitter_followers?: number | null
          twitter_last_synced?: string | null
          twitter_recent_tweets?: Json | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          wallet_address?: string | null
          website_url?: string | null
          x_user_id?: string | null
          x_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claimed_profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          github_commit_velocity: number | null
          github_contributors: number | null
          github_forks: number | null
          github_language: string | null
          github_last_commit: string | null
          github_stars: number | null
          github_url: string | null
          id: string
          is_fork: boolean | null
          is_multisig: boolean | null
          last_onchain_activity: string | null
          liveness_status: Database["public"]["Enums"]["liveness_status"] | null
          logo_url: string | null
          originality_score: number | null
          program_authority: string | null
          program_id: string
          program_name: string
          resilience_score: number | null
          total_staked: number | null
          updated_at: string
          verified: boolean
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_commit_velocity?: number | null
          github_contributors?: number | null
          github_forks?: number | null
          github_language?: string | null
          github_last_commit?: string | null
          github_stars?: number | null
          github_url?: string | null
          id?: string
          is_fork?: boolean | null
          is_multisig?: boolean | null
          last_onchain_activity?: string | null
          liveness_status?:
            | Database["public"]["Enums"]["liveness_status"]
            | null
          logo_url?: string | null
          originality_score?: number | null
          program_authority?: string | null
          program_id: string
          program_name: string
          resilience_score?: number | null
          total_staked?: number | null
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          github_commit_velocity?: number | null
          github_contributors?: number | null
          github_forks?: number | null
          github_language?: string | null
          github_last_commit?: string | null
          github_stars?: number | null
          github_url?: string | null
          id?: string
          is_fork?: boolean | null
          is_multisig?: boolean | null
          last_onchain_activity?: string | null
          liveness_status?:
            | Database["public"]["Enums"]["liveness_status"]
            | null
          logo_url?: string | null
          originality_score?: number | null
          program_authority?: string | null
          program_id?: string
          program_name?: string
          resilience_score?: number | null
          total_staked?: number | null
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Relationships: []
      }
      score_history: {
        Row: {
          breakdown: Json | null
          claimed_profile_id: string | null
          commit_velocity: number | null
          days_last_commit: number | null
          id: string
          project_id: string | null
          score: number
          snapshot_date: string
        }
        Insert: {
          breakdown?: Json | null
          claimed_profile_id?: string | null
          commit_velocity?: number | null
          days_last_commit?: number | null
          id?: string
          project_id?: string | null
          score: number
          snapshot_date?: string
        }
        Update: {
          breakdown?: Json | null
          claimed_profile_id?: string | null
          commit_velocity?: number | null
          days_last_commit?: number | null
          id?: string
          project_id?: string | null
          score?: number
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_history_claimed_profile_id_fkey"
            columns: ["claimed_profile_id"]
            isOneToOne: false
            referencedRelation: "claimed_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_score_changes: {
        Args: { profile_ids: string[] }
        Returns: {
          movement: string
          profile_id: string
        }[]
      }
    }
    Enums: {
      liveness_status: "ACTIVE" | "STALE" | "DECAYING"
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
      liveness_status: ["ACTIVE", "STALE", "DECAYING"],
    },
  },
} as const
