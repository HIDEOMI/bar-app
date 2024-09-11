// src/pages/AddProductPage.tsx
import React, { useState, ChangeEvent } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useIngredients } from '../hooks/useIngredients';
import { toast } from 'react-toastify';

const AddProductPage: React.FC = () => {
  const { ingredients } = useIngredients();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const handleAddProduct = async () => {
    try {
      await addDoc(collection(db, 'products'), {
        name: name,
        price: price,
        ingredients: selectedIngredients
      });
      console.log('Product added successfully');
      toast.success('Product added successfully!'); // 成功時にポップアップ      
    } catch (error) {
      console.error('Error adding product: ', error);
      toast.error('Error adding product: ' + error); // エラー時にポップアップ
    }
  };

  const handleIngredientChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setSelectedIngredients(prev =>
      checked ? [...prev, value] : prev.filter(ingredient => ingredient !== value)
    );
  };

  return (
    <div>
      <h2>Add New Product</h2>
      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Product Price"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />
      <div>
        <h3>Select Ingredients</h3>
        {ingredients.map((ingredient) => (
          <div key={ingredient.id}>
            <input
              type="checkbox"
              id={ingredient.id}
              value={ingredient.name}
              checked={selectedIngredients.includes(ingredient.name)}
              onChange={handleIngredientChange}
            />
            <label htmlFor={ingredient.id}>{ingredient.name}</label>
          </div>
        ))}
      </div>
      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
};

export default AddProductPage;
