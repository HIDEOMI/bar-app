import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import app from './firebase';

const db = getFirestore(app);

// 注文をFirestoreに保存する関数
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
