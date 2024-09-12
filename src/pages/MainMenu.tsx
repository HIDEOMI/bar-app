import React, { useEffect, useState } from "react";
import { getProductsByCategory } from "../services/products";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
};

const MainMenu: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const products = await getProductsByCategory(category);
        setProducts(products);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

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
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default MainMenu;
