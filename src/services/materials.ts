import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { Material } from "../types/types"
import { db } from '../firebase/firebaseConfig';


/** 指定したカテゴリの商品リストを取得する関数 */
export const getMaterialsByCategory = async (category: string) => {
    let q;
    if (category === "All") {
        q = collection(db, "materials");
    } else {
        q = query(collection(db, "materials"), where("category", "==", category));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }) as Material);
};

export const getAllMaterials = async () => {
    return getMaterialsByCategory("All");
};

export const addMaterial = async (material: Material) => {
    await addDoc(collection(db, 'materials'), {
        name: material.name,
        category: material.category,
        totalAmount: material.totalAmount,
        unit: material.unit,
        unitCapacity: material.unitCapacity,
        note: material.note,
        unitPrice: material.unitPrice,
    });
};

export const updateMaterial = async (id: string, updatedData: any) => {
    const materialRef = doc(db, 'materials', id);
    // console.log(materialRef);
    await updateDoc(materialRef, {
        name: updatedData.name,
        category: updatedData.category,
        totalAmount: updatedData.totalAmount,
        unit: updatedData.unit,
        unitCapacity: updatedData.unitCapacity,
        note: updatedData.note,
        unitPrice: updatedData.unitPrice,
    });
};

export const deleteMaterial = async (id: string) => {
    const materialRef = doc(db, 'materials', id);
    await deleteDoc(materialRef);
};
