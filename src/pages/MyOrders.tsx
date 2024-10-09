import React, { useEffect, useState } from "react";
import { Timestamp } from 'firebase/firestore';
import { Order } from "../types/types";
import { useAuth } from "../hooks/useAuth";
import { getMyOrders } from "../services/orders";


const MyOrders: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user) {
                setLoading(true);
                try {
                    const myOrders = await getMyOrders(user.uid);

                    // // FirestoreからのデータをOrder型にマッピング
                    // const mappedOrders: Order[] = myOrders.map(order => ({
                    //     id: order.id,
                    //     totalPrice: order.totalPrice,
                    //     products: order.products || [],
                    //     note: order.note || "",
                    //     status: order.status || "未処理",
                    //     createdAt: order.createdAt,
                    //     userId: order.userId,
                    // }));

                    setOrders(myOrders);
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
                    {orders.map(order => {
                        // createdAt が Firebase Timestamp 型かどうかを確認
                        const createdAt = order.createdAt instanceof Timestamp
                            ? order.createdAt.toDate()
                            : new Date(order.createdAt.seconds * 1000); // もし Timestamp でなければ Date オブジェクトに変換

                        return (
                            <li key={order.id}>
                                <h3>注文日時: {createdAt.toLocaleString()}</h3>
                                <p>ステータス: {order.status}</p>
                                <p>合計金額: ¥{order.totalPrice.toLocaleString()}</p>
                                <ul>
                                    {order.products.map(product => (
                                        <li key={product.productId}>
                                            {product.name} : {product.quantity} - 価格: ¥{product.price.toLocaleString()}
                                        </li>
                                    ))}
                                </ul>
                                <p>備考: {order.note}</p>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default MyOrders;