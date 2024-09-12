export type Product = {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    stock: number;
};

export type CartItem = {
    product: Product;
    quantity: number;
};

export type Order = {
    id: string;
    totalPrice: number;
    products: {
      productId: string;
      name: string;
      quantity: number;
      price: number;
    }[];
    note: string;
    status: string;
    createdAt: any; // Timestamp型
  };
  