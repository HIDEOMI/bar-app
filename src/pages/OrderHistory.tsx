import React, { useEffect, useState } from "react";
import { getOrdersByUserId } from "../services/orders";
import { useAuth } from "../components/AuthProvider";  // ユーザー情報を取得
import { Order } from "../types/types";


const OrderHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user) {
                setLoading(true);
                try {
                    const fetchedOrders = await getOrdersByUserId(user.uid);

                    // FirestoreからのデータをOrder型にマッピング
                    const mappedOrders: Order[] = fetchedOrders.map(order => ({
                        id: order.id,
                        totalPrice: order.totalPrice,
                        products: order.products || [],
                        note: order.note || "",
                        status: order.status || "未処理",
                        createdAt: order.createdAt
                    }));

                    setOrders(mappedOrders);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchOrders();
    }, [user]);

    return (
        <div>
            <h1>注文履歴</h1>
            {loading ? (
                <p>読み込み中...</p>
            ) : orders.length === 0 ? (
                <p>注文履歴がありません。</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.id}>
                            <h3>注文ID: {order.id}</h3>
                            <p>合計金額: ¥{order.totalPrice}</p>
                            <p>ステータス: {order.status}</p>
                            <p>備考: {order.note}</p>
                            <ul>
                                {order.products.map(product => (
                                    <li key={product.productId}>
                                        {product.name} - 数量: {product.quantity} - 価格: ¥{product.price}
                                    </li>
                                ))}
                            </ul>
                            <p>注文日時: {order.createdAt.toDate().toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OrderHistoryPage;