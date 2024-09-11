// src/pages/InventoryManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { useIngredients } from '../hooks/useIngredients';

const InventoryManagementPage: React.FC = () => {
  const { ingredients } = useIngredients();
  const [newIngredientName, setNewIngredientName] = useState('');
  const [ingredientStockUpdates, setIngredientStockUpdates] = useState<Record<string, number>>({});

  useEffect(() => {
    // 初期在庫数をNew Stockの初期値として設定
    const initialStockUpdates: Record<string, number> = {};
    ingredients.forEach(ingredient => {
      initialStockUpdates[ingredient.id] = ingredient.stock;
    });
    setIngredientStockUpdates(initialStockUpdates);
  }, [ingredients]);

  const handleAddIngredient = async () => {
    if (newIngredientName) {
      try {
        await addDoc(collection(db, 'ingredients'), {
          name: newIngredientName,
          stock: 0 // 初期在庫数を0に設定
        });
        setNewIngredientName('');
      } catch (error) {
        console.error('Error adding ingredient: ', error);
      }
    }
  };

  const handleStockChange = (ingredientId: string, stock: number) => {
    setIngredientStockUpdates(prev => ({
      ...prev,
      [ingredientId]: stock
    }));
  };

  const handleBulkUpdateStock = async () => {
    const batch = writeBatch(db);
    for (const [ingredientId, stock] of Object.entries(ingredientStockUpdates)) {
      const ingredientRef = doc(db, 'ingredients', ingredientId);
      batch.update(ingredientRef, { stock });
    }
    try {
      await batch.commit();
      setIngredientStockUpdates({});
    } catch (error) {
      console.error('Error updating stock: ', error);
    }
  };

  return (
    <div>
      <h2>Inventory Management</h2>

      <div>
        <h3>Add New Ingredient</h3>
        <input
          type="text"
          placeholder="Ingredient Name"
          value={newIngredientName}
          onChange={(e) => setNewIngredientName(e.target.value)}
        />
        <button onClick={handleAddIngredient}>Add Ingredient</button>
      </div>

      <div>
        <h3>Update Existing Ingredients</h3>
        <ul>
          {ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              {ingredient.name} - Current stock: {ingredient.stock}
              <input
                type="number"
                placeholder="New Stock"
                value={ingredientStockUpdates[ingredient.id] || ingredient.stock}
                onChange={(e) => handleStockChange(ingredient.id, Number(e.target.value))}
              />
            </li>
          ))}
        </ul>
        <button onClick={handleBulkUpdateStock}>Update All Stocks</button>
      </div>
    </div>
  );
};

export default InventoryManagementPage;
