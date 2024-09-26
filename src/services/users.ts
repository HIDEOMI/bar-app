import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { User } from "../types/types";


/** ユーザIDに基づいてユーザ情報を取得する関数 */
export const getUserDataById = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        const userData = {
            id: userId,
            ...userDoc.data(),
        } as User
        return userData; // ユーザーデータを返す
    } else {
        return null; // ユーザーが存在しない場合
    }
};

/** ユーザIDから管理者情報を取得する関数 */
export const iAmOwer = async (userId: string) => {
    const userRef = doc(db, "owners", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        return true; // 
    } else {
        return false; // ユーザーが存在しない場合
    }
}