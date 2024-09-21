import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { Product } from "../types/types";


/** ページネーションで商品データを取得 */
export const getProductsByPage = async (lastVisibleDoc = null) => {
    const productsQuery = lastVisibleDoc
        ? query(collection(db, 'products'), orderBy('name'), startAfter(lastVisibleDoc), limit(10))
        : query(collection(db, 'products'), orderBy('name'), limit(10));

    const querySnapshot = await getDocs(productsQuery);
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];  // 最後のドキュメントを取得
    const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }) as Product);

    return { products, lastVisible };
};

/** 指定したカテゴリの商品リストを取得する関数 */
export const getProductsByCategory = async (category: string) => {
    console.log("=== リクエスト：getProductsByCategory() ===");
    let q;
    if (category === "All") {
        q = query(collection(db, "products"),
            orderBy('name', 'asc')
        );
    } else {
        q = query(collection(db, "products"),
            where("category", "==", category),
            orderBy('name', 'asc')
        );
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
