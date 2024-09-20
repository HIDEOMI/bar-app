import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Product, CartItem, Material } from "../types/types";
import { getAllProducts } from '../services/products';
import { createOrder } from "../services/orders";
import { getAllMaterials, updateMaterial } from "../services/materials";
import { useAuth } from "../components/AuthProvider";


const MainMenu: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);  // メッセージを管理
    const [error, setError] = useState<string | null>(null);  // エラーメッセージの状態
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');  // 選択されたカテゴリ
    const [cart, setCart] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [note, setNote] = useState("");  // 備考欄
    const [isSubmitting, setIsSubmitting] = useState(false);  // 注文送信中の状態

    const baseCategories = ['All', 'ウイスキー', 'ジン', 'ウォッカ', 'ラム'];  // カテゴリの選択肢  


    useEffect(() => {
        const fetchDatas = async () => {
            setLoading(true);
            try {
                const allProductsData = await getAllProducts();
                const allMaterialsData = await getAllMaterials();
                setAllProducts(allProductsData);
                setAllMaterials(allMaterialsData);
                setFilteredProducts(allProductsData);  // 初期値としてすべての材料を表示
            } catch (error) {
                console.error("Error fetching datas: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatas();
    }, []);  // category のみを依存配列に含める

    /** メッセージを一定時間表示した後に非表示にする処理 */
    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, 2000);  // 2秒後にメッセージを非表示
    };

    /** カテゴリフィルタの変更ハンドラ */
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        setSelectedCategory(category);

        if (category === 'All') {
            setFilteredProducts(allProducts);  // "All" を選んだ場合はすべての商品を表示
        } else {
            const filtered = allProducts.filter((product) => product.bases.includes(category));
            setFilteredProducts(filtered);  // 選択したカテゴリの材料だけを表示
        }
    };

    /** 商品をカートに追加するハンドラ */
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

    /** 注文を確定してFirestoreに保存するハンドラ */
    const handleOrderSubmit = async () => {
        if (!user) {
            console.error("ログインしてください");
            setError("ログインしてください")
            return;
        }

        setIsSubmitting(true);  // 注文送信中にする

        const orderItems = cart.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
        }));

        try {
            const orderId = await createOrder(user.uid, orderItems, totalPrice, note);

            // 使用した材料の在庫を減らす
            for (const item of cart) {
                const product = item.product;
                for (const materialInProduct of product.materials) {
                    const materialId = materialInProduct.id;
                    const material = allMaterials.find((m) => m.id === materialId);
                    const remainingTotalAmount = material && (material.totalAmount - item.quantity * materialInProduct.quantity / material.unitCapacity);
                    if (material) {
                        await updateMaterial(materialId, { totalAmount: remainingTotalAmount });
                    }
                }
            }

            console.log("注文が確定しました！ 注文ID:", orderId);
            showMessage("注文が確定しました！");

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

            <h2>商品を探す</h2>

            <h3>商品リスト</h3>
            <div>
                <label>カテゴリ選択: </label>
                <select value={selectedCategory} onChange={handleCategoryChange}>
                    {baseCategories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                {loading ? (
                    <p>読み込み中...</p>
                ) : (
                    <div>
                        {filteredProducts.length === 0 ? (
                            <p>該当する商品がありません。</p>
                        ) : (
                            <ul>
                                {filteredProducts.map((product) => (
                                    <li key={product.id}>
                                        <img src={product.imageUrl} alt="画像募集中！" width="100" />
                                        <p>{product.name}</p>
                                        {product.description} <br />
                                        値段: ¥ {product.price.toLocaleString()} <br />
                                        在庫: {product.isAvailable ? "在庫あり" : "売り切れ"} <br />
                                        {product.isAvailable && (
                                            <button onClick={() => handleAddToCart(product)}>
                                                カートに追加
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <h2>カートの中身</h2>
            <div>
                {message && <p style={{ color: 'red' }}>{message}</p>} {/* メッセージを表示 */}
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* エラーメッセージを表示 */}

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

                <div>
                    {/* 注文確定ボタン */}
                    <button onClick={handleOrderSubmit} disabled={cart.length === 0 || isSubmitting}>
                        {isSubmitting ? "注文を送信中..." : "注文を確定"}
                    </button>
                    <Link to="/payment">
                        <button>支払いページへ</button>
                    </Link>
                </div>

            </div>
        </div>

    );
};

export default MainMenu;
