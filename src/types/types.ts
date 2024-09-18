/** 商品ドキュメント */
export type Product = {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    // stock: number;
    materials: string[];
};

/** 注文ドキュメント */
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

/** 材料ドキュメント */
export type Material = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
};

/** 商品とその選択数 */
export type CartItem = {
    product: Product;
    quantity: number;
};

export type CachedUser = {
    displayName: string;
    timestamp: number;
};
