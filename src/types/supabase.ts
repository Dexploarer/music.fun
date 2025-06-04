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
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          start_time: string
          end_time: string
          artist_ids: string[] | null
          tickets_sold: number | null
          total_capacity: number
          ticket_price: number
          status: string
          image: string | null
          genre: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          start_time: string
          end_time: string
          artist_ids?: string[] | null
          tickets_sold?: number | null
          total_capacity: number
          ticket_price: number
          status?: string
          image?: string | null
          genre?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          start_time?: string
          end_time?: string
          artist_ids?: string[] | null
          tickets_sold?: number | null
          total_capacity?: number
          ticket_price?: number
          status?: string
          image?: string | null
          genre?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      event_revenue: {
        Row: {
          id: string
          event_id: string | null
          tickets: number | null
          bar: number | null
          merchandise: number | null
          other: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          event_id?: string | null
          tickets?: number | null
          bar?: number | null
          merchandise?: number | null
          other?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string | null
          tickets?: number | null
          bar?: number | null
          merchandise?: number | null
          other?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      event_expenses: {
        Row: {
          id: string
          event_id: string | null
          artists: number | null
          staff: number | null
          marketing: number | null
          other: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          event_id?: string | null
          artists?: number | null
          staff?: number | null
          marketing?: number | null
          other?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string | null
          artists?: number | null
          staff?: number | null
          marketing?: number | null
          other?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      artists: {
        Row: {
          id: string
          name: string
          genre: string | null
          location: string | null
          email: string | null
          phone: string | null
          image: string | null
          bio: string | null
          last_performance: string | null
          next_performance: string | null
          status: string | null
          social_media: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          genre?: string | null
          location?: string | null
          email?: string | null
          phone?: string | null
          image?: string | null
          bio?: string | null
          last_performance?: string | null
          next_performance?: string | null
          status?: string | null
          social_media?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          genre?: string | null
          location?: string | null
          email?: string | null
          phone?: string | null
          image?: string | null
          bio?: string | null
          last_performance?: string | null
          next_performance?: string | null
          status?: string | null
          social_media?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      marketing_campaigns: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string | null
          platforms: string[] | null
          status: string | null
          event_id: string | null
          content: Json | null
          performance: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date?: string | null
          platforms?: string[] | null
          status?: string | null
          event_id?: string | null
          content?: Json | null
          performance?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string | null
          platforms?: string[] | null
          status?: string | null
          event_id?: string | null
          content?: Json | null
          performance?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          purchase_date: string | null
          purchaser_name: string | null
          purchaser_email: string | null
          price: number
          type: string | null
          status: string | null
          scanned_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          purchase_date?: string | null
          purchaser_name?: string | null
          purchaser_email?: string | null
          price: number
          type?: string | null
          status?: string | null
          scanned_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          purchase_date?: string | null
          purchaser_name?: string | null
          purchaser_email?: string | null
          price?: number
          type?: string | null
          status?: string | null
          scanned_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      financial_transactions: {
        Row: {
          id: string
          date: string
          description: string
          amount: number
          category: string
          type: string
          event_id: string | null
          artist_id: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          date: string
          description: string
          amount: number
          category: string
          type: string
          event_id?: string | null
          artist_id?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          date?: string
          description?: string
          amount?: number
          category?: string
          type?: string
          event_id?: string | null
          artist_id?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          type: string
          description: string | null
          content: string | null
          file_type: string | null
          file_size: number | null
          created_by: string | null
          created_at: string
          updated_at: string
          tags: string[]
          is_template: boolean
          related_entity_id: string | null
          related_entity_type: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          description?: string | null
          content?: string | null
          file_type?: string | null
          file_size?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          tags?: string[]
          is_template?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          description?: string | null
          content?: string | null
          file_type?: string | null
          file_size?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          tags?: string[]
          is_template?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          due_date: string | null
          assigned_to: string | null
          tags: string[]
          related_entity_id: string | null
          related_entity_type: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          assigned_to?: string | null
          tags?: string[]
          related_entity_id?: string | null
          related_entity_type?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          assigned_to?: string | null
          tags?: string[]
          related_entity_id?: string | null
          related_entity_type?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          notes: string | null
          birthday: string | null
          customer_since: string
          last_visit: string | null
          tags: string[]
          marketing_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          notes?: string | null
          birthday?: string | null
          customer_since?: string
          last_visit?: string | null
          tags?: string[]
          marketing_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          notes?: string | null
          birthday?: string | null
          customer_since?: string
          last_visit?: string | null
          tags?: string[]
          marketing_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      customer_interactions: {
        Row: {
          id: string
          customer_id: string
          type: string
          date: string
          description: string | null
          staff_member: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          type: string
          date?: string
          description?: string | null
          staff_member?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          type?: string
          date?: string
          description?: string | null
          staff_member?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          sku: string | null
          description: string | null
          category_id: string | null
          unit_price: number | null
          cost_price: number | null
          current_stock: number
          reorder_level: number
          vendor: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sku?: string | null
          description?: string | null
          category_id?: string | null
          unit_price?: number | null
          cost_price?: number | null
          current_stock?: number
          reorder_level?: number
          vendor?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sku?: string | null
          description?: string | null
          category_id?: string | null
          unit_price?: number | null
          cost_price?: number | null
          current_stock?: number
          reorder_level?: number
          vendor?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          item_id: string
          transaction_type: string
          quantity: number
          transaction_date: string
          notes: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          transaction_type: string
          quantity: number
          transaction_date?: string
          notes?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          transaction_type?: string
          quantity?: number
          transaction_date?: string
          notes?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          provider: string
          merchant_id: string | null
          access_token: string | null
          refresh_token: string | null
          token_expiry: string | null
          scope: string[] | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          provider: string
          merchant_id?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expiry?: string | null
          scope?: string[] | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          provider?: string
          merchant_id?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expiry?: string | null
          scope?: string[] | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}