import React, { useEffect, useState } from "react";
import { getUnpaidOrdersByUserId } from "../services/orders";
import { useAuth } from "../components/AuthProvider";
import { getFirestore, writeBatch, doc } from "firebase/firestore";
import { Order } from "../types/types";

const PaymentPage: React.FC = () => {
    const { user } = useAuth();
    const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalUnpaid, setTotalUnpaid] = useState(0);

    const db = getFirestore();

    useEffect(() => {
        const fetchUnpaidOrders = async () => {
            if (user) {
                setLoading(true);
                try {
                    const orders = await getUnpaidOrdersByUserId(user.uid);

                    const mappedOrders: Order[] = orders.map(order => ({
                        id: order.id,
                        totalPrice: order.totalPrice,
                        products: order.products || [],
                        note: order.note || "",
                        status: order.status || "未払い",
                        createdAt: order.createdAt
                    }));

                    setUnpaidOrders(orders);

                    const total = orders.reduce((sum, order) => sum + order.totalPrice, 0);
                    setTotalUnpaid(total);
                } catch (error) {
                    console.error("Error fetching unpaid orders:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUnpaidOrders();
    }, [user]);

    const handlePayment = async () => {
        if (user) {
            try {
                // 未払いの注文のステータスを "支払い済み" に更新
                const batch = writeBatch(db);

                unpaidOrders.forEach(order => {
                    const orderRef = doc(db, "orders", order.id);
                    batch.update(orderRef, { status: "支払い済み" });
                });

                await batch.commit();

                alert("支払いが完了しました！");

                // 未払いの注文一覧をリロード
                setUnpaidOrders([]);
                setTotalUnpaid(0);
            } catch (error) {
                console.error("支払い処理中にエラーが発生しました:", error);
            }
        }
    };

    return (
        <div>
            <h1>未払いの合計金額: ¥{totalUnpaid}</h1>
            {loading ? (
                <p>読み込み中...</p>
            ) : unpaidOrders.length === 0 ? (
                <p>未払いの注文はありません。</p>
            ) : (
                <div>
                    <h2>未払いの注文一覧</h2>
                    <ul>
                        {unpaidOrders.map(order => (
                            <li key={order.id}>
                                <h3>注文日時: {order.createdAt.toDate().toLocaleString()}</h3>
                                <p>合計金額: ¥{order.totalPrice}</p>
                                <p>備考: {order.note}</p>
                                <p>注文内容: </p>
                                <ul>
                                    {order.products.map(product => (
                                        <li key={product.productId}>
                                            {product.name} - 数量: {product.quantity} - 価格: ¥{product.price}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handlePayment}>支払いを完了する</button>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;
