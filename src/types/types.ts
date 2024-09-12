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