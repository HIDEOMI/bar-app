// src/hooks/useIngredients.ts
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<any[]>([]);

  useEffect(() => {
    const ingredientsCollection = collection(db, 'ingredients');
    const unsubscribe = onSnapshot(ingredientsCollection, (snapshot) => {
      const ingredientsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIngredients(ingredientsList);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  return { ingredients };
};
