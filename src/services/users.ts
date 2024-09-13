import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from './firebase';

const db = getFirestore(app);

/** ユーザーIDに基づいてユーザー情報を取得する関数 */
export const getUserById = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        return userDoc.data(); // ユーザーデータを返す
    } else {
        return null; // ユーザーが存在しない場合
    }
};
