export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  featured?: boolean;
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
