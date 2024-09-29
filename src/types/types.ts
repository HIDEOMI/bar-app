/** Userドキュメント */
export type User = {
    id: string;
    email: string;
    isFriend: boolean;
    displayName: string;
    bill?: number;  // 支払金額
};

/** 商品ドキュメント */
export type Product = {
    id: string;
    name: string;
    price: number;
    description: string;     // 商品の説明詳細
    summary: string;         // 商品の説明概要
    categories: string[];
    bases: string[];         // ベースになっているお酒
    color: string;
    alc: number;             // アルコール度数
    alc_taste: string;       // アルコール度数に対する階級
    already: string;         // 商品として提供可能な準備ができているかどうか
    isAvailable: boolean;    // 商品の在庫があるかどうか
    recipe: string;          // カクテルの作り方
    imageUrl: string;
    materials: MaterialInProduct[];  // 使っている材料
    method: string;          // どんな手法で作成するか
    recommendation: string;  // オススメかどうか
    tpo: string;             // 飲むのに適したタイミング
    glass: string;
    type: string;            // ロングかショートか
    word: string;            // カクテル言葉
    date: string;            // 対象の誕生日
};

/** 商品における必要な材料の型定義 */
export type MaterialInProduct = {
    id: string;
    name: string;
    quantity: number;  // 商品における必要な材料の量
    // isAvailable: boolean;  // 材料の在庫があるかどうか
};

/** 材料ドキュメント */
export type Material = {
    id: string;
    name: string;
    category: string;
    totalAmount: number;  // 単位に対する総量（例: 2本, 3個 など）
    unitCapacity: number;  // 単位当たりの容量（例: 1本あたり"500"ml など）
    unitPrice: number;  // 単価（例: 1本あたり"2000"円 など）
    note: string;
    url: string;
    teiban: string;
    already?: string;
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


/** 商品とその選択数 */
export type CartItem = {
    product: Product;
    quantity: number;
};

export type CachedUser = {
    displayName: string;
    timestamp: number;
};
