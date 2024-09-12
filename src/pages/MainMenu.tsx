import React, { useEffect, useState } from "react";
import { getProductsByCategory } from "../services/products";
import { Product, CartItem } from "../types/types";

const MainMenu: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState("all");
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);

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

    // 商品をカートに追加する関数
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
                </div>
            )}
        </div>
    );
};

export default MainMenu;
