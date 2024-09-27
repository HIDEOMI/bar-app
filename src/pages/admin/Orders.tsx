import React, { useEffect, useState } from 'react';
import { Order } from "../../types/types";
import { getAllOrders, updateOrderStatus } from '../../services/orders';
import { getUserNameFrom } from '../../services/users';


const makeUserIdToNames = async (orders: Order[]) => {
    const userIdToNames: { [key: string]: string } = {};
    for (const order of orders) {
        // console.log(order.userId);
        const displayName = await getUserNameFrom(order.userId);
        // console.log(displayName);
        userIdToNames[order.userId] = displayName;
    }

    return userIdToNames;
};

const Orders: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [userIdToNames, setuserIdToNames] = useState<{ [key: string]: string }>({}); // userId に対する displayName
    const [selectedStatus, setSelectedStatus] = useState<string>("未処理");  // デフォルトは未処理

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const allOrders = await getAllOrders();
                setOrders(allOrders);
                // 各注文のユーザー情報を取得
                console.log("各注文のユーザー情報を取得");
                const tmpUserIdToNames: { [key: string]: string } = await makeUserIdToNames(allOrders);
                setuserIdToNames(tmpUserIdToNames);
            } catch (error) {
                console.error("Error fetching datas: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
        console.log(userIdToNames)
        // userNames[order.userId]
    }, []);


    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            const allOrders = await getAllOrders();
            setOrders(allOrders);  // ステータス更新後に注文データを再取得
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
                                    <p>ユーザー: {userIdToNames[order.userId] || "不明なユーザー"}</p> {/* displayNameを表示 */}
                                    <ul>
                                        {order.products.map(product => (
                                            <li key={product.productId}>
                                                {product.name} - 数量: {product.quantity} - 価格: ¥{product.price.toLocaleString()}
                                            </li>
                                        ))}
                                    </ul>
                                    <p>備考: {order.note}</p>
                                    <p>合計金額: ¥{order.totalPrice.toLocaleString()}</p>
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
