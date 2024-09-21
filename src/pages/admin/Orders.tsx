import React, { useEffect, useState } from 'react';
import { Order, CachedUser } from "../../types/types";
import { getAllOrders, updateOrderStatus } from '../../services/orders';
import { getUserDataById } from '../../services/users';


const CACHE_EXPIRATION_TIME = 10 * 60 * 1000;  // キャッシュの有効期限を10分（600000ミリ秒）に設定
const MAX_CACHE_SIZE = 100;  // キャッシュの最大サイズを100エントリに制限

/** ローカルストレージからキャッシュを取得する関数 */
const loadCacheFromLocalStorage = (): { [key: string]: CachedUser } => {
    const cache = localStorage.getItem('userCache');
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


const Orders: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [userNames, setUserNames] = useState<{ [key: string]: string }>({}); // userId に対する displayName
    const [userCache, setUserCache] = useState<{ [key: string]: CachedUser }>(loadCacheFromLocalStorage()); // ローカルストレージからキャッシュを読み込む
    const [selectedStatus, setSelectedStatus] = useState<string>("未処理");  // デフォルトは全て

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await getAllOrders();
                setOrders(data);
                const currentTime = Date.now();
                // 各注文のユーザー情報を取得
                const userNameMap: { [key: string]: string } = {};

                for (const order of data) {
                    if (userCache[order.userId]) {
                        const cachedUser = userCache[order.userId];

                        // キャッシュの有効期限が切れていない場合はキャッシュを使用
                        if (currentTime - cachedUser.timestamp < CACHE_EXPIRATION_TIME) {
                            userNameMap[order.userId] = cachedUser.displayName;
                        } else {
                            // 有効期限が切れている場合は再度Firestoreから取得
                            const user = await getUserDataById(order.userId);
                            if (user) {
                                const displayName = user.displayName || "不明なユーザー";
                                const newCache = { ...userCache, [order.userId]: { displayName, timestamp: currentTime } };
                                setUserCache(enforceCacheSizeLimit(newCache)); // キャッシュを更新し、サイズを制限
                                userNameMap[order.userId] = displayName;
                            }
                        }
                    } else {
                        // キャッシュに存在しない場合はFirestoreから取得
                        const user = await getUserDataById(order.userId);
                        if (user) {
                            const displayName = user.displayName || "不明なユーザー";
                            const newCache = { ...userCache, [order.userId]: { displayName, timestamp: currentTime } };
                            setUserCache(enforceCacheSizeLimit(newCache)); // 新しくキャッシュに保存し、サイズを制限
                            userNameMap[order.userId] = displayName;
                        } else {
                            userNameMap[order.userId] = "不明なユーザー";
                        }
                    }
                }
                setUserNames(userNameMap);
            } catch (error) {
                console.error("Error fetching datas: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
        // キャッシュが更新されたらローカルストレージに保存
        saveCacheToLocalStorage(userCache);
    }, [userCache]);


    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            const data = await getAllOrders();
            setOrders(data);  // ステータス更新後に注文データを再取得
        } catch (error) {
            console.error("注文の状態を更新できませんでした: ", error);
        }
    };


    /** フィルタリングされた注文を取得 */
    const filteredOrders = selectedStatus === "全て"
        ? orders
        : orders.filter(order => order.status === selectedStatus);

    return (
        <div>
            <h1>注文確認</h1>
            {/* 状態フィルタのドロップダウン */}
            <label>注文状態フィルタ: </label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="全て">全て</option>
                <option value="未処理">未処理</option>
                <option value="未払い">未払い</option>
                <option value="完了">完了</option>
            </select>

            {loading ? (
                <p>読み込み中...</p>
            ) : (
                <div>
                    {filteredOrders.length === 0 ? (
                        <p>該当する注文がありません。</p>
                    ) : (
                        <ul>
                            {filteredOrders.map(order => (
                                <li key={order.id}>
                                    {/* <h3>注文ID: {order.id}</h3> */}
                                    <h3>注文日時: {order.createdAt.toDate().toLocaleString()}</h3>
                                    <p>ユーザー: {userNames[order.userId] || "不明なユーザー"}</p> {/* displayNameを表示 */}
                                    <ul>
                                        {order.products.map(product => (
                                            <li key={product.productId}>
                                                {product.name} - 数量: {product.quantity} - 価格: ¥{product.price}
                                            </li>
                                        ))}
                                    </ul>
                                    <p>備考: {order.note}</p>
                                    <p>合計金額: ¥{order.totalPrice}</p>
                                    <p>現在の状態: {order.status}</p>
                                    <button onClick={() => handleStatusChange(order.id, "未処理")}>未処理にする</button>
                                    <button onClick={() => handleStatusChange(order.id, "未払い")}>提供済み</button>
                                    <button onClick={() => handleStatusChange(order.id, "完了")}>完了にする</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default Orders;
