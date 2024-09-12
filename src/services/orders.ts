import { getFirestore, collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";

import app from './firebase';

const db = getFirestore(app);

/** 注文をFirestoreに保存する関数 */
export const createOrder = async (userId: string, products: any[], totalPrice: number, note: string) => {
    try {
        const docRef = await addDoc(collection(db, "orders"), {
            userId,
            products,
            totalPrice,
            note, // 備考欄
            status: "未処理",
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding order: ", error);
        throw error;
    }
};

/** ユーザーの注文履歴を取得する関数 */
export const getOrdersByUserId = async (userId: string) => {
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          totalPrice: data.totalPrice,
          products: data.products || [],
          note: data.note || "",
          status: data.status || "未処理",
          createdAt: data.createdAt
        };
    });
};

/** 未払いの注文を取得する関数 */
export const getUnpaidOrdersByUserId = async (userId: string) => {
    const q = query(collection(db, "orders"), where("userId", "==", userId), where("status", "==", "未払い"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };