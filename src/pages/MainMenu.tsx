import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsByCategory } from "../services/products";
import { createOrder } from "../services/orders";
import { Product, CartItem } from "../types/types";
import { useAuth } from "../components/AuthProvider";


const MainMenu: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState("all");
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [note, setNote] = useState("");  // 備考欄
    const [isSubmitting, setIsSubmitting] = useState(false);  // 注文送信中の状態
    const [orderSuccess, setOrderSuccess] = useState(false);  // 注文成功のフラグ


    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const products = await getProductsByCategory(category);
                console.log("取得した商品:", products);
                setProducts(products);
            } catch (error) {
                console.error("Error fetching products: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    /** 商品をカートに追加する関数 */
    const handleAddToCart = (product: Product) => {
        const existingItem = cart.find(item => item.product.id === product.id);
        if (existingItem) {
            // 既にカートにある場合は数量を増やす
            setCart(cart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            // カートに新しい商品を追加する
            setCart([...cart, { product, quantity: 1 }]);
        }
        setTotalPrice(totalPrice + product.price);
    };

    /** 注文を確定してFirestoreに保存する関数 */
    const handleOrderSubmit = async () => {
        if (!user) {
            console.error("ログインしてください");
            return;
        }

        setIsSubmitting(true);  // 注文送信中にする
        setOrderSuccess(false);  // メッセージをリセット

        const orderItems = cart.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
        }));

        try {
            const orderId = await createOrder(user.uid, orderItems, totalPrice, note);
            console.log("注文が確定しました！注文ID:", orderId);
            setOrderSuccess(true);  // 注文成功

            // 2秒後にメッセージを非表示にする
            setTimeout(() => {
                setOrderSuccess(false);
            }, 2000);

            // 注文が確定した後、カートをリセット
            setCart([]);
            setTotalPrice(0);
            setNote("");
        } catch (error) {
            console.error("注文確定時にエラーが発生しました:", error);
        } finally {
            setIsSubmitting(false);  // 送信終了
        }
    };


    return (
        <div>
            <h1>メインメニュー</h1>
            <div>
                <label>カテゴリ選択: </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="all">すべて</option>
                    <option value="drinks">ドリンク</option>
                    <option value="food">フード</option>
                </select>
            </div>

            {loading ? (
                <p>読み込み中...</p>
            ) : (
                <div>
                    {products.length === 0 ? (
                        <p>商品がありません。</p>
                    ) : (
                        <ul>
                            {products.map((product) => (
                                <li key={product.id}>
                                    <img src={product.imageUrl} alt={product.name} width="100" />
                                    <h3>{product.name}</h3>
                                    <p>{product.description}</p>
                                    <p>価格: ¥{product.price}</p>
                                    <p>在庫: {product.stock > 0 ? product.stock : "売り切れ"}</p>
                                    {/* 在庫があればカートに追加ボタンを表示 */}
                                    {product.stock > 0 && (
                                        <button onClick={() => handleAddToCart(product)}>
                                            カートに追加
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    <h2>カートの中身</h2>
                    <ul>
                        {cart.map(item => (
                            <li key={item.product.id}>
                                {item.product.name} - 数量: {item.quantity}
                            </li>
                        ))}
                    </ul>
                    <p>合計金額: ¥{totalPrice}</p>

                    <label>備考: </label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} />

                    {/* 注文確定ボタン */}
                    <button onClick={handleOrderSubmit} disabled={cart.length === 0 || isSubmitting}>
                        {isSubmitting ? "注文を送信中..." : "注文を確定"}
                    </button>
                    <Link to="/payment">
                        <button>支払いページへ</button>
                    </Link>
                    {/* 注文成功メッセージ - 2秒後に自動的に消える */}
                    {orderSuccess && <p>注文が完了しました！</p>}
                    {/* 支払いページへのリンク */}
                </div>
            )}
        </div>
    );
};

export default MainMenu;
