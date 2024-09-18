import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Material } from "../types/types"
import { db } from '../firebase/firebaseConfig';


export const getMaterials = async (): Promise<Material[]> => {
    const querySnapshot = await getDocs(collection(db, 'materials'));
    return querySnapshot.docs.map(doc => {
        const data = doc.data();

        return {
            id: doc.id,
            name: data.name,
            quantity: data.quantity,
            unit: data.unit,
        } as Material;
    });
};

export const addMaterial = async (material: any) => {
    await addDoc(collection(db, 'materials'), material);
};

export const updateMaterial = async (id: string, updatedData: any) => {
    const materialRef = doc(db, 'materials', id);
    await updateDoc(materialRef, updatedData);
};

export const deleteMaterial = async (id: string) => {
    const materialRef = doc(db, 'materials', id);
    await deleteDoc(materialRef);
};
