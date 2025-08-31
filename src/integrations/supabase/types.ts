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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      application_rate_limits: {
        Row: {
          email: string
          id: string
          ip_address: string
          submitted_at: string
        }
        Insert: {
          email: string
          id?: string
          ip_address: string
          submitted_at?: string
        }
        Update: {
          email?: string
          id?: string
          ip_address?: string
          submitted_at?: string
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          name_en: string | null
          name_es: string | null
          name_id: string | null
          name_zh: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          name_en?: string | null
          name_es?: string | null
          name_id?: string | null
          name_zh?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          name_en?: string | null
          name_es?: string | null
          name_id?: string | null
          name_zh?: string | null
          slug?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          geo_center_lat: number | null
          geo_center_lng: number | null
          id: string
          is_featured: boolean | null
          name: string
          name_en: string | null
          name_es: string | null
          name_id: string | null
          name_zh: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          geo_center_lat?: number | null
          geo_center_lng?: number | null
          id?: string
          is_featured?: boolean | null
          name: string
          name_en?: string | null
          name_es?: string | null
          name_id?: string | null
          name_zh?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          geo_center_lat?: number | null
          geo_center_lng?: number | null
          id?: string
          is_featured?: boolean | null
          name?: string
          name_en?: string | null
          name_es?: string | null
          name_id?: string | null
          name_zh?: string | null
          slug?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          likes_count: number | null
          offer_id: string | null
          partner_id: string | null
          photos: string[] | null
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          offer_id?: string | null
          partner_id?: string | null
          photos?: string[] | null
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          offer_id?: string | null
          partner_id?: string | null
          photos?: string[] | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_affiliations: {
        Row: {
          affiliate_id: string
          affiliate_type: string
          commission_rate: number
          created_at: string
          employee_user_id: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          affiliate_type: string
          commission_rate?: number
          created_at?: string
          employee_user_id: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          affiliate_type?: string
          commission_rate?: number
          created_at?: string
          employee_user_id?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      employee_commissions: {
        Row: {
          affiliate_id: string
          affiliate_type: string
          commission_amount: number
          commission_rate: number
          created_at: string
          employee_user_id: string
          id: string
          payment_id: string | null
          reseller_sale_id: string | null
          sale_amount: number
          sale_date: string
          sale_type: string
        }
        Insert: {
          affiliate_id: string
          affiliate_type: string
          commission_amount: number
          commission_rate: number
          created_at?: string
          employee_user_id: string
          id?: string
          payment_id?: string | null
          reseller_sale_id?: string | null
          sale_amount: number
          sale_date?: string
          sale_type: string
        }
        Update: {
          affiliate_id?: string
          affiliate_type?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          employee_user_id?: string
          id?: string
          payment_id?: string | null
          reseller_sale_id?: string | null
          sale_amount?: number
          sale_date?: string
          sale_type?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          offer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          offer_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          offer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          amount: number
          code: string
          created_at: string
          currency: string | null
          id: string
          message: string | null
          recipient_email: string
          recipient_name: string
          sender_email: string
          sender_name: string
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          used_at: string | null
          used_by_user_id: string | null
        }
        Insert: {
          amount: number
          code: string
          created_at?: string
          currency?: string | null
          id?: string
          message?: string | null
          recipient_email: string
          recipient_name: string
          sender_email: string
          sender_name: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string
          currency?: string | null
          id?: string
          message?: string | null
          recipient_email?: string
          recipient_name?: string
          sender_email?: string
          sender_name?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          category_id: string
          conditions_text: string | null
          conditions_text_en: string | null
          conditions_text_es: string | null
          conditions_text_id: string | null
          conditions_text_zh: string | null
          created_at: string
          end_date: string | null
          featured_until: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          long_desc: string | null
          long_desc_en: string | null
          long_desc_es: string | null
          long_desc_id: string | null
          long_desc_zh: string | null
          partner_id: string
          per_day_limit: number | null
          per_user_limit: number | null
          photos: string[] | null
          promo_type: Database["public"]["Enums"]["promo_type"]
          short_desc: string | null
          short_desc_en: string | null
          short_desc_es: string | null
          short_desc_id: string | null
          short_desc_zh: string | null
          slug: string
          start_date: string | null
          terms_url: string | null
          title: string
          title_en: string | null
          title_es: string | null
          title_id: string | null
          title_zh: string | null
          updated_at: string
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          category_id: string
          conditions_text?: string | null
          conditions_text_en?: string | null
          conditions_text_es?: string | null
          conditions_text_id?: string | null
          conditions_text_zh?: string | null
          created_at?: string
          end_date?: string | null
          featured_until?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          long_desc?: string | null
          long_desc_en?: string | null
          long_desc_es?: string | null
          long_desc_id?: string | null
          long_desc_zh?: string | null
          partner_id: string
          per_day_limit?: number | null
          per_user_limit?: number | null
          photos?: string[] | null
          promo_type: Database["public"]["Enums"]["promo_type"]
          short_desc?: string | null
          short_desc_en?: string | null
          short_desc_es?: string | null
          short_desc_id?: string | null
          short_desc_zh?: string | null
          slug: string
          start_date?: string | null
          terms_url?: string | null
          title: string
          title_en?: string | null
          title_es?: string | null
          title_id?: string | null
          title_zh?: string | null
          updated_at?: string
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          category_id?: string
          conditions_text?: string | null
          conditions_text_en?: string | null
          conditions_text_es?: string | null
          conditions_text_id?: string | null
          conditions_text_zh?: string | null
          created_at?: string
          end_date?: string | null
          featured_until?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          long_desc?: string | null
          long_desc_en?: string | null
          long_desc_es?: string | null
          long_desc_id?: string | null
          long_desc_zh?: string | null
          partner_id?: string
          per_day_limit?: number | null
          per_user_limit?: number | null
          photos?: string[] | null
          promo_type?: Database["public"]["Enums"]["promo_type"]
          short_desc?: string | null
          short_desc_en?: string | null
          short_desc_es?: string | null
          short_desc_id?: string | null
          short_desc_zh?: string | null
          slug?: string
          start_date?: string | null
          terms_url?: string | null
          title?: string
          title_en?: string | null
          title_es?: string | null
          title_id?: string | null
          title_zh?: string | null
          updated_at?: string
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          page_key: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          page_key: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          page_key?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      partner_accounts: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          business_activity: string
          business_address: string
          business_date: string
          business_name: string
          business_photo: string | null
          created_at: string
          email: string | null
          full_name: string
          has_whatsapp: boolean | null
          id: string
          phone: string
          promotion: string
          status: string
          updated_at: string
        }
        Insert: {
          business_activity: string
          business_address: string
          business_date: string
          business_name: string
          business_photo?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          has_whatsapp?: boolean | null
          id?: string
          phone?: string
          promotion: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_activity?: string
          business_address?: string
          business_date?: string
          business_name?: string
          business_photo?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          has_whatsapp?: boolean | null
          id?: string
          phone?: string
          promotion?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          address: string | null
          city_id: string
          cover_url: string | null
          created_at: string
          description: string | null
          description_en: string | null
          description_es: string | null
          description_id: string | null
          description_zh: string | null
          id: string
          instagram: string | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          name: string
          name_en: string | null
          name_es: string | null
          name_id: string | null
          name_zh: string | null
          owner_account_id: string | null
          phone: string | null
          photos: string[] | null
          qr_code: string | null
          slug: string
          status: Database["public"]["Enums"]["partner_status"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city_id: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          description_id?: string | null
          description_zh?: string | null
          id?: string
          instagram?: string | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name: string
          name_en?: string | null
          name_es?: string | null
          name_id?: string | null
          name_zh?: string | null
          owner_account_id?: string | null
          phone?: string | null
          photos?: string[] | null
          qr_code?: string | null
          slug: string
          status?: Database["public"]["Enums"]["partner_status"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city_id?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          description_id?: string | null
          description_zh?: string | null
          id?: string
          instagram?: string | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string
          name_en?: string | null
          name_es?: string | null
          name_id?: string | null
          name_zh?: string | null
          owner_account_id?: string | null
          phone?: string | null
          photos?: string[] | null
          qr_code?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["partner_status"] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_owner_account_id_fkey"
            columns: ["owner_account_id"]
            isOneToOne: false
            referencedRelation: "partner_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pass_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      passes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          purchased_at: string
          qr_token: string
          status: Database["public"]["Enums"]["pass_status"] | null
          user_id: string
          wallet_pass_url: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          purchased_at?: string
          qr_token: string
          status?: Database["public"]["Enums"]["pass_status"] | null
          user_id: string
          wallet_pass_url?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          purchased_at?: string
          qr_token?: string
          status?: Database["public"]["Enums"]["pass_status"] | null
          user_id?: string
          wallet_pass_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          company_address: string | null
          company_name: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          locale: string | null
          name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          birth_date?: string | null
          company_address?: string | null
          company_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          locale?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          birth_date?: string | null
          company_address?: string | null
          company_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          locale?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      promo_code_uses: {
        Row: {
          id: string
          payment_id: string | null
          promo_code_id: string | null
          used_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          payment_id?: string | null
          promo_code_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          payment_id?: string | null
          promo_code_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_uses_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_uses_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          type: string
          updated_at: string
          used_count: number | null
          value: number | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          type: string
          updated_at?: string
          used_count?: number | null
          value?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          type?: string
          updated_at?: string
          used_count?: number | null
          value?: number | null
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          id: string
          offer_id: string
          partner_id: string
          pass_id: string
          redeemed_at: string
          scanner_user_id: string | null
          status: Database["public"]["Enums"]["redemption_status"] | null
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          offer_id: string
          partner_id: string
          pass_id: string
          redeemed_at?: string
          scanner_user_id?: string | null
          status?: Database["public"]["Enums"]["redemption_status"] | null
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          offer_id?: string
          partner_id?: string
          pass_id?: string
          redeemed_at?: string
          scanner_user_id?: string | null
          status?: Database["public"]["Enums"]["redemption_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_pass_id_fkey"
            columns: ["pass_id"]
            isOneToOne: false
            referencedRelation: "passes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_scanner_user_id_fkey"
            columns: ["scanner_user_id"]
            isOneToOne: false
            referencedRelation: "partner_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_sales: {
        Row: {
          commission_amount: number
          created_at: string
          customer_email: string | null
          discount_amount: number
          id: string
          payment_id: string | null
          reseller_id: string
          sale_amount: number
        }
        Insert: {
          commission_amount: number
          created_at?: string
          customer_email?: string | null
          discount_amount: number
          id?: string
          payment_id?: string | null
          reseller_id: string
          sale_amount: number
        }
        Update: {
          commission_amount?: number
          created_at?: string
          customer_email?: string | null
          discount_amount?: number
          id?: string
          payment_id?: string | null
          reseller_id?: string
          sale_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "reseller_sales_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_sales_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      resellers: {
        Row: {
          commission_rate: number | null
          created_at: string
          discount_rate: number | null
          id: string
          is_active: boolean | null
          qr_code_url: string | null
          total_commission: number | null
          total_sales: number | null
          unique_code: string
          unique_link: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          discount_rate?: number | null
          id?: string
          is_active?: boolean | null
          qr_code_url?: string | null
          total_commission?: number | null
          total_sales?: number | null
          unique_code: string
          unique_link: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          discount_rate?: number | null
          id?: string
          is_active?: boolean | null
          qr_code_url?: string | null
          total_commission?: number | null
          total_sales?: number | null
          unique_code?: string
          unique_link?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_partner_pass: {
        Args: { partner_user_id: string }
        Returns: string
      }
      generate_partner_qr_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_reseller_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_resellers_for_employee: {
        Args: { employee_id: string; reseller_ids: string[] }
        Returns: {
          commission_rate: number
          discount_rate: number
          id: string
          is_active: boolean
          total_commission: number
          total_sales: number
          unique_code: string
          user_id: string
        }[]
      }
      get_role_level: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_or_higher: {
        Args: {
          _min_role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "user"
        | "partner"
        | "admin"
        | "manager"
        | "content_admin"
        | "partner_admin"
        | "super_admin"
        | "reseller"
        | "employee"
      partner_status: "pending" | "approved" | "rejected"
      pass_status: "active" | "expired" | "refunded"
      payment_status: "succeeded" | "refunded" | "pending"
      promo_type: "BOGO" | "percent" | "fixed" | "other"
      redemption_status: "approved" | "denied"
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
      app_role: [
        "user",
        "partner",
        "admin",
        "manager",
        "content_admin",
        "partner_admin",
        "super_admin",
        "reseller",
        "employee",
      ],
      partner_status: ["pending", "approved", "rejected"],
      pass_status: ["active", "expired", "refunded"],
      payment_status: ["succeeded", "refunded", "pending"],
      promo_type: ["BOGO", "percent", "fixed", "other"],
      redemption_status: ["approved", "denied"],
    },
  },
} as const
