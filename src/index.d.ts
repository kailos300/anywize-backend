declare type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  token: string;
  admin: boolean;
  active: boolean;
  updated_at: string;
  created_at: string;
};

declare type PublicUser = Omit<User, 'created_at' | 'updated_at' | 'password' | 'admin' | 'token'>;
