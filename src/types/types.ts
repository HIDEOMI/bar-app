/** 商品ドキュメント */
export type Product = {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    isAvailable: boolean;  // 商品の在庫があるかどうか
    materials: MaterialInProduct[];
};

/** 商品における必要な材料の型定義 */
export type MaterialInProduct = {
    id: string;
    name: string;
    quantity: number;  // 商品における必要な材料の量
    isAvailable: boolean;  // 材料の在庫があるかどうか
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
    category: string;
    unit: string;
    totalAmount: number;  // 総量（例: 1000ml, 500g など）
    unitCapacity: number;  // 単位当たりの容量（例: 50mlごとに取り出す場合は50）
    note: string;
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
