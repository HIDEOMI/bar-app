import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import app from './firebase';

const db = getFirestore(app);

// 商品リストを取得する関数
export const getProductsByCategory = async (category: string) => {
    let q;
    if (category === "all") {
      q = collection(db, "products");
    } else {
      q = query(collection(db, "products"), where("category", "==", category));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  