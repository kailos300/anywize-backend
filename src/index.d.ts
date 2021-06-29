declare type User = {
  id: number;
  supplier_id: number;
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

declare type DepositAgreement = 'NONE' | 'BRING_KEY' | 'KEY_BOX';
declare type Customer = {
  id: number;
  supplier_id: number;
  tour_id: number;
  tour_position: number;
  number: string;
  name: string;
  alias: string;
  email: string;
  phone: string;
  sms_notifications: boolean;
  email_notifications: boolean;
  active: boolean;
  updated_at: string;
  created_at: string;
  coordinates: {
    type: 'Point';
    coordinates: [string, string];
  };
  latitude?: string;
  longitude?: string;
  deposit_agreement: DepositAgreement;
  keybox_code: string;
} & AddressAttributes;

declare type Order = {
  id: number;
  supplier_id: number;
  customer_id: number;
  route_id?: number;
  description: string;
  delivered_at: string;
  number: string;
};

declare type CustomerWithOrders = Omit<
  Customer, 'active' | 'created_at' | 'updated_at' | 'sms_notifications' | 'email_notifications' | 'supplier_id'
> & {
  Orders: Order[];
};

declare type Route = {
  id: number;
  tour_id: number;
  uuid: string;
  pathway: CustomerWithOrders[];
  start_date: string;
  end_date: string;
  code: string;
  password: string;
};

declare type Stop = {
  id: number;
  customer_id: number;
  signature_file: string;
  pictures: string[];
  route_id: number;
  time: string;
  customer_signed: boolean;
  location: any;
  meet_customer: boolean;
  reason: string;
  driver_name: string;
  goods_back: boolean;
};

declare type FullRoute = Route & {
  Tour: Tour & {
    TransportAgent: TransportAgent;
  };
  Orders: Pick<Order, 'id' | 'delivered_at'>[];
  Stops: Stop[];
  DriversLocations: any[];
};

declare type RouteForDriver = Omit<Route, 'pathway'> & {
  Tour: Pick<Tour, 'id', 'name', 'supplier_id', 'description'> & {
    TransportAgent: Pick<TransportAgent, 'id', 'name', 'alias'>;
  };
  pathway: CustomerWithOrders;
  original_pathway_length: number;
  current_pathway_index: number;
};