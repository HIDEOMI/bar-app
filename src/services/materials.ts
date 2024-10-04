import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { Material } from "../types/types";
import { setTimestamp, fetchDataFromCacheOrServer } from "./fetchDataFromCacheOrServer";

const collectionName = 'materials';

export const addMaterial = async (material: Material) => {
    const { id, ...addData } = material;  // ID属性が余分なので外す
    await addDoc(collection(db, collectionName), addData);
    await setTimestamp(collectionName);
};

/** Materialを更新登録するサービス。updataDataにID属性を入れないように注意！ */
export const updateMaterial = async (id: string, updatedData: any) => {
    const materialRef = doc(db, collectionName, id);
    await updateDoc(materialRef, updatedData);
    await setTimestamp(collectionName);
};

export const deleteMaterial = async (id: string) => {
    const materialRef = doc(db, collectionName, id);
    console.log(id);
    await deleteDoc(materialRef);
    await setTimestamp(collectionName);
};

export const getAllMaterials = async (): Promise<Material[]> => {
    console.log("=== " + collectionName + " 全件取得 ===");
    const q = query(collection(db, collectionName),
        orderBy('category', 'desc'),
        orderBy('name', 'asc')
    );

    const allMaterials = await fetchDataFromCacheOrServer(collectionName, q) as Material[];
    return allMaterials;
};

/** 指定したカテゴリの材料リストを取得する関数 (ローカルキャッシュ対応) */
export const getMaterialsByCategory = async (category: string): Promise<Material[]> => {
    console.log("対象カテゴリ：" + category);
    const allMaterials = await getAllMaterials();

    if (category === 'All') {
        return allMaterials;  // "All" を選んだ場合はすべての商品を表示
    } else {
        console.log("==== フィルター実行 ====");
        const filtered = allMaterials.filter((product) => product.category.includes(category));
        return filtered;
    }
};
