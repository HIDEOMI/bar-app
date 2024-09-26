import { collection, getDocsFromServer, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { Product } from "../types/types";
import { setTimestamp, getLastUpdateTimestamp } from "./updateTimestamp";


export const addProduct = async (product: Product) => {
    const { id, ...addData } = product;  // ID属性が余分なので外す
    await addDoc(collection(db, 'products'), addData);
    await setTimestamp("products");
};

/** Productを更新登録するサービス。updataDataの中にID属性を入れないように注意！ */
export const updateProduct = async (id: string, updateData: any) => {
    const productRef = doc(db, 'products', id);  // ドキュメントIDを指定
    await updateDoc(productRef, updateData);
    await setTimestamp("products");
};

export const deleteProduct = async (id: string) => {
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
    await setTimestamp("products");
};

/** 全ての商品データを取得する関数 */
export const getAllProducts = async (): Promise<Product[]> => {
    console.log("=== Produtcs 全件取得 ===");
    // クエリの設定
    const q = query(collection(db, "products"),
        orderBy('name', 'asc')
    );

    // まずキャッシュからデータを取得
    try {
        /** キャッシュタイムアウトしている場合、問答無用でサーバから取得する */
        const CACHE_TIMEOUT = 12 * 60 * 60 * 1000;  // 12時間
        const cachedData = localStorage.getItem('products');
        const cachedTime = localStorage.getItem('productsCacheTime');
        const lastUpdateTime = await getLastUpdateTimestamp('products') || 0;
        if (cachedData
            && cachedTime
            && (Date.now() - parseInt(cachedTime) < CACHE_TIMEOUT)
            && (lastUpdateTime !== 0 && parseInt(cachedTime) > lastUpdateTime.toMillis())
        ) {
            console.log("キャッシュが有効です。");
            return JSON.parse(cachedData);  // キャッシュデータをそのまま返す   
        }
    } catch (cacheError) {
        console.warn("キャッシュからの取得に失敗:", cacheError);
    }

    // キャッシュがない場合、サーバーからデータを取得
    try {
        console.log("サーバーからデータを取得中...");
        const serverQuerySnapshot = await getDocsFromServer(q);
        const serverData = serverQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }) as Product);
        console.log("サーバーデータを取得しました。");
        // キャッシュを更新
        localStorage.setItem('products', JSON.stringify(serverData));
        localStorage.setItem('productsCacheTime', Date.now().toString());
        return serverData;
    } catch (serverError) {
        console.error("サーバーからの取得に失敗:", serverError);
        throw serverError;
    }
};

/** ページネーションで商品データを取得する関数 */
export const getProductsByPage = async (page: number, countInPage: number) => {
    console.log("対象ページ：" + page);
    console.log("表示件数：" + countInPage);
    const allProducts = await getAllProducts();
    console.log("==== ページネーション実行 ====");
    const productsByPage = allProducts.sort((a, b) => a.name.localeCompare(b.name)).slice(countInPage * (page - 1), countInPage * (page));
    return productsByPage;
};

/** 指定したカテゴリの商品リストを取得する関数 */
export const getProductsByCategory = async (category: string) => {
    console.log("対象カテゴリ：" + category);
    const allProducts = await getAllProducts();

    if (category === 'All') {
        return allProducts;  // "All" を選んだ場合はすべての商品を表示
    } else {
        console.log("==== ソート実行 ====");
        const filtered = allProducts.filter((product) => product.bases.includes(category));
        return filtered;
    }
};
