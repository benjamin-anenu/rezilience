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
      admin_ai_usage: {
        Row: {
          conversation_id: string | null
          created_at: string
          estimated_cost_usd: number | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          model: string | null
          output_tokens: number | null
          status_code: number | null
          tool_calls: Json | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          estimated_cost_usd?: number | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model?: string | null
          output_tokens?: number | null
          status_code?: number | null
          tool_calls?: Json | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          estimated_cost_usd?: number | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model?: string | null
          output_tokens?: number | null
          status_code?: number | null
          tool_calls?: Json | null
        }
        Relationships: []
      }
      admin_analytics: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_metadata: Json | null
          event_target: string
          event_type: string
          id: string
          session_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_metadata?: Json | null
          event_target: string
          event_type: string
          id?: string
          session_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_metadata?: Json | null
          event_target?: string
          event_type?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      admin_costs: {
        Row: {
          amount_usd: number
          category: string
          created_at: string
          id: string
          notes: string | null
          period: string
        }
        Insert: {
          amount_usd?: number
          category: string
          created_at?: string
          id?: string
          notes?: string | null
          period: string
        }
        Update: {
          amount_usd?: number
          category?: string
          created_at?: string
          id?: string
          notes?: string | null
          period?: string
        }
        Relationships: []
      }
      admin_service_health: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          latency_ms: number | null
          service_name: string
          status_code: number | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          service_name: string
          status_code?: number | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          service_name?: string
          status_code?: number | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
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
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          feedback: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
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
          {
            foreignKeyName: "claim_blacklist_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "claimed_profiles_public"
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
          bytecode_confidence: string | null
          bytecode_deploy_slot: number | null
          bytecode_hash: string | null
          bytecode_match_status: string | null
          bytecode_on_chain_hash: string | null
          bytecode_verified_at: string | null
          category: string | null
          claim_status: string | null
          claimer_wallet: string | null
          country: string | null
          created_at: string
          dependency_analyzed_at: string | null
          dependency_critical_count: number | null
          dependency_health_score: number | null
          dependency_outdated_count: number | null
          description: string | null
          discord_url: string | null
          discovered_at: string | null
          discovery_source: string | null
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
          github_languages: Json | null
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
          governance_address: string | null
          governance_analyzed_at: string | null
          governance_last_activity: string | null
          governance_tx_30d: number | null
          id: string
          integrated_score: number | null
          liveness_status: string | null
          logo_url: string | null
          media_assets: Json | null
          milestones: Json | null
          multisig_address: string | null
          multisig_verified_via: string | null
          openssf_analyzed_at: string | null
          openssf_checks: Json | null
          openssf_score: number | null
          program_id: string | null
          project_id: string | null
          project_name: string
          resilience_score: number | null
          score_breakdown: Json | null
          squads_version: string | null
          staking_pitch: string | null
          team_members: Json | null
          telegram_url: string | null
          tvl_analyzed_at: string | null
          tvl_market_share: number | null
          tvl_risk_ratio: number | null
          tvl_usd: number | null
          twitter_engagement_rate: number | null
          twitter_followers: number | null
          twitter_last_synced: string | null
          twitter_recent_tweets: Json | null
          updated_at: string
          verified: boolean
          verified_at: string | null
          vulnerability_analyzed_at: string | null
          vulnerability_count: number | null
          vulnerability_details: Json | null
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
          bytecode_confidence?: string | null
          bytecode_deploy_slot?: number | null
          bytecode_hash?: string | null
          bytecode_match_status?: string | null
          bytecode_on_chain_hash?: string | null
          bytecode_verified_at?: string | null
          category?: string | null
          claim_status?: string | null
          claimer_wallet?: string | null
          country?: string | null
          created_at?: string
          dependency_analyzed_at?: string | null
          dependency_critical_count?: number | null
          dependency_health_score?: number | null
          dependency_outdated_count?: number | null
          description?: string | null
          discord_url?: string | null
          discovered_at?: string | null
          discovery_source?: string | null
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
          github_languages?: Json | null
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
          governance_address?: string | null
          governance_analyzed_at?: string | null
          governance_last_activity?: string | null
          governance_tx_30d?: number | null
          id?: string
          integrated_score?: number | null
          liveness_status?: string | null
          logo_url?: string | null
          media_assets?: Json | null
          milestones?: Json | null
          multisig_address?: string | null
          multisig_verified_via?: string | null
          openssf_analyzed_at?: string | null
          openssf_checks?: Json | null
          openssf_score?: number | null
          program_id?: string | null
          project_id?: string | null
          project_name: string
          resilience_score?: number | null
          score_breakdown?: Json | null
          squads_version?: string | null
          staking_pitch?: string | null
          team_members?: Json | null
          telegram_url?: string | null
          tvl_analyzed_at?: string | null
          tvl_market_share?: number | null
          tvl_risk_ratio?: number | null
          tvl_usd?: number | null
          twitter_engagement_rate?: number | null
          twitter_followers?: number | null
          twitter_last_synced?: string | null
          twitter_recent_tweets?: Json | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          vulnerability_analyzed_at?: string | null
          vulnerability_count?: number | null
          vulnerability_details?: Json | null
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
          bytecode_confidence?: string | null
          bytecode_deploy_slot?: number | null
          bytecode_hash?: string | null
          bytecode_match_status?: string | null
          bytecode_on_chain_hash?: string | null
          bytecode_verified_at?: string | null
          category?: string | null
          claim_status?: string | null
          claimer_wallet?: string | null
          country?: string | null
          created_at?: string
          dependency_analyzed_at?: string | null
          dependency_critical_count?: number | null
          dependency_health_score?: number | null
          dependency_outdated_count?: number | null
          description?: string | null
          discord_url?: string | null
          discovered_at?: string | null
          discovery_source?: string | null
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
          github_languages?: Json | null
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
          governance_address?: string | null
          governance_analyzed_at?: string | null
          governance_last_activity?: string | null
          governance_tx_30d?: number | null
          id?: string
          integrated_score?: number | null
          liveness_status?: string | null
          logo_url?: string | null
          media_assets?: Json | null
          milestones?: Json | null
          multisig_address?: string | null
          multisig_verified_via?: string | null
          openssf_analyzed_at?: string | null
          openssf_checks?: Json | null
          openssf_score?: number | null
          program_id?: string | null
          project_id?: string | null
          project_name?: string
          resilience_score?: number | null
          score_breakdown?: Json | null
          squads_version?: string | null
          staking_pitch?: string | null
          team_members?: Json | null
          telegram_url?: string | null
          tvl_analyzed_at?: string | null
          tvl_market_share?: number | null
          tvl_risk_ratio?: number | null
          tvl_usd?: number | null
          twitter_engagement_rate?: number | null
          twitter_followers?: number | null
          twitter_last_synced?: string | null
          twitter_recent_tweets?: Json | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          vulnerability_analyzed_at?: string | null
          vulnerability_count?: number | null
          vulnerability_details?: Json | null
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
      dependency_graph: {
        Row: {
          analyzed_at: string | null
          crate_name: string
          crates_io_dependents: number | null
          crates_io_url: string | null
          current_version: string | null
          dependency_type: string | null
          id: string
          is_critical: boolean | null
          is_outdated: boolean | null
          latest_version: string | null
          months_behind: number | null
          npm_url: string | null
          package_name: string | null
          pypi_url: string | null
          source_profile_id: string
        }
        Insert: {
          analyzed_at?: string | null
          crate_name: string
          crates_io_dependents?: number | null
          crates_io_url?: string | null
          current_version?: string | null
          dependency_type?: string | null
          id?: string
          is_critical?: boolean | null
          is_outdated?: boolean | null
          latest_version?: string | null
          months_behind?: number | null
          npm_url?: string | null
          package_name?: string | null
          pypi_url?: string | null
          source_profile_id: string
        }
        Update: {
          analyzed_at?: string | null
          crate_name?: string
          crates_io_dependents?: number | null
          crates_io_url?: string | null
          current_version?: string | null
          dependency_type?: string | null
          id?: string
          is_critical?: boolean | null
          is_outdated?: boolean | null
          latest_version?: string | null
          months_behind?: number | null
          npm_url?: string | null
          package_name?: string | null
          pypi_url?: string | null
          source_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependency_graph_source_profile_id_fkey"
            columns: ["source_profile_id"]
            isOneToOne: false
            referencedRelation: "claimed_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dependency_graph_source_profile_id_fkey"
            columns: ["source_profile_id"]
            isOneToOne: false
            referencedRelation: "claimed_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_snapshots: {
        Row: {
          active_projects: number
          avg_dependency_health: number
          avg_resilience_score: number
          created_at: string | null
          decaying_count: number
          healthy_count: number
          id: string
          snapshot_date: string
          stale_count: number
          total_commits_30d: number
          total_contributors: number
          total_governance_tx: number
          total_projects: number
          total_tvl_usd: number
        }
        Insert: {
          active_projects?: number
          avg_dependency_health?: number
          avg_resilience_score?: number
          created_at?: string | null
          decaying_count?: number
          healthy_count?: number
          id?: string
          snapshot_date: string
          stale_count?: number
          total_commits_30d?: number
          total_contributors?: number
          total_governance_tx?: number
          total_projects?: number
          total_tvl_usd?: number
        }
        Update: {
          active_projects?: number
          avg_dependency_health?: number
          avg_resilience_score?: number
          created_at?: string | null
          decaying_count?: number
          healthy_count?: number
          id?: string
          snapshot_date?: string
          stale_count?: number
          total_commits_30d?: number
          total_contributors?: number
          total_governance_tx?: number
          total_projects?: number
          total_tvl_usd?: number
        }
        Relationships: []
      }
      ecosystem_trends: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_type: string
          expires_at: string | null
          id: string
          metadata: Json | null
          priority: string
          profile_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_type: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          profile_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_type?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          profile_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_trends_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "claimed_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecosystem_trends_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "claimed_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_secrets: {
        Row: {
          created_at: string
          github_access_token: string | null
          github_token_scope: string | null
          id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          github_access_token?: string | null
          github_token_scope?: string | null
          id?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          github_access_token?: string | null
          github_token_scope?: string | null
          id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_secrets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "claimed_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_secrets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "claimed_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      project_subscribers: {
        Row: {
          email: string
          id: string
          profile_id: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          profile_id: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          profile_id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_subscribers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "claimed_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_subscribers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "claimed_profiles_public"
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
            foreignKeyName: "score_history_claimed_profile_id_fkey"
            columns: ["claimed_profile_id"]
            isOneToOne: false
            referencedRelation: "claimed_profiles_public"
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
      bonds_public: {
        Row: {
          created_at: string | null
          id: string | null
          locked_until: string | null
          project_id: string | null
          staked_amount: number | null
          yield_earned: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          locked_until?: string | null
          project_id?: string | null
          staked_amount?: number | null
          yield_earned?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          locked_until?: string | null
          project_id?: string | null
          staked_amount?: number | null
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
      claimed_profiles_public: {
        Row: {
          build_in_public_videos: Json | null
          bytecode_confidence: string | null
          bytecode_deploy_slot: number | null
          bytecode_hash: string | null
          bytecode_match_status: string | null
          bytecode_on_chain_hash: string | null
          bytecode_verified_at: string | null
          category: string | null
          claim_status: string | null
          country: string | null
          created_at: string | null
          dependency_analyzed_at: string | null
          dependency_critical_count: number | null
          dependency_health_score: number | null
          dependency_outdated_count: number | null
          description: string | null
          discord_url: string | null
          discovery_source: string | null
          github_analyzed_at: string | null
          github_commit_velocity: number | null
          github_commits_30d: number | null
          github_contributors: number | null
          github_forks: number | null
          github_homepage: string | null
          github_is_fork: boolean | null
          github_issue_events_30d: number | null
          github_language: string | null
          github_languages: Json | null
          github_last_activity: string | null
          github_last_commit: string | null
          github_open_issues: number | null
          github_org_url: string | null
          github_pr_events_30d: number | null
          github_push_events_30d: number | null
          github_recent_events: Json | null
          github_releases_30d: number | null
          github_stars: number | null
          github_top_contributors: Json | null
          github_topics: Json | null
          github_username: string | null
          governance_address: string | null
          governance_analyzed_at: string | null
          governance_last_activity: string | null
          governance_tx_30d: number | null
          id: string | null
          integrated_score: number | null
          liveness_status: string | null
          logo_url: string | null
          media_assets: Json | null
          milestones: Json | null
          openssf_analyzed_at: string | null
          openssf_checks: Json | null
          openssf_score: number | null
          program_id: string | null
          project_id: string | null
          project_name: string | null
          resilience_score: number | null
          score_breakdown: Json | null
          staking_pitch: string | null
          team_members: Json | null
          telegram_url: string | null
          tvl_analyzed_at: string | null
          tvl_market_share: number | null
          tvl_risk_ratio: number | null
          tvl_usd: number | null
          twitter_engagement_rate: number | null
          twitter_followers: number | null
          twitter_last_synced: string | null
          twitter_recent_tweets: Json | null
          updated_at: string | null
          verified: boolean | null
          verified_at: string | null
          vulnerability_analyzed_at: string | null
          vulnerability_count: number | null
          vulnerability_details: Json | null
          website_url: string | null
          x_user_id: string | null
          x_username: string | null
        }
        Insert: {
          build_in_public_videos?: Json | null
          bytecode_confidence?: string | null
          bytecode_deploy_slot?: number | null
          bytecode_hash?: string | null
          bytecode_match_status?: string | null
          bytecode_on_chain_hash?: string | null
          bytecode_verified_at?: string | null
          category?: string | null
          claim_status?: string | null
          country?: string | null
          created_at?: string | null
          dependency_analyzed_at?: string | null
          dependency_critical_count?: number | null
          dependency_health_score?: number | null
          dependency_outdated_count?: number | null
          description?: string | null
          discord_url?: string | null
          discovery_source?: string | null
          github_analyzed_at?: string | null
          github_commit_velocity?: number | null
          github_commits_30d?: number | null
          github_contributors?: number | null
          github_forks?: number | null
          github_homepage?: string | null
          github_is_fork?: boolean | null
          github_issue_events_30d?: number | null
          github_language?: string | null
          github_languages?: Json | null
          github_last_activity?: string | null
          github_last_commit?: string | null
          github_open_issues?: number | null
          github_org_url?: string | null
          github_pr_events_30d?: number | null
          github_push_events_30d?: number | null
          github_recent_events?: Json | null
          github_releases_30d?: number | null
          github_stars?: number | null
          github_top_contributors?: Json | null
          github_topics?: Json | null
          github_username?: string | null
          governance_address?: string | null
          governance_analyzed_at?: string | null
          governance_last_activity?: string | null
          governance_tx_30d?: number | null
          id?: string | null
          integrated_score?: number | null
          liveness_status?: string | null
          logo_url?: string | null
          media_assets?: Json | null
          milestones?: Json | null
          openssf_analyzed_at?: string | null
          openssf_checks?: Json | null
          openssf_score?: number | null
          program_id?: string | null
          project_id?: string | null
          project_name?: string | null
          resilience_score?: number | null
          score_breakdown?: Json | null
          staking_pitch?: string | null
          team_members?: Json | null
          telegram_url?: string | null
          tvl_analyzed_at?: string | null
          tvl_market_share?: number | null
          tvl_risk_ratio?: number | null
          tvl_usd?: number | null
          twitter_engagement_rate?: number | null
          twitter_followers?: number | null
          twitter_last_synced?: string | null
          twitter_recent_tweets?: Json | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          vulnerability_analyzed_at?: string | null
          vulnerability_count?: number | null
          vulnerability_details?: Json | null
          website_url?: string | null
          x_user_id?: string | null
          x_username?: string | null
        }
        Update: {
          build_in_public_videos?: Json | null
          bytecode_confidence?: string | null
          bytecode_deploy_slot?: number | null
          bytecode_hash?: string | null
          bytecode_match_status?: string | null
          bytecode_on_chain_hash?: string | null
          bytecode_verified_at?: string | null
          category?: string | null
          claim_status?: string | null
          country?: string | null
          created_at?: string | null
          dependency_analyzed_at?: string | null
          dependency_critical_count?: number | null
          dependency_health_score?: number | null
          dependency_outdated_count?: number | null
          description?: string | null
          discord_url?: string | null
          discovery_source?: string | null
          github_analyzed_at?: string | null
          github_commit_velocity?: number | null
          github_commits_30d?: number | null
          github_contributors?: number | null
          github_forks?: number | null
          github_homepage?: string | null
          github_is_fork?: boolean | null
          github_issue_events_30d?: number | null
          github_language?: string | null
          github_languages?: Json | null
          github_last_activity?: string | null
          github_last_commit?: string | null
          github_open_issues?: number | null
          github_org_url?: string | null
          github_pr_events_30d?: number | null
          github_push_events_30d?: number | null
          github_recent_events?: Json | null
          github_releases_30d?: number | null
          github_stars?: number | null
          github_top_contributors?: Json | null
          github_topics?: Json | null
          github_username?: string | null
          governance_address?: string | null
          governance_analyzed_at?: string | null
          governance_last_activity?: string | null
          governance_tx_30d?: number | null
          id?: string | null
          integrated_score?: number | null
          liveness_status?: string | null
          logo_url?: string | null
          media_assets?: Json | null
          milestones?: Json | null
          openssf_analyzed_at?: string | null
          openssf_checks?: Json | null
          openssf_score?: number | null
          program_id?: string | null
          project_id?: string | null
          project_name?: string | null
          resilience_score?: number | null
          score_breakdown?: Json | null
          staking_pitch?: string | null
          team_members?: Json | null
          telegram_url?: string | null
          tvl_analyzed_at?: string | null
          tvl_market_share?: number | null
          tvl_risk_ratio?: number | null
          tvl_usd?: number | null
          twitter_engagement_rate?: number | null
          twitter_followers?: number | null
          twitter_last_synced?: string | null
          twitter_recent_tweets?: Json | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          vulnerability_analyzed_at?: string | null
          vulnerability_count?: number | null
          vulnerability_details?: Json | null
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
