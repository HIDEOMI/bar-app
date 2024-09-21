import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { Material } from "../types/types"


/** 指定したカテゴリの商品リストを取得する関数 */
export const getMaterialsByCategory = async (category: string) => {
    console.log("=== リクエスト：getMaterialsByCategory() ===");
    let q;
    if (category === "All") {
        q = query(collection(db, "materials"),
            orderBy('category', 'asc'),
            orderBy('name', 'asc')
        );
    } else {
        q = query(collection(db, "materials"),
            where("category", "==", category),
            orderBy('name', 'asc')
        );
    }

    const querySnapshot = await getDocs(q);
    const materials = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }) as Material)
    return materials;
};

export const getAllMaterials = async () => {
    return getMaterialsByCategory("All");
};

export const addMaterial = async (material: Material) => {
    const { id, ...addData } = material;  // ID属性が余分なので外す
    await addDoc(collection(db, 'materials'), addData);
};

/** Materialを更新登録するサービス。updataDataにID属性を入れないように注意！ */
export const updateMaterial = async (id: string, updatedData: any) => {
    const materialRef = doc(db, 'materials', id);
    await updateDoc(materialRef, updatedData);
};

export const deleteMaterial = async (id: string) => {
    const materialRef = doc(db, 'materials', id);
    await deleteDoc(materialRef);
};
