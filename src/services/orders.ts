import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import app from './firebase';

const db = getFirestore(app);

// 注文をFirestoreに保存する関数
export const createOrder = async (userId: string, products: any[], totalPrice: number) => {
  try {
    const docRef = await addDoc(collection(db, "orders"), {
      userId,
      products,
      totalPrice,
      status: "未処理",
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding order: ", error);
    throw error;
  }
};
