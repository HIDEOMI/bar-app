import React, { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { createOrder } from "../services/orders";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

const OrderPage: React.FC<{ products: Product[] }> = ({ products }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [note, setNote] = useState(""); // 備考欄

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.product.id === product.id 
        ? { ...item, quantity: item.quantity + 1 } 
        : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setTotalPrice(totalPrice + product.price);
  };

  const handleOrderSubmit = async () => {
    if (!user) return;
    
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));
    
    try {
      const orderId = await createOrder(user.uid, orderItems, totalPrice);
      console.log("注文完了! 注文ID:", orderId);
    } catch (error) {
      console.error("注文エラー:", error);
    }
  };

  return (
    <div>
      <h1>注文ページ</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <img src={product.imageUrl} alt={product.name} width="100" />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>価格: ¥{product.price}</p>
            <p>在庫: {product.stock > 0 ? product.stock : "売り切れ"}</p>
            <button onClick={() => handleAddToCart(product)} disabled={product.stock <= 0}>
              カートに追加
            </button>
          </li>
        ))}
      </ul>

      <h2>カート</h2>
      <ul>
        {cart.map(item => (
          <li key={item.product.id}>
            {item.product.name} - 数量: {item.quantity} - 価格: ¥{item.product.price * item.quantity}
          </li>
        ))}
      </ul>
      <p>合計金額: ¥{totalPrice}</p>

      <label>備考欄: </label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} />

      <button onClick={handleOrderSubmit} disabled={cart.length === 0}>
        注文確定
      </button>
    </div>
  );
};

export default OrderPage;
