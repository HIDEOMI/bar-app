import { collection, getDocsFromServer, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { Material } from "../types/types";
import { setTimestamp, getLastUpdateTimestamp } from "./updateTimestamp";


export const addMaterial = async (material: Material) => {
    const { id, ...addData } = material;  // ID属性が余分なので外す
    await addDoc(collection(db, 'materials'), addData);
    await setTimestamp("materials");
};

/** Materialを更新登録するサービス。updataDataにID属性を入れないように注意！ */
export const updateMaterial = async (id: string, updatedData: any) => {
    const materialRef = doc(db, 'materials', id);
    await updateDoc(materialRef, updatedData);
    await setTimestamp("materials");
};

export const deleteMaterial = async (id: string) => {
    const materialRef = doc(db, 'materials', id);
    console.log(id);
    await deleteDoc(materialRef);
    await setTimestamp("materials");
};

export const getAllMaterials = async (): Promise<Material[]> => {
    console.log("=== Materials 全件取得 ===");
    // クエリの設定
    const q = query(collection(db, "materials"),
        orderBy('category', 'desc'),
        orderBy('name', 'asc')
    );

    // まずキャッシュからデータを取得
    try {
        /** キャッシュタイムアウトしている場合、問答無用でサーバから取得する */
        const CACHE_TIMEOUT = 12 * 60 * 60 * 1000;  // 12時間
        const cachedData = localStorage.getItem('materials');
        const cachedTime = localStorage.getItem('materialsCacheTime');
        const lastUpdateTime = await getLastUpdateTimestamp('materials') || 0;
        if (cachedData
            && cachedTime
            && (Date.now() - parseInt(cachedTime) < CACHE_TIMEOUT)
            && (lastUpdateTime !== 0 && parseInt(cachedTime) > lastUpdateTime.toMillis())
        ) {
            console.log("キャッシュが有効です。");
            return JSON.parse(cachedData);  // キャッシュデータをそのまま返す   
        }
    } catch (cacheError) {
        console.warn("キャッシュからの取得に失敗:", cacheError);
    }

    // キャッシュがない場合、サーバーからデータを取得
    try {
        console.log("サーバーからデータを取得中...");
        const serverQuerySnapshot = await getDocsFromServer(q);
        const serverData = serverQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }) as Material);
        console.log("サーバーデータを取得しました。");
        // キャッシュを更新
        localStorage.setItem('materials', JSON.stringify(serverData));
        localStorage.setItem('materialsCacheTime', Date.now().toString());
        return serverData;
    } catch (serverError) {
        console.error("サーバーからの取得に失敗:", serverError);
        throw serverError;
    }
};

/** 指定したカテゴリの材料リストを取得する関数 (ローカルキャッシュ対応) */
export const getMaterialsByCategory = async (category: string): Promise<Material[]> => {
    console.log("対象カテゴリ：" + category);
    const allMaterials = await getAllMaterials();

    if (category === 'All') {
        return allMaterials;  // "All" を選んだ場合はすべての商品を表示
    } else {
        console.log("==== ソート実行 ====");
        const filtered = allMaterials.filter((product) => product.category.includes(category));
        return filtered;
    }
};
