import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { Material } from "../types/types";
import { setTimestamp } from "./updateTimestamp";
import { fetchDataFromCacheOrServer } from "./fetchDataFromCacheOrServer";


export const addMaterial = async (material: Material) => {
    const { id, ...addData } = material;  // ID属性が余分なので外す
    await addDoc(collection(db, 'materials'), addData);
    await setTimestamp("materials");
};

/** Materialを更新登録するサービス。updataDataにID属性を入れないように注意！ */
export const updateMaterial = async (id: string, updatedData: any) => {
    const materialRef = doc(db, 'materials', id);
    await updateDoc(materialRef, updatedData);
    await setTimestamp("materials");
};

export const deleteMaterial = async (id: string) => {
    const materialRef = doc(db, 'materials', id);
    console.log(id);
    await deleteDoc(materialRef);
    await setTimestamp("materials");
};

export const getAllMaterials = async (): Promise<Material[]> => {
    console.log("=== Materials 全件取得 ===");
    const q = query(collection(db, "materials"),
        orderBy('category', 'desc'),
        orderBy('name', 'asc')
    );

    const allMaterials = await fetchDataFromCacheOrServer("materials", q) as Material[];
    return allMaterials;
};

/** 指定したカテゴリの材料リストを取得する関数 (ローカルキャッシュ対応) */
export const getMaterialsByCategory = async (category: string): Promise<Material[]> => {
    console.log("対象カテゴリ：" + category);
    const allMaterials = await getAllMaterials();

    if (category === 'All') {
        return allMaterials;  // "All" を選んだ場合はすべての商品を表示
    } else {
        console.log("==== ソート実行 ====");
        const filtered = allMaterials.filter((product) => product.category.includes(category));
        return filtered;
    }
};
