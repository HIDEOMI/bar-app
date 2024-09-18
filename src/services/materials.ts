import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Material } from "../types/types"
import { db } from '../firebase/firebaseConfig';


export const getMaterials = async (): Promise<Material[]> => {
    const querySnapshot = await getDocs(collection(db, 'materials'));
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const material: Material = {
            id: doc.id,
            name: data.name,
            category: data.category,
            totalAmount: data.totalAmount,
            unit: data.unit,
            unitCapacity: data.unitCapacity,
            note: data.note,
            unitPrice: data.unitPrice,
        };
        return material;
    });
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
