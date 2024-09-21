import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, provider, db } from '../firebase/firebaseConfig';


/** Googleサインインの関数 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // ユーザー情報をFirestoreに保存
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            // 新規ユーザーの場合
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                isAdmin: false // デフォルトは一般ユーザー
            });
        }

        return user;
    } catch (error) {
        console.error("Error during sign in: ", error);
        throw error;
    }
};

/** サインアウトの関数 */
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error during sign out: ", error);
        throw error;
    }
};

/** 認証状態を監視する関数 */
export const onAuthStateChange = (callback: (user: any) => void) => {
    return onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};
