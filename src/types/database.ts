export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Hand-written to match supabase/schema.sql. You can replace it with generated types:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          content: string;
          cover_image: string | null;
          category: string | null;
          author_id: string;
          author_name: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          content: string;
          cover_image?: string | null;
          category?: string | null;
          author_id: string;
          author_name?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          content?: string;
          cover_image?: string | null;
          category?: string | null;
          author_id?: string;
          author_name?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscribers: {
        Row: { id: string; email: string; created_at: string };
        Insert: { id?: string; email: string; created_at?: string };
        Update: { id?: string; email?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Post = Database["public"]["Tables"]["posts"]["Row"];
