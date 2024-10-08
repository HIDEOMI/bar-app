import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Product, CartItem } from "../types/types";
import { useAuth } from "../hooks/useAuth";
import { getProductsByPage, getFilteredProducts } from '../services/products';
import { createOrder } from "../services/orders";

const CART_STORAGE_KEY = "cartData";
const CART_EXPIRATION_TIME = 10 * 60 * 1000; // 10分（ミリ秒単位）


const MainMenu: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);  // メッセージを管理
    const [error, setError] = useState<string | null>(null);  // エラーメッセージの状態
    const [products, setProducts] = useState<Product[]>([]);
    const [productsByPage, setProductsByPage] = useState<Product[]>([]);
    const [page, setPage] = useState<number>(1);
    const [countInPage, setCountInPage] = useState<number>(20);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');  // 選択されたカテゴリ
    const [cart, setCart] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [note, setNote] = useState("");  // 備考欄
    const [isSubmitting, setIsSubmitting] = useState(false);  // 注文送信中の状態
    const [isAvailable, setIsAvailable] = useState<boolean>(false);

    const baseCategories = ['All', 'ウイスキー', 'ジン', 'ウォッカ', 'ラム'];  // カテゴリの選択肢


    // ページロード時にカート情報を復元
    useEffect(() => {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            const { cart, totalPrice, timestamp } = JSON.parse(storedCart);
            const now = new Date().getTime();
            if (now - timestamp < CART_EXPIRATION_TIME) {
                console.log("カート情報を復元しました");
                console.log(cart);
                setCart(cart);
                setTotalPrice(totalPrice);
            } else {
                console.log("カート情報が期限切れのため、初期化");
                localStorage.removeItem(CART_STORAGE_KEY); // 期限切れの場合は削除
            }
        }
    }, []);

    // カート情報を更新するたびに `localStorage` に保存
    useEffect(() => {
        const saveCartToStorage = () => {
            try {
                const timestamp = new Date().getTime();
                const cartData = { cart, totalPrice, timestamp };
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
                console.log("カート情報を保存しました");
            } catch (error) {
                console.error("カート情報の保存に失敗しました:", error);
            }
        };
        saveCartToStorage();
    }, [cart, totalPrice]);


    useEffect(() => {
        const fetchDatas = async () => {
            setLoading(true);
            try {
                filterAndSetProducts();
            } catch (error) {
                console.error("Error fetching datas: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatas();
    }, [isAvailable, selectedCategory, countInPage]);


    /** 商品リストのフィルタリングと初期ページ設定を行う関数 */
    const filterAndSetProducts = async () => {
        // カテゴリ商品を取得
        const productsByCategory = await getFilteredProducts(selectedCategory, "All");

        // 在庫アリ or ナシでフィルタリング
        const filteredProducts = isAvailable
            ? productsByCategory
            : productsByCategory.filter(product => product.isAvailable);

        // 準備完了の商品のみ表示
        const alreadyProducts = filteredProducts.filter(product => (product.already === "Ready" || product.already === "Done"));

        // 状態を変えたら1ページに戻る
        const productsByPage = await getProductsByPage(alreadyProducts, 1, countInPage);

        setProducts(alreadyProducts);
        setProductsByPage(productsByPage);
        setPage(1);
    };

    /** メッセージを一定時間表示した後に非表示にする処理 */
    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, 2000);  // 2秒後にメッセージを非表示
    };

    /** 次のページを取得 */
    const fetchNextPage = async () => {
        const nextPage = page + 1
        const productsByPage = await getProductsByPage(products, nextPage, countInPage);
        setPage(nextPage);
        setProductsByPage(productsByPage);
    };

    /** 前のページを取得 */
    const fetchPrevPage = async () => {
        const prevPage = page - 1
        const productsByPage = await getProductsByPage(products, prevPage, countInPage);
        setPage(prevPage);
        setProductsByPage(productsByPage);
    };

    /** カテゴリフィルタの変更ハンドラ */
    const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        // 選択状態を取得
        const category = e.target.value;
        setSelectedCategory(category);
        console.log("選択したカテゴリ：" + category);
    };

    /** 在庫フィルタチェックボックスの変更ハンドラ */
    const handleShowHideOutOfStock = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // 選択状態を取得
        const isChecked = e.target.checked;
        setIsAvailable(isChecked);
        console.log("在庫ナシも表示する：" + isChecked);
    }

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

        if (orderItems.length === 0) {
            window.alert("カートに商品がありません");
            setIsSubmitting(false);  // 送信終了
            return;

        }

        const isConfirmed = window.confirm("注文を確定しますか？");
        if (!isConfirmed) {
            try {
                const orderId = await createOrder(user.uid, orderItems, totalPrice, note);

                // // 使用した材料の在庫を減らす
                // for (const item of cart) {
                //     const product = item.product;
                //     for (const materialInProduct of product.materials) {
                //         const materialId = materialInProduct.id;
                //         const material = allMaterials.find((m) => m.id === materialId);
                //         const remainingTotalAmount = material && (material.totalAmount - item.quantity * materialInProduct.quantity / material.unitCapacity);
                //         if (material) {
                //             await updateMaterial(materialId, { totalAmount: remainingTotalAmount });
                //         }
                //     }
                // }

                console.log("注文が確定しました！ 注文ID:", orderId);
                showMessage("注文が確定しました！");

                // 注文が確定した後、カートをリセット
                setCart([]);
                setTotalPrice(0);
                setNote("");
                localStorage.removeItem(CART_STORAGE_KEY);
            } catch (error) {
                console.error("注文確定時にエラーが発生しました:", error);
            } finally {
                setIsSubmitting(false);  // 送信終了
            }
        } else {
            window.alert("注文をキャンセルしました");
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

                <br />
                <label>※在庫切れ商品も表示する場合はチェックを入れる </label>
                <input type="checkbox" checked={isAvailable} onChange={handleShowHideOutOfStock} />

                <br />
                <label>表示件数: </label>
                <select value={countInPage} onChange={(e) => setCountInPage(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>

                {loading ? (
                    <p>読み込み中...</p>
                ) : (
                    <div>
                        {productsByPage.length === 0 ? (
                            // {filteredProducts.length === 0 ? (
                            <p>該当する商品がありません。</p>
                        ) : (
                            <div>
                                {/* <ul> */}
                                <div className="product-grid">
                                    {productsByPage.map((product) => (
                                        // <li key={product.id}>
                                        <div className="product-item" key={product.id}>
                                            {/* <img src={product.imageUrl} alt="画像募集中！" width="100" /> */}
                                            <h4>{product.name}</h4>
                                            <p
                                                style={{ fontSize: "small" }}
                                            >
                                                {product.summary}
                                            </p>
                                            {/* 材料の文字列サイズは小さい */}
                                            <p
                                                style={{
                                                    fontSize: "small",
                                                    color: "gray",
                                                }}
                                            >材料: {product.materials.map(material => `${material.name}`).join(", ")}</p>
                                            値段: ¥ {product.price.toLocaleString()} <br />
                                            {/* {product.description} <br /> */}
                                            {/* もしも在庫がある場合はカートに追加ボタンを表示。ない場合はボタンを在庫切れ表記に変更 */}
                                            {product.isAvailable && (
                                                <button onClick={() => handleAddToCart(product)}>カートに追加</button>
                                            )}
                                            {!product.isAvailable && (
                                                <button disabled>在庫切れ</button>
                                            )}
                                        </div>
                                        // </li>
                                    ))}
                                </div>
                                {/* </ul> */}

                                <br />
                                <label>表示件数: </label>
                                <select value={countInPage} onChange={(e) => setCountInPage(Number(e.target.value))}>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>

                                <br />
                                <button onClick={fetchPrevPage} disabled={page <= 1}>前へ</button>
                                <button onClick={fetchNextPage}>次へ</button>


                                <style>
                                    {`
                                        .product-grid {
                                            display: grid;
                                            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                                            gap: 20px;
                                            margin-top: 20px;
                                        }
                                        .product-item {
                                            border: 1px solid #ddd;
                                            padding: 10px;
                                            text-align: center;
                                        }
                                    `}
                                </style>

                            </div>
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
                            {/* 数量を増減させるボタンを追加 */}
                            <button onClick={() => {
                                setCart(cart.map(i =>
                                    i.product.id === item.product.id
                                        ? { ...i, quantity: i.quantity - 1 }
                                        : i
                                ));
                                setTotalPrice(totalPrice - item.product.price);
                            }}>
                                -
                            </button>
                            <button onClick={() => {
                                setCart(cart.map(i =>
                                    i.product.id === item.product.id
                                        ? { ...i, quantity: i.quantity + 1 }
                                        : i
                                ));
                                setTotalPrice(totalPrice + item.product.price);
                            }}>
                                +
                            </button>
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
        </div >

    );
};

export default MainMenu;
