// src/components/OrderButton.tsx
import React, { useState } from 'react';
import { useIngredients } from '../hooks/useIngredients';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

interface OrderButtonProps {
  product: any;
}

const OrderButton: React.FC<OrderButtonProps> = ({ product }) => {
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const { ingredients } = useIngredients();

  const handleOrder = async () => {
    const productIngredients = product.ingredients;
    let canOrder = true;

    // 材料の在庫を確認
    for (const ingredient of productIngredients) {
      const currentIngredient = ingredients.find((ing) => ing.name === ingredient);
      if (!currentIngredient || currentIngredient.stock <= 0) {
        canOrder = false;
        setIsOutOfStock(true);
        break;
      }
    }

    // 在庫があれば注文を実行し、在庫を減らす
    if (canOrder) {
      for (const ingredient of productIngredients) {
        const currentIngredient = ingredients.find((ing) => ing.name === ingredient);
        if (currentIngredient) {
          const ingredientRef = doc(db, 'ingredients', currentIngredient.id);
          await updateDoc(ingredientRef, { stock: currentIngredient.stock - 1 });
        }
      }
      console.log(`Ordering ${product.name}`);
    } else {
      console.error('Error: Out of stock');
    }
  };

  return (
    <div>
      <button onClick={handleOrder} disabled={isOutOfStock}>
        {isOutOfStock ? 'Out of Stock' : 'Order'}
      </button>
    </div>
  );
};

export default OrderButton;
