import React, { useEffect, useState } from 'react';
import { getAllProducts, addProduct, deleteProduct } from '../../services/products';
// import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../../services/products';
import { getMaterials } from '../../services/materials';
import { Product, Material } from '../../types/types';


const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: 0,
        description: '',
        category: '',
        imageUrl: '',
        materials: [] as string[],
    });

    useEffect(() => {
        const fetchData = async () => {
            const productsData = await getAllProducts();
            const materialsData = await getMaterials();

            const mappedProducts: Product[] = productsData.map((doc: any) => ({
                id: doc.id,
                name: doc.name,
                price: doc.price,
                description: doc.description,
                category: doc.category,
                imageUrl: doc.imageUrl,
                materials: doc.materials || [],
            }));
            setProducts(mappedProducts);
            setMaterials(materialsData);
        };
        fetchData();
    }, []);

    const handleAddProduct = async () => {
        await addProduct(newProduct);
        setNewProduct({
            name: '',
            price: 0,
            description: '',
            category: '',
            imageUrl: '',
            materials: [],
        });
        const productsData = await getAllProducts();
        const mappedProducts: Product[] = productsData.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            price: doc.price,
            description: doc.description,
            category: doc.category,
            imageUrl: doc.imageUrl,
            materials: doc.materials || [],
        }));
        setProducts(mappedProducts);
    };

    const handleDeleteProduct = async (id: string) => {
        await deleteProduct(id);
        const productsData = await getAllProducts();
        const mappedProducts: Product[] = productsData.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            price: doc.price,
            description: doc.description,
            category: doc.category,
            imageUrl: doc.imageUrl,
            materials: doc.materials || [],
        }));
        setProducts(mappedProducts);
    };

    return (
        <div>
            <h2>商品管理</h2>
            <h3>新しい商品を追加</h3>
            <input
                type="text"
                placeholder="商品名"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
                type="number"
                placeholder="価格"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
            />
            <input
                type="text"
                placeholder="説明"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
            <input
                type="text"
                placeholder="カテゴリ"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            />
            <input
                type="text"
                placeholder="画像URL"
                value={newProduct.imageUrl}
                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
            />
            <div>
                <p>必要な材料を選択:</p>
                {materials.map((material) => (
                    <label key={material.id}>
                        <input
                            type="checkbox"
                            value={material.id}
                            checked={newProduct.materials.includes(material.id)}
                            onChange={(e) => {
                                const selectedMaterials = newProduct.materials;
                                if (e.target.checked) {
                                    selectedMaterials.push(material.id);
                                } else {
                                    const index = selectedMaterials.indexOf(material.id);
                                    selectedMaterials.splice(index, 1);
                                }
                                setNewProduct({ ...newProduct, materials: [...selectedMaterials] });
                            }}
                        />
                        {material.name}
                    </label>
                ))}
            </div>
            <button onClick={handleAddProduct}>追加</button>

            <h3>商品リスト</h3>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        {product.name} - ¥{product.price}
                        <button onClick={() => handleDeleteProduct(product.id)}>削除</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Products;
