import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/orders';
import { Order } from "../../types/types";


const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const data = await getAllOrders();
            setOrders(data);
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

    return (
        <div>
            <h1>注文確認</h1>
            {loading ? (
                <p>読み込み中...</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.id}>
                            <h3>注文ID: {order.id}</h3>
                            <p>ユーザーID: {order.userId}</p>
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
