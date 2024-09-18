import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';


/** 指定したカテゴリの商品リストを取得する関数 */
export const getProductsByCategory = async (category: string) => {
    let q;
    if (category === "all") {
        q = collection(db, "products");
    } else {
        q = query(collection(db, "products"), where("category", "==", category));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        description: doc.data().description,
        imageUrl: doc.data().imageUrl,
        isAvailable: doc.data().isAvailable,
    }));
};

export const getAllProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addProduct = async (product: any) => {
    await addDoc(collection(db, 'products'), product);
};

export const updateProduct = async (id: string, updatedData: any) => {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, updatedData);
};

export const deleteProduct = async (id: string) => {
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
};
