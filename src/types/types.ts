export type Product = {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    // stock: number;
    materials: string[];
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
    userId: string;
};

export type Material = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
};
