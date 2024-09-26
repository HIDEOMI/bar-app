import { updateDoc, getDoc, doc, Timestamp } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';


export const setTimestamp = async (collectionName: string) => {
    const docRef = doc(db, 'updateTimestamp', collectionName);  // ドキュメントIDを指定
    await updateDoc(docRef, { lastUpdate: new Date() });
};

export const getLastUpdateTimestamp = async (collectionName: string) => {
    const docRef = doc(db, 'updateTimestamp', collectionName);  // ドキュメントIDを指定
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        // ドキュメントが存在する場合、データを返す
        console.log("ドキュメントデータ:", docSnap.data().lastUpdate);
        return docSnap.data().lastUpdate as Timestamp;  // データを返す
    } else {
        // ドキュメントが存在しない場合
        console.log("ドキュメントが見つかりませんでした");
        return null;
    };
};