import { collection, getDocs, addDoc, updateDoc, doc, Timestamp, query, where, orderBy } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { Order } from "../types/types";


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

/** すべての注文を取得する関数 */
export const getAllOrders = async () => {
    const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(ordersQuery);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
        } as Order;
    });
};

/** ユーザーの注文履歴を取得する関数 */
export const getOrdersByUserId = async (userId: string) => {
    const ordersQuery = query(
        collection(db, 'orders'),
        where("userId", "==", userId),
        orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(ordersQuery);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
        } as Order;
    });
};

/** 未払いの注文を取得する関数 */
export const getUnpaidOrdersByUserId = async (userId: string) => {
    const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        where("status", "==", "未払い"),
        // orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
        } as Order;
    });
};

/** 注文の状態を更新する関数 */
export const updateOrderStatus = async (orderId: string, status: string) => {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status });
};
