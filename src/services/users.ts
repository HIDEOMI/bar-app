import { collection, getDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { User, CachedUser } from "../types/types";
import { setTimestamp, fetchDataFromCacheOrServer } from "./fetchDataFromCacheOrServer";

const collectionName = 'users';

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


/** Userを更新登録するサービス。updataDataの中にID属性を入れないように注意！ */
export const updateUser = async (id: string, updateData: any) => {
    console.log("=== firestoreに保存 ===");
    const productRef = doc(db, collectionName, id);  // ドキュメントIDを指定
    await updateDoc(productRef, updateData);
    await setTimestamp(collectionName);
};

export const deleteUser = async (id: string) => {
    const productRef = doc(db, collectionName, id);
    await deleteDoc(productRef);
    await setTimestamp(collectionName);
};


export const getAllUsers = async (): Promise<User[]> => {
    console.log("=== " + collectionName + " 全件取得 ===");
    const q = query(collection(db, collectionName),
        orderBy('displayName', 'asc')
    );

    const allUsers = await fetchDataFromCacheOrServer(collectionName, q) as User[];
    return allUsers;
};

/** 指定したRoleのUserリストを取得する関数 */
export const getUsersByRole = async (role: string) => {
    console.log("対象Role：" + role);
    const allUsers = await getAllUsers();

    if (role === 'All') {
        return allUsers;  // "All" を選んだ場合はすべての商品を表示
    }

    console.log("==== フィルタ実行 ====");
    if (role === "未承認") {
        const filtered = allUsers.filter((user) => user.role === "");
        return filtered;
    }

    const filtered = allUsers.filter((user) => user.role === role);
    return filtered;
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
