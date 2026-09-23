export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          new_data: Json | null
          old_data: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          content_json: Json
          id: string
          locale: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content_json?: Json
          id?: string
          locale?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content_json?: Json
          id?: string
          locale?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          currency: string
          id: string
          iso_code: string
          name: string
        }
        Insert: {
          currency: string
          id?: string
          iso_code: string
          name: string
        }
        Update: {
          currency?: string
          id?: string
          iso_code?: string
          name?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city: string
          country: string
          id: string
          yard_name: string
        }
        Insert: {
          city: string
          country: string
          id?: string
          yard_name: string
        }
        Update: {
          city?: string
          country?: string
          id?: string
          yard_name?: string
        }
        Relationships: []
      }
      makes: {
        Row: {
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          id: string
          make_id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          make_id: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          make_id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "makes"
            referencedColumns: ["id"]
          },
        ]
      }
      order_documents: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["order_document_kind"]
          order_id: string
          storage_path: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["order_document_kind"]
          order_id: string
          storage_path: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["order_document_kind"]
          order_id?: string
          storage_path?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancel_reason: string | null
          created_at: string
          id: string
          order_no: string
          quote_id: string | null
          reserved_until: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_usd: number
          user_id: string
          vehicle_id: string
        }
        Insert: {
          cancel_reason?: string | null
          created_at?: string
          id?: string
          order_no: string
          quote_id?: string | null
          reserved_until?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_usd: number
          user_id: string
          vehicle_id: string
        }
        Update: {
          cancel_reason?: string | null
          created_at?: string
          id?: string
          order_no?: string
          quote_id?: string | null
          reserved_until?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_usd?: number
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          proof_path: string | null
          reference: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["payment_status"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          order_id: string
          proof_path?: string | null
          reference?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          order_id?: string
          proof_path?: string | null
          reference?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ports: {
        Row: {
          active: boolean
          code: string
          country_id: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          code: string
          country_id: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          code?: string
          country_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ports_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          consignee_address: string | null
          consignee_city: string | null
          consignee_company: string | null
          consignee_country: string | null
          consignee_name: string | null
          consignee_phone: string | null
          country_code: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_currency: string
          preferred_language: string
          role: Database["public"]["Enums"]["user_role"]
          whatsapp: string | null
        }
        Insert: {
          consignee_address?: string | null
          consignee_city?: string | null
          consignee_company?: string | null
          consignee_country?: string | null
          consignee_name?: string | null
          consignee_phone?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_currency?: string
          preferred_language?: string
          role?: Database["public"]["Enums"]["user_role"]
          whatsapp?: string | null
        }
        Update: {
          consignee_address?: string | null
          consignee_city?: string | null
          consignee_company?: string | null
          consignee_country?: string | null
          consignee_name?: string | null
          consignee_phone?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_currency?: string
          preferred_language?: string
          role?: Database["public"]["Enums"]["user_role"]
          whatsapp?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          certificate: number
          created_at: string
          created_by: string | null
          discount: number
          expires_at: string | null
          freight: number
          id: string
          inquiry_id: string | null
          inspection: number
          insurance: number
          other_fees: number
          status: Database["public"]["Enums"]["quote_status"]
          total_usd: number
          user_id: string | null
          vehicle_id: string
          vehicle_price: number
        }
        Insert: {
          certificate?: number
          created_at?: string
          created_by?: string | null
          discount?: number
          expires_at?: string | null
          freight?: number
          id?: string
          inquiry_id?: string | null
          inspection?: number
          insurance?: number
          other_fees?: number
          status?: Database["public"]["Enums"]["quote_status"]
          total_usd: number
          user_id?: string | null
          vehicle_id: string
          vehicle_price: number
        }
        Update: {
          certificate?: number
          created_at?: string
          created_by?: string | null
          discount?: number
          expires_at?: string | null
          freight?: number
          id?: string
          inquiry_id?: string | null
          inspection?: number
          insurance?: number
          other_fees?: number
          status?: Database["public"]["Enums"]["quote_status"]
          total_usd?: number
          user_id?: string | null
          vehicle_id?: string
          vehicle_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          email_alerts: boolean
          filters_json: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_alerts?: boolean
          filters_json?: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_alerts?: boolean
          filters_json?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          booking_no: string | null
          carrier: string | null
          created_at: string
          destination_port: string | null
          eta: string | null
          etd: string | null
          id: string
          order_id: string
          origin_port: string | null
          status: Database["public"]["Enums"]["shipment_status"]
          tracking_url: string | null
          vessel_name: string | null
          voyage_no: string | null
        }
        Insert: {
          booking_no?: string | null
          carrier?: string | null
          created_at?: string
          destination_port?: string | null
          eta?: string | null
          etd?: string | null
          id?: string
          order_id: string
          origin_port?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_url?: string | null
          vessel_name?: string | null
          voyage_no?: string | null
        }
        Update: {
          booking_no?: string | null
          carrier?: string | null
          created_at?: string
          destination_port?: string | null
          eta?: string | null
          etd?: string | null
          id?: string
          order_id?: string
          origin_port?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_url?: string | null
          vessel_name?: string | null
          voyage_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_rates: {
        Row: {
          active: boolean
          base_cost_usd: number
          category: string | null
          certificate_fee_usd: number | null
          destination_port_id: string
          effective_from: string
          effective_to: string | null
          id: string
          inspection_fee_usd: number | null
          insurance_rate: number | null
          local_export_fee_usd: number | null
          m3_rate: number | null
          method: Database["public"]["Enums"]["shipping_method"]
          origin_location_id: string
        }
        Insert: {
          active?: boolean
          base_cost_usd: number
          category?: string | null
          certificate_fee_usd?: number | null
          destination_port_id: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          inspection_fee_usd?: number | null
          insurance_rate?: number | null
          local_export_fee_usd?: number | null
          m3_rate?: number | null
          method: Database["public"]["Enums"]["shipping_method"]
          origin_location_id: string
        }
        Update: {
          active?: boolean
          base_cost_usd?: number
          category?: string | null
          certificate_fee_usd?: number | null
          destination_port_id?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          inspection_fee_usd?: number | null
          insurance_rate?: number | null
          local_export_fee_usd?: number | null
          m3_rate?: number | null
          method?: Database["public"]["Enums"]["shipping_method"]
          origin_location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_rates_destination_port_id_fkey"
            columns: ["destination_port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_rates_origin_location_id_fkey"
            columns: ["origin_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          value_json: Json
        }
        Insert: {
          key: string
          value_json?: Json
        }
        Update: {
          key?: string
          value_json?: Json
        }
        Relationships: []
      }
      vehicle_features: {
        Row: {
          feature_key: string
          feature_value: string | null
          id: string
          vehicle_id: string
        }
        Insert: {
          feature_key: string
          feature_value?: string | null
          id?: string
          vehicle_id: string
        }
        Update: {
          feature_key?: string
          feature_value?: string | null
          id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_features_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean
          public_url: string
          sort_order: number
          storage_path: string
          vehicle_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          public_url: string
          sort_order?: number
          storage_path: string
          vehicle_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          public_url?: string
          sort_order?: number
          storage_path?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_type: Database["public"]["Enums"]["body_type"]
          chassis_no_private: string | null
          color: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          doors: number | null
          drive_type: Database["public"]["Enums"]["drive_type"]
          engine_cc: number | null
          featured: boolean
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          height_mm: number | null
          id: string
          length_mm: number | null
          location_id: string | null
          make_id: string
          mileage_km: number
          model_id: string
          month: number | null
          price_usd: number
          published: boolean
          ref_no: string
          sale_price_usd: number | null
          seats: number | null
          status: Database["public"]["Enums"]["vehicle_status"]
          steering_side: Database["public"]["Enums"]["steering_side"]
          transmission: Database["public"]["Enums"]["transmission_type"]
          trim: string | null
          updated_at: string
          vin_private: string | null
          weight_kg: number | null
          width_mm: number | null
          year: number
        }
        Insert: {
          body_type: Database["public"]["Enums"]["body_type"]
          chassis_no_private?: string | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          doors?: number | null
          drive_type: Database["public"]["Enums"]["drive_type"]
          engine_cc?: number | null
          featured?: boolean
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          height_mm?: number | null
          id?: string
          length_mm?: number | null
          location_id?: string | null
          make_id: string
          mileage_km: number
          model_id: string
          month?: number | null
          price_usd: number
          published?: boolean
          ref_no: string
          sale_price_usd?: number | null
          seats?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          steering_side: Database["public"]["Enums"]["steering_side"]
          transmission: Database["public"]["Enums"]["transmission_type"]
          trim?: string | null
          updated_at?: string
          vin_private?: string | null
          weight_kg?: number | null
          width_mm?: number | null
          year: number
        }
        Update: {
          body_type?: Database["public"]["Enums"]["body_type"]
          chassis_no_private?: string | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          doors?: number | null
          drive_type?: Database["public"]["Enums"]["drive_type"]
          engine_cc?: number | null
          featured?: boolean
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          height_mm?: number | null
          id?: string
          length_mm?: number | null
          location_id?: string | null
          make_id?: string
          mileage_km?: number
          model_id?: string
          month?: number | null
          price_usd?: number
          published?: boolean
          ref_no?: string
          sale_price_usd?: number | null
          seats?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          steering_side?: Database["public"]["Enums"]["steering_side"]
          transmission?: Database["public"]["Enums"]["transmission_type"]
          trim?: string | null
          updated_at?: string
          vin_private?: string | null
          weight_kg?: number | null
          width_mm?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "makes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dashboard_metrics: { Args: never; Returns: Json }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      body_type:
        | "suv"
        | "sedan"
        | "van"
        | "truck"
        | "bus"
        | "hatchback"
        | "coupe"
        | "wagon"
        | "pickup"
        | "machinery"
      drive_type: "fwd" | "rwd" | "awd" | "4wd"
      fuel_type: "petrol" | "diesel" | "hybrid" | "electric" | "lpg"
      inquiry_status: "new" | "assigned" | "quoted" | "closed"
      order_document_kind:
        | "bill_of_lading"
        | "export_certificate"
        | "invoice"
        | "inspection_certificate"
        | "other"
      order_status:
        | "reserved"
        | "awaiting_payment"
        | "paid"
        | "preparing_export"
        | "booked_shipping"
        | "shipped"
        | "arrived"
        | "completed"
        | "cancelled"
      payment_method: "bank_transfer"
      payment_status: "pending" | "verified" | "rejected"
      quote_status: "draft" | "sent" | "accepted" | "expired" | "cancelled"
      shipment_status: "booked" | "in_transit" | "arrived" | "released"
      shipping_method: "roro" | "container" | "shared_container"
      steering_side: "left" | "right"
      transmission_type: "manual" | "automatic" | "cvt"
      user_role: "admin" | "sales" | "inventory_manager" | "client"
      vehicle_status: "available" | "reserved" | "sold" | "in_transit"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      body_type: [
        "suv",
        "sedan",
        "van",
        "truck",
        "bus",
        "hatchback",
        "coupe",
        "wagon",
        "pickup",
        "machinery",
      ],
      drive_type: ["fwd", "rwd", "awd", "4wd"],
      fuel_type: ["petrol", "diesel", "hybrid", "electric", "lpg"],
      inquiry_status: ["new", "assigned", "quoted", "closed"],
      order_document_kind: [
        "bill_of_lading",
        "export_certificate",
        "invoice",
        "inspection_certificate",
        "other",
      ],
      order_status: [
        "reserved",
        "awaiting_payment",
        "paid",
        "preparing_export",
        "booked_shipping",
        "shipped",
        "arrived",
        "completed",
        "cancelled",
      ],
      payment_method: ["bank_transfer"],
      payment_status: ["pending", "verified", "rejected"],
      quote_status: ["draft", "sent", "accepted", "expired", "cancelled"],
      shipment_status: ["booked", "in_transit", "arrived", "released"],
      shipping_method: ["roro", "container", "shared_container"],
      steering_side: ["left", "right"],
      transmission_type: ["manual", "automatic", "cvt"],
      user_role: ["admin", "sales", "inventory_manager", "client"],
      vehicle_status: ["available", "reserved", "sold", "in_transit"],
    },
  },
} as const

