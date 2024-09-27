import { getDocsFromServer, Query, DocumentData } from "firebase/firestore";
import { getLastUpdateTimestamp } from "./updateTimestamp";


/** ローカル or サーバ からデータを取得する関数 */
export const fetchDataFromCacheOrServer = async (collectionName: string, query: Query<DocumentData, DocumentData>): Promise<object[]> => {
    // まずキャッシュからデータを取得
    try {
        /** キャッシュタイムアウトしている場合、問答無用でサーバから取得する */
        const CACHE_TIMEOUT = 12 * 60 * 60 * 1000;  // 12時間
        const cachedData = localStorage.getItem(collectionName);
        const cachedTime = localStorage.getItem(collectionName + 'CacheTime');
        const lastUpdateTime = await getLastUpdateTimestamp(collectionName) || 0;
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
        const serverQuerySnapshot = await getDocsFromServer(query);
        const serverData = serverQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }) as Object);
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
