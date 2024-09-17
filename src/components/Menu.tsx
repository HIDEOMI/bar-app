// src/components/Menu.tsx
import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { useIngredients } from '../hooks/useIngredients';
import OrderButton from './OrderButton';

const Menu: React.FC = () => {
  const { products } = useProducts();
  const { ingredients } = useIngredients();

  // 在庫がある商品のみをフィルタリング
  const availableProducts = products.filter(product => {
    return product.ingredients.every((ingredient: string) => {
      const currentIngredient = ingredients.find((ing) => ing.name === ingredient);
      return currentIngredient && currentIngredient.stock > 0;
    });
  });

  return (
    <div>
      <h2>Menu</h2>
      <ul>
        {availableProducts.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
            <OrderButton product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Menu;
