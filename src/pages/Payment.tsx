import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Order } from "../types/types";
import { getUnpaidOrdersByUserId, updateOrderStatus } from "../services/orders";


const Payment: React.FC = () => {
    const { user } = useAuth();
    const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalUnpaid, setTotalUnpaid] = useState(0);


    useEffect(() => {
        const fetchUnpaidOrders = async () => {
            if (user) {
                setLoading(true);
                try {
                    const orders = await getUnpaidOrdersByUserId(user.uid);
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
            const isConfirmed = window.confirm("支払いを完了しますか？");
            if (isConfirmed) {
                try {
                    // 未払いの注文のステータスを "支払い確認" に更新
                    await Promise.all(unpaidOrders.map(order => updateOrderStatus(order.id, "支払い確認")));
                    alert("支払いが完了しました！");

                    // 未払いの注文一覧をリロード
                    setUnpaidOrders(await getUnpaidOrdersByUserId(user.uid));
                    setTotalUnpaid(0);
                } catch (error) {
                    alert("支払い処理中にエラーが発生しました。");
                    console.error("支払い処理中にエラーが発生しました:", error);
                }
            } else {
                alert("支払いをキャンセルしました。");
            }
        }
    };

    return (
        <div>
            <h1>支払い合計金額: ¥{totalUnpaid.toLocaleString()}</h1>
            <button onClick={handlePayment}>支払いを完了する</button>
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
                                <p>小計金額: ¥{order.totalPrice.toLocaleString()}</p>
                                <p>注文内容: </p>
                                <ul>
                                    {order.products.map(product => (
                                        <li key={product.productId}>
                                            {product.name} : {product.quantity}  - 価格: ¥{product.price}
                                        </li>
                                    ))}
                                </ul>
                                <p>備考: {order.note}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Payment;
