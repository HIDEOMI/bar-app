import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { User } from "../types/types";


/** ユーザーIDに基づいてユーザー情報を取得する関数 */
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

export