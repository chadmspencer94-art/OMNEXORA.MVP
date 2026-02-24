export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  list_id: string;
  user_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TodoList {
  id: string;
  name: string;
  user_id: string;
  share_token: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: Todo;
        Insert: {
          id?: string;
          text: string;
          completed?: boolean;
          list_id: string;
          user_id: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          completed?: boolean;
          list_id?: string;
          user_id?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      todo_lists: {
        Row: TodoList;
        Insert: {
          id?: string;
          name?: string;
          user_id: string;
          share_token?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          share_token?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
