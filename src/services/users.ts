import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { User, CachedUser } from "../types/types";


const CACHE_EXPIRATION_TIME = 10 * 60 * 1000;  // キャッシュの有効期限を10分（600000ミリ秒）に設定
const MAX_CACHE_SIZE = 100;  // キャッシュの最大サイズを100エントリに制限

/** ローカルストレージからユーザキャッシュを取得する関数 */
const loadUserCacheFromLocalStorage = (): { [key: string]: CachedUser } => {
    const cache = localStorage.getItem('usersCache');
    // console.log(cache);
    return cache ? JSON.parse(cache) : {};
};

/** ローカルストレージにキャッシュを保存する関数 */
const saveCacheToLocalStorage = (cache: { [key: string]: CachedUser }) => {
    localStorage.setItem('userCache', JSON.stringify(cache));
};

/** キャッシュのサイズを制限する関数 */
const enforceCacheSizeLimit = (cache: { [key: string]: CachedUser }): { [key: string]: CachedUser } => {
    const keys = Object.keys(cache);
    if (keys.length > MAX_CACHE_SIZE) {
        // 古いキャッシュデータを削除
        const sortedKeys = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
        const keysToRemove = sortedKeys.slice(0, keys.length - MAX_CACHE_SIZE);
        for (const key of keysToRemove) {
            delete cache[key];
        }
    }
    return cache;
};

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
}

export const getUserNameFrom = async (userId: string): Promise<string> => {
    const currentTime = Date.now();
    const usersCache = loadUserCacheFromLocalStorage();
    const cachedUser = usersCache[userId];

    // キャッシュが有効であればキャッシュを使用
    if (cachedUser && currentTime - cachedUser.timestamp < CACHE_EXPIRATION_TIME) {
        return cachedUser.displayName;
    } else {
        // Firestoreからユーザー情報を取得
        const user = await getUserDataById(userId);
        const displayName = user?.displayName || "不明なユーザー";

        // キャッシュを更新
        const newCache = {
            ...usersCache,
            [userId]: { displayName, timestamp: currentTime }
        };
        saveCacheToLocalStorage(enforceCacheSizeLimit(newCache));

        return displayName;
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
