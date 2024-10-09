import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { Material, Product } from "../types/types";
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
export const getFilteredProducts = async (status: string, materialNames?: string[]) => {
    console.log("対象ステータス：" + status);
    console.log("選択した材料：" + materialNames);
    const allProducts = await getAllProducts();
    const isAllMaterial = materialNames?.length === 0;

    // ステータスが'All'かつ、材料選択が無しの場合はすべての商品を表示
    if (status === 'All' && isAllMaterial) {
        return allProducts;
    }

    console.log("==== フィルタ実行 ====");
    // 材料選択が無し、ステータスが指定された場合
    if (isAllMaterial) {
        const filtered = allProducts.filter((product) => product.already === status);
        return filtered;
    }

    // ステータスが'All'、材料が指定された場合
    // 材料が全て含まれている商品を抽出
    // なお、材料のは量は15以上
    if (status === 'All') {
        const filtered = allProducts.filter((product) =>
            materialNames?.every(materialName => product.materials.some(m => m.name === materialName && m.quantity >= 15))
        );
        return filtered;
    }

    // ステータスと材料の両方が指定された場合
    const filtered = allProducts.filter((product) =>
        (product.already === status) && materialNames?.every(materialName => product.materials.some(m => m.name === materialName && m.quantity >= 15))
    );
    return filtered;
};

