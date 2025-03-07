[?25l
    Select a project:                                                                                                      
                                                                                                                           
  >  1. ysvdpsvhyrljqkkrhmtt [name: supabase-orange-river, org: vercel_icfg_ccxkq1NMqLBybmR3FFFZFjn9, region: eu-central-1]
    2. pzazllvnmgurwjocfyrf [name: metalwit, org: vercel_icfg_ccxkq1NMqLBybmR3FFFZFjn9, region: eu-central-1]              
                                                                                                                           
                                                                                                                           
    ↑/k up • ↓/j down • / filter • q quit • ? more                                                                         
                                                                                                                           [0D[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[0D[2K [0D[2K[?25h[?1002l[?1003l[?1006lexport type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          City: string | null
          Company: string | null
          Country: string | null
          "Customer Id": string | null
          Email: string | null
          "First Name": string | null
          Index: number
          "Last Name": string | null
          "Phone 1": string | null
          "Phone 2": string | null
          "Subscription Date": string | null
          Website: string | null
        }
        Insert: {
          City?: string | null
          Company?: string | null
          Country?: string | null
          "Customer Id"?: string | null
          Email?: string | null
          "First Name"?: string | null
          Index: number
          "Last Name"?: string | null
          "Phone 1"?: string | null
          "Phone 2"?: string | null
          "Subscription Date"?: string | null
          Website?: string | null
        }
        Update: {
          City?: string | null
          Company?: string | null
          Country?: string | null
          "Customer Id"?: string | null
          Email?: string | null
          "First Name"?: string | null
          Index?: number
          "Last Name"?: string | null
          "Phone 1"?: string | null
          "Phone 2"?: string | null
          "Subscription Date"?: string | null
          Website?: string | null
        }
        Relationships: []
      }
      form_definitions: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          form_name: string
          id: string
          layout: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields: Json
          form_name: string
          id?: string
          layout?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          form_name?: string
          id?: string
          layout?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          id: number
          title: string | null
        }
        Insert: {
          id?: number
          title?: string | null
        }
        Update: {
          id?: number
          title?: string | null
        }
        Relationships: []
      }
      objects: {
        Row: {
          created_at: string
          id: number
          name: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          value?: Json
        }
        Relationships: []
      }
      organizations: {
        Row: {
          Country: string | null
          Description: string | null
          Founded: number | null
          Index: number
          Industry: string | null
          Name: string | null
          "Number of employees": number | null
          "Organization Id": string | null
          Website: string | null
        }
        Insert: {
          Country?: string | null
          Description?: string | null
          Founded?: number | null
          Index: number
          Industry?: string | null
          Name?: string | null
          "Number of employees"?: number | null
          "Organization Id"?: string | null
          Website?: string | null
        }
        Update: {
          Country?: string | null
          Description?: string | null
          Founded?: number | null
          Index?: number
          Industry?: string | null
          Name?: string | null
          "Number of employees"?: number | null
          "Organization Id"?: string | null
          Website?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          email: string | null
          id: number
          status: string | null
        }
        Insert: {
          amount?: number | null
          email?: string | null
          id?: number
          status?: string | null
        }
        Update: {
          amount?: number | null
          email?: string | null
          id?: number
          status?: string | null
        }
        Relationships: []
      }
      table_definitions: {
        Row: {
          columns: Json | null
          created_at: string
          description: string | null
          id: string
          name: string | null
          schema_name: string
          table_name: string
          updated_at: string
        }
        Insert: {
          columns?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          schema_name?: string
          table_name: string
          updated_at?: string
        }
        Update: {
          columns?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          schema_name?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
