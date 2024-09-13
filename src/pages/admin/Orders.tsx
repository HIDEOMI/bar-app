import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/orders';
import { getUserById } from '../../services/users';
import { Order } from "../../types/types";


const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [userNames, setUserNames] = useState<{ [key: string]: string }>({}); // userId に対する displayName
    const [selectedStatus, setSelectedStatus] = useState<string>("全て");  // デフォルトは全て
    const userCache: { [key: string]: string } = {}; // ユーザー情報をキャッシュするオブジェクト

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const data = await getAllOrders();
            setOrders(data);
            setLoading(false);
            // 各注文のユーザー情報を取得
            const userNameMap: { [key: string]: string } = {};
            for (const order of data) {
                if (userCache[order.userId]) {
                    // キャッシュに存在する場合はキャッシュを使用
                    userNameMap[order.userId] = userCache[order.userId];
                } else {
                    const user = await getUserById(order.userId);
                    if (user) {
                        userCache[order.userId] = user.displayName || "不明なユーザー"; // キャッシュに保存
                        userNameMap[order.userId] = user.displayName || "不明なユーザー";
                    } else {
                        userNameMap[order.userId] = "不明なユーザー";
                    }
                }
            }
            setUserNames(userNameMap);
            setLoading(false);
        };

        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            // ステータス更新後に注文データを再取得
            const data = await getAllOrders();
            setOrders(data);
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
                <option value="処理中">処理中</option>
                <option value="未払い">未払い</option>
                <option value="完了">完了</option>
            </select>

            {loading ? (
                <p>読み込み中...</p>
            ) : (
                <ul>
                    {/* フィルタされた注文を表示 */}
                    {filteredOrders.map(order => (
                        <li key={order.id}>
                            <h3>注文ID: {order.id}</h3>
                            <p>ユーザー: {userNames[order.userId] || "不明なユーザー"}</p> {/* displayNameを表示 */}
                            <p>合計金額: ¥{order.totalPrice}</p>
                            <p>備考: {order.note}</p>
                            <p>注文日時: {order.createdAt.toDate().toLocaleString()}</p>
                            <ul>
                                {order.products.map(product => (
                                    <li key={product.productId}>
                                        {product.name} - 数量: {product.quantity} - 価格: ¥{product.price}
                                    </li>
                                ))}
                            </ul>
                            <p>現在の状態: {order.status}</p>
                            <button onClick={() => handleStatusChange(order.id, "処理中")}>処理中にする</button>
                            <button onClick={() => handleStatusChange(order.id, "未払い")}>未払いにする</button>
                            <button onClick={() => handleStatusChange(order.id, "完了")}>完了にする</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Orders;
