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
    console.log("=== firestoreに保存 ===");
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
export const getProductsByPage = async (products: Product[], page: number, countInPage: number) => {
    console.log("対象ページ：" + page);
    console.log("表示件数：" + countInPage);
    console.log("==== ページネーション実行 ====");
    const productsByPage = products.sort((a, b) => a.name.localeCompare(b.name)).slice(countInPage * (page - 1), countInPage * (page));
    return productsByPage;
};

/** 指定したカテゴリ, ステータスの商品リストを取得する関数 */
export const getFilteredProducts = async (category: string, status: string) => {
    console.log("対象カテゴリ：" + category);
    console.log("対象ステータス：" + status);
    const allProducts = await getAllProducts();

    // カテゴリもステータスも'All'の場合はすべての商品を表示
    if (category === 'All' && status === 'All') {
        return allProducts;
    }

    console.log("==== フィルタ実行 ====");
    // カテゴリが'All'かつ、ステータスが指定された場合
    if (category === 'All') {
        const filtered = allProducts.filter((product) => product.already === status);
        return filtered;
    }

    // ステータスが'All'かつ、カテゴリが指定された場合
    if (status === 'All') {
        const filtered = allProducts.filter((product) => product.bases.includes(category));
        return filtered;
    }

    // カテゴリとステータスの両方が指定された場合
    const filtered = allProducts.filter((product) =>
        (product.already === status) && product.bases.includes(category)
    );
    return filtered;
};
