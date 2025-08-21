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
      exercise_sessions: {
        Row: {
          ended_at: string | null
          exercise_id: string | null
          id: string
          kcal_burned: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          exercise_id?: string | null
          id?: string
          kcal_burned?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          ended_at?: string | null
          exercise_id?: string | null
          id?: string
          kcal_burned?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string | null
          duration_min: number
          id: string
          kcal_est: number
          level: string | null
          muscles: string | null
          title: string
        }
        Insert: {
          category?: string | null
          duration_min: number
          id?: string
          kcal_est: number
          level?: string | null
          muscles?: string | null
          title: string
        }
        Update: {
          category?: string | null
          duration_min?: number
          id?: string
          kcal_est?: number
          level?: string | null
          muscles?: string | null
          title?: string
        }
        Relationships: []
      }
      hydration_logs: {
        Row: {
          amount_ml: number | null
          id: string
          ts: string | null
          user_id: string
        }
        Insert: {
          amount_ml?: number | null
          id?: string
          ts?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number | null
          id?: string
          ts?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meal_plan_items: {
        Row: {
          day_index: number | null
          id: string
          meal_plan_id: string
          meal_type: string | null
          recipe_id: string | null
        }
        Insert: {
          day_index?: number | null
          id?: string
          meal_plan_id: string
          meal_type?: string | null
          recipe_id?: string | null
        }
        Update: {
          day_index?: number | null
          id?: string
          meal_plan_id?: string
          meal_type?: string | null
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          daily_kcal: number
          end_date: string
          id: string
          meals_per_day: number | null
          start_date: string
          user_id: string
        }
        Insert: {
          daily_kcal: number
          end_date: string
          id?: string
          meals_per_day?: number | null
          start_date: string
          user_id: string
        }
        Update: {
          daily_kcal?: number
          end_date?: string
          id?: string
          meals_per_day?: number | null
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          avatar_url: string | null
          created_at: string | null
          goal: string | null
          height_cm: number | null
          id: string
          name: string | null
          role: string | null
          sex: string | null
          sleep_time: string | null
          wake_time: string | null
          water_goal_ml: number | null
          weight_kg: number | null
          work_hours: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          goal?: string | null
          height_cm?: number | null
          id: string
          name?: string | null
          role?: string | null
          sex?: string | null
          sleep_time?: string | null
          wake_time?: string | null
          water_goal_ml?: number | null
          weight_kg?: number | null
          work_hours?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          name?: string | null
          role?: string | null
          sex?: string | null
          sleep_time?: string | null
          wake_time?: string | null
          water_goal_ml?: number | null
          weight_kg?: number | null
          work_hours?: string | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_by: string | null
          duration_min: number | null
          id: string
          image_url: string | null
          ingredients: string
          instructions: string | null
          kcal: number
          meal_type: string
          title: string
        }
        Insert: {
          created_by?: string | null
          duration_min?: number | null
          id?: string
          image_url?: string | null
          ingredients: string
          instructions?: string | null
          kcal: number
          meal_type: string
          title: string
        }
        Update: {
          created_by?: string | null
          duration_min?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string
          instructions?: string | null
          kcal?: number
          meal_type?: string
          title?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          expires_at: string | null
          id: string
          product_id: string
          renewed_at: string | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          product_id: string
          renewed_at?: string | null
          started_at?: string | null
          status: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          product_id?: string
          renewed_at?: string | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
