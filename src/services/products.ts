import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { Product } from "../types/types";


/** 指定したカテゴリの商品リストを取得する関数 */
export const getProductsByCategory = async (category: string) => {
    let q;
    if (category === "All") {
        q = collection(db, "products");
    } else {
        q = query(collection(db, "products"), where("category", "==", category));
    }

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }) as Product)
    return products;
};

export const getAllProducts = async () => {
    return getProductsByCategory("All");
};

export const addProduct = async (product: Product) => {
    const { id, ...addData } = product;  // ID属性が余分なので外す
    await addDoc(collection(db, 'products'), addData);
};

/** Productを更新登録するサービス。updataDataにID属性を入れないように注意！ */
export const updateProduct = async (id: string, updateData: any) => {
    const productRef = doc(db, 'products', id);  // ドキュメントIDを指定
    await updateDoc(productRef, updateData);
};

export const deleteProduct = async (id: string) => {
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
};
