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

declare type PublicUser = Omit<User, 'created_at' | 'updated_at' | 'password' | 'admin' | 'token'> & {
  Supplier?: Pick<Supplier, 'name' | 'alias' | 'street' | 'street_number' | 'city' | 'zipcode' | 'country' | 'email' | 'phone'>;
};

declare type AddressAttributes = {
  street: string;
  street_number: string;
  city: string;
  zipcode: string;
  country: string;
};

declare type TransportAgent = {
  id: number;
  name: string;
  alias: string;
} & AddressAttributes;

declare type Supplier = {
  id: number;
  name: string;
  alias: string;
  email: string;
  phone: string;
  active: boolean;
  updated_at: string;
  created_at: string;
} & AddressAttributes;

declare type Tour = {
  id: number;
  supplier_id: number;
  transport_agent_id: number;
  name: string;
  description: string;
  active: boolean;
  updated_at: string;
  created_at: string;
};

declare type Customer = {
  id: number;
  supplier_id: number;
  tour_id: number;
  tour_position: number;
  name: string;
  alias: string;
  email: string;
  phone: string;
  sms_notifications: boolean;
  email_notifications: boolean;
  active: boolean;
  updated_at: string;
  created_at: string;
} & AddressAttributes;
