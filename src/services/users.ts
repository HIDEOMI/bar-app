import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from './firebase';

const db = getFirestore(app);

export const getUserInfo = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
};
