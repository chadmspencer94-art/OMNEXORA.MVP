export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  list_id: string;
}

export interface TodoList {
  id: string;
  user_id: string;
  name: string;
  share_token?: string;
  created_at: string;
  updated_at: string;
}

export interface ListShare {
  id: string;
  list_id: string;
  user_id?: string;
  permission: 'view' | 'edit';
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}
