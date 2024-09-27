import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { Product } from "../types/types";
import { setTimestamp, fetchDataFromCacheOrServer } from "./fetchDataFromCacheOrServer";

const collectionName = 'products';

export const addProduct = async (product: Product) => {
    const { id, ...addData } = product;  // ID属性が余分なので外す
    await addDoc(collection(db, collectionName), addData);
    await setTimestamp(collectionName);
};

/** Productを更新登録するサービス。updataDataの中にID属性を入れないように注意！ */
export const updateProduct = async (id: string, updateData: any) => {
    const productRef = doc(db, collectionName, id);  // ドキュメントIDを指定
    await updateDoc(productRef, updateData);
    await setTimestamp(collectionName);
};

export const deleteProduct = async (id: string) => {
    const productRef = doc(db, collectionName, id);
    await deleteDoc(productRef);
    await setTimestamp(collectionName);
};

/** 全ての商品データを取得する関数 */
export const getAllProducts = async (): Promise<Product[]> => {
    console.log("=== " + collectionName + " 全件取得 ===");
    // クエリの設定
    const q = query(collection(db, collectionName),
        orderBy('name', 'asc')
    );

    const allMaterials = await fetchDataFromCacheOrServer(collectionName, q) as Product[];
    return allMaterials;
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
