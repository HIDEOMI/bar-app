// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const productCollection = collection(db, 'products');
      const productSnapshot = await getDocs(productCollection);
      const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    };
    
    fetchProducts();
  }, []);

  return { products };
};
