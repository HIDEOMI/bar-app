import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Product, Material, MaterialInProduct } from '../../types/types';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../../services/products';
import { getAllMaterials } from '../../services/materials';


const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<MaterialInProduct[]>([]);
    const [newProduct, setNewProduct] = useState<Product>({
        id: '',
        name: '',
        price: 0,
        description: '',
        categories: [],
        base: [],
        color: '',
        alc: 0,
        recipe: '',
        imageUrl: '',
        isAvailable: false,
        materials: [],
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);  // 編集モードかどうかを管理
    const [message, setMessage] = useState<string | null>(null);  // メッセージを管理


    const categoriesList = ['カクテル', 'ビール', 'ワイン'];  // カテゴリの選択肢
    const baseList = ['ウイスキー', 'ジン', 'ウォッカ', 'ラム'];  // ベースの選択肢

    useEffect(() => {
        const fetchData = async () => {
            const productsData = await getAllProducts();
            const materialsData = await getAllMaterials();
            setProducts(productsData);
            setMaterials(materialsData);
        };
        fetchData();
    }, []);

    /** react-select 用の材料オプション */
    const materialOptions = materials.map(material => ({
        value: material.id,
        label: material.name,
    }));

    /** メッセージを一定時間表示した後に非表示にする処理 */
    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, 2000);  // 2秒後にメッセージを非表示
    };

    /** 商品追加または編集する処理 */
    const handleSaveProduct = async () => {
        if (isEditing) {
            await updateProduct(newProduct.id, { ...newProduct, materials: selectedMaterials });
            showMessage('商品を更新しました');
        } else {
            await addProduct({ ...newProduct, materials: selectedMaterials });
            showMessage('商品を追加しました');
        }

        resetForm();
        const productsData = await getAllProducts();
        setProducts(productsData);
    };

    /** 商品を編集する処理 */
    const handleEditProduct = (product: Product) => {
        setNewProduct(product);  // 編集モードで既存商品をセット
        setSelectedMaterials(product.materials);
        setIsEditing(true);
    };

    /** 商品を削除する処理 */
    const handleDeleteProduct = async (id: string) => {
        await deleteProduct(id);
        showMessage('商品を削除しました');
        const productsData = await getAllProducts();
        setProducts(productsData);
    };

    /** フォームのリセット処理 */
    const resetForm = () => {
        setNewProduct({
            id: '',
            name: '',
            price: 0,
            description: '',
            categories: [],
            base: [],
            color: '',
            alc: 0,
            recipe: '',
            imageUrl: '',
            isAvailable: false,
            materials: [],
        });
        setSelectedMaterials([]);
        setIsEditing(false);  // 編集モードを解除
        showMessage('操作をキャンセルしました');  // キャンセルメッセージを表示
    };

    /** 入力値が変更されたときに商品の情報を更新する処理 */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setNewProduct({ ...newProduct, [name]: type === "number" ? Number(value) : value });

    };

    /** セレクトが変更されたときに商品の情報を更新する処理 */
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, options } = e.target;
        const selectedValues = Array.from(options).filter(option => option.selected).map(option => option.value);
        setNewProduct({ ...newProduct, [name]: selectedValues });
    };

    /** 商品の材料リストを追加する処理 */
    const handleSelectMaterial = (selectedOptions: any) => {
        const selected = selectedOptions.map((option: any) => {
            const material = materials.find(m => m.id === option.value);
            const quantity = selectedMaterials.find(m => m.id === option.value)?.quantity;
            return material ? {
                id: material.id,
                name: material.name,
                quantity: quantity,
                isAvailable: material.totalAmount > 0,
            } : null;
        }).filter(Boolean);  // null を除去
        setSelectedMaterials(selected);
    };

    /** 材料の量を動的に変更する処理 */
    const handleQuantityChange = (index: number, newQuantity: number) => {
        const updatedMaterials = [...selectedMaterials];
        updatedMaterials[index].quantity = newQuantity;
        setSelectedMaterials(updatedMaterials);
    };

    return (
        <div>
            <h2>{isEditing ? '商品編集' : '商品登録'}</h2>

            <label>商品名</label>
            <input
                type="text"
                name="name"
                placeholder="商品名"
                value={newProduct.name}
                onChange={handleInputChange}
            />
            <br />
            <label>説明</label>
            <textarea
                name="description"
                placeholder="説明"
                value={newProduct.description}
                onChange={handleInputChange}
            />
            <br />
            <label>カテゴリ</label>
            <select
                name="categories"
                multiple
                value={newProduct.categories}
                onChange={handleSelectChange}
            >
                {categoriesList.map(category => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>
            <br />
            <label>ベース</label>
            <select
                name="base"
                multiple
                value={newProduct.base}
                onChange={handleSelectChange}
            >
                {baseList.map(base => (
                    <option key={base} value={base}>
                        {base}
                    </option>
                ))}
            </select>
            <br />
            <label>色</label>
            <input
                type="text"
                name="color"
                placeholder="色"
                value={newProduct.color}
                onChange={handleInputChange}
            />
            <br />
            <label>アルコール度数</label>
            <input
                type="number"
                name="alc"
                placeholder="アルコール度数"
                value={newProduct.alc}
                onChange={handleInputChange}
            />
            <br />
            <label>レシピ</label>
            <textarea
                name="recipe"
                placeholder="レシピ"
                value={newProduct.recipe}
                onChange={handleInputChange}
            />
            <br />
            <label>画像URL</label>
            <input
                type="text"
                name="imageUrl"
                placeholder="画像URL"
                value={newProduct.imageUrl}
                onChange={handleInputChange}
            />

            {/* 材料の選択 */}
            <h3>材料リスト</h3>

            {/* 材料のサジェスト可能なプルダウン */}
            <label>材料を選択</label>
            <Select
                isMulti  // 複数選択可能
                options={materialOptions}  // 材料の選択肢を表示
                value={selectedMaterials.map(m => ({ value: m.id, label: m.name }))}  // 選択された材料を反映
                onChange={handleSelectMaterial}  // 選択変更時の処理
            />

            {/* 追加された材料のリスト */}
            <h3>追加された材料</h3>
            <ul>
                {selectedMaterials.map((material, index) => (
                    <li key={material.id}>
                        {material.name} - 量:
                        <input
                            type="number"
                            value={material.quantity}
                            onChange={(e) => handleQuantityChange(index, Number(e.target.value))}  // 量を変更
                        />
                    </li>
                ))}
            </ul>

            <button onClick={handleSaveProduct}>{isEditing ? '商品を更新' : '商品を追加'}</button>
            <button onClick={resetForm}>キャンセル</button>

            <h3>商品リスト</h3>
            <ul>
                {products.map(product => (
                    <li key={product.id}>
                        {product.name} - ¥{product.price}
                        <p>カテゴリ: {product.categories.join(', ')}</p>
                        <p>ベース: {product.base.join(', ')}</p>
                        <p>色: {product.color}</p>
                        <p>アルコール度数: {product.alc}%</p>
                        <p>レシピ: {product.recipe}</p>
                        {/* <p>材料: {product.materials}</p> */}
                        {/* <p>材料: {console.log(product.materials)}</p> */}
                        <p>在庫: {product.isAvailable ? 'あり' : 'なし'}</p>
                        <button onClick={() => handleEditProduct(product)}>編集</button>
                        <button onClick={() => handleDeleteProduct(product.id)}>削除</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Products;
