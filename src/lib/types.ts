
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  featured?: boolean;
  stock?: number;
};

export type Category = {
  id: string;
  name: "Sunscreens" | "Cleansers" | "Moisturizers" | "Serums";
  imageUrl: string;
  dataAiHint: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type AppUser = {
  email: string;
  isAdmin?: boolean;
};

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Paid';

export type Order = {
  id: string; // This is the Firebase push() key
  orderNumber: string; // This is the user-facing random ID
  customer: {
    name: string;
    phone: string;
    address: string;
    userId: string;
    idFrontUrl?: string;
    idBackUrl?: string;
  };
  items: CartItem[];
  total: number;
  paymentMethod: 'wave' | 'cod';
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: number;
};
