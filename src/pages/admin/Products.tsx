import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Product, Material, MaterialInProduct } from '../../types/types';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../../services/products';
import { getAllMaterials } from '../../services/materials';


const Products: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);  // 編集モードかどうかを管理
    const [message, setMessage] = useState<string | null>(null);  // メッセージを管理
    const [error, setError] = useState<string | null>(null);  // エラーメッセージの状態
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');  // 選択されたカテゴリ
    const [selectedMaterials, setSelectedMaterials] = useState<MaterialInProduct[]>([]);
    const [formProduct, setFormProduct] = useState<Product>({
        id: '',
        name: '',
        price: 0,
        description: '',
        categories: [],
        bases: [],
        color: '',
        alc: 0,
        recipe: '',
        imageUrl: '',
        isAvailable: true,
        materials: [],
    });

    const categoriesList = ['カクテル', 'ビール', 'ワイン'];  // カテゴリの選択肢
    const baseList = ['ウイスキー', 'ジン', 'ウォッカ', 'ラム'];  // ベースの選択肢
    const baseCategories = ['All', 'ウイスキー', 'ジン', 'ウォッカ', 'ラム'];  // カテゴリの選択肢  

    /** react-select 用の材料オプション */
    const materialOptions = allMaterials.map(material => ({
        value: material.id,
        label: material.name,
    }));

    useEffect(() => {
        const fetchDatas = async () => {
            console.log("=== useEffect");
            setLoading(true);
            try {
                const allProductsData = await getAllProducts();
                const allMaterialsData = await getAllMaterials();
                setAllProducts(allProductsData);
                setAllMaterials(allMaterialsData);
                setFilteredProducts(allProductsData);  // 初期値としてすべての材料を表示
            } catch (error) {
                console.error("Error fetching datas: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatas();
    }, []);


    /** メッセージを一定時間表示した後に非表示にする処理 */
    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, 2000);  // 2秒後にメッセージを非表示
    };

    /** フォームのリセット処理 */
    const resetForm = () => {
        setFormProduct({
            id: '',
            name: '',
            price: 0,
            description: '',
            categories: [],
            bases: [],
            color: '',
            alc: 0,
            recipe: '',
            imageUrl: '',
            isAvailable: false,
            materials: [],
        });
        setSelectedMaterials([]);
        setIsEditing(false);  // 編集モードを解除
        setError(null);
    };



    /** 入力値が変更されたときに商品の情報を更新するハンドラ */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormProduct({ ...formProduct, [name]: type === "number" ? Number(value) : value });
    };

    /** セレクトが変更されたときに商品の情報を更新するハンドラ */
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, options } = e.target;
        const selectedValues = Array.from(options).filter(option => option.selected).map(option => option.value);
        setFormProduct({ ...formProduct, [name]: selectedValues });
    };

    /** 商品の材料リストを追加するハンドラ */
    const handleSelectMaterial = (selectedOptions: any) => {
        const selected = selectedOptions.map((option: any) => {
            const material = allMaterials.find(m => m.id === option.value);
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

    /** 材料の量を動的に変更するハンドラ */
    const handleQuantityChange = (index: number, newQuantity: number) => {
        const updatedMaterials = [...selectedMaterials];
        updatedMaterials[index].quantity = newQuantity;
        setSelectedMaterials(updatedMaterials);
    };

    /** 商品追加または編集するハンドラ */
    const handleSubmit = async () => {
        // バリデーション: 商品名が空欄
        if (formProduct.name.trim() === '') {
            setError('商品名を入力してください。');
            return;
        }

        // バリデーション: 商品名が重複しているか
        const isDuplicate = allProducts.some(
            (mat) => mat.name === formProduct.name && mat.id !== formProduct.id
        );
        if (isDuplicate) {
            setError('この材料名はすでに存在します。');
            return;
        }

        // バリデーション: 色が空欄
        if (formProduct.color.trim() === '') {
            setError('色を入力してください。');
            return;
        }

        // バリデーション: ノンアルじゃないのにアルコールが0
        if (formProduct.alc === 0) {
            setError('アルコール度数を入力してください。');
            return;
        }

        formProduct.isAvailable = true;
        // 商品の価格を計算する
        const prices = selectedMaterials.map(selectedMaterialInProduct => {
            /** 材料リスト一覧の中でselectedMaterialInProductと同じもの */
            const selectedMaterial = allMaterials.find(m => m.id === selectedMaterialInProduct.id);
            if (!selectedMaterialInProduct.isAvailable === false) {
                formProduct.isAvailable = false;
            }
            return selectedMaterial ? Math.ceil(selectedMaterial.unitPrice * selectedMaterialInProduct.quantity / selectedMaterial.unitCapacity) : 0;
        });
        formProduct.price = 50 + prices.reduce((sum, element) => sum + element, 0);

        if (isEditing) {
            const { id, ...updateData } = formProduct;
            updateData.materials = selectedMaterials;
            await updateProduct(id, updateData);
            showMessage('商品を更新しました');
        } else {
            formProduct.materials = selectedMaterials;
            await addProduct(formProduct);
            showMessage('商品を追加しました');
        }

        resetForm();
        const allProductsData = await getAllProducts();
        setAllProducts(allProductsData);
        setFilteredProducts(allProductsData);
    };

    /** キャンセルボタンを押したときのハンドラ */
    const handleCancel = () => {
        resetForm();
        setMessage('キャンセルしました。');
    };

    /** カテゴリフィルタの変更ハンドラ */
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        setSelectedCategory(category);

        if (category === 'All') {
            setFilteredProducts(allProducts);  // "All" を選んだ場合はすべての商品を表示
        } else {
            const filtered = allProducts.filter((product) => product.bases.includes(category));
            setFilteredProducts(filtered);  // 選択したカテゴリの材料だけを表示
        }
    };

    /** 商品を編集するハンドラ */
    const handleEditProduct = (product: Product) => {
        setFormProduct(product);  // 編集モードで既存データをセット
        setSelectedMaterials(product.materials);
        setIsEditing(true);
    };

    /** 商品を削除するハンドラ */
    const handleDeleteProduct = async (id: string) => {
        await deleteProduct(id);
        showMessage('商品を削除しました');
        const data = await getAllProducts();
        setAllProducts(data);
        setFilteredProducts(data);
    };


    return (
        <div>
            <h2>商品管理</h2>

            <h3>商品登録 / 編集</h3>
            <div>
                {message && <p style={{ color: 'red' }}>{message}</p>} {/* メッセージを表示 */}
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* エラーメッセージを表示 */}

                <label>商品名: </label>
                <input
                    type="text"
                    name="name"
                    placeholder="商品名"
                    value={formProduct.name}
                    onChange={handleInputChange}
                />
                <br />
                <label>説明: </label>
                <textarea
                    name="description"
                    placeholder="説明"
                    value={formProduct.description}
                    onChange={handleInputChange}
                />
                <br />
                <label>カテゴリ: </label>
                <select
                    name="categories"
                    multiple
                    value={formProduct.categories}
                    onChange={handleSelectChange}
                >
                    {categoriesList.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <br />
                <label>ベース: </label>
                <select
                    name="bases"
                    multiple
                    value={formProduct.bases}
                    onChange={handleSelectChange}
                >
                    {baseList.map(base => (
                        <option key={base} value={base}>
                            {base}
                        </option>
                    ))}
                </select>
                <br />
                <label>色: </label>
                <input
                    type="text"
                    name="color"
                    placeholder="色"
                    value={formProduct.color}
                    onChange={handleInputChange}
                />
                <br />
                <label>アルコール度数: </label>
                <input
                    type="number"
                    name="alc"
                    placeholder="アルコール度数"
                    value={formProduct.alc}
                    onChange={handleInputChange}
                />
                <br />
                <label>レシピ: </label>
                <textarea
                    name="recipe"
                    placeholder="レシピ"
                    value={formProduct.recipe}
                    onChange={handleInputChange}
                />
                <br />
                <label>画像URL: </label>
                <input
                    type="text"
                    name="imageUrl"
                    placeholder="画像URL"
                    value={formProduct.imageUrl}
                    onChange={handleInputChange}
                />

                {/* 材料の選択 */}
                <br />
                <br />
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
                                value={material.quantity || 0}
                                onChange={(e) => handleQuantityChange(index, Number(e.target.value))}  // 量を変更
                            />
                        </li>
                    ))}
                </ul>

                <button onClick={handleSubmit}>{isEditing ? '商品を更新' : '商品を追加'}</button>
                <button onClick={handleCancel}>キャンセル</button>

            </div>

            <h3>商品リスト</h3>
            <div>
                {/* カテゴリフィルタのプルダウン */}
                <select value={selectedCategory} onChange={handleCategoryChange}>
                    {baseCategories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                {loading ? (
                    <p>読み込み中...</p>
                ) : (
                    <div>
                        {filteredProducts.length === 0 ? (
                            <p>該当する商品がありません。</p>
                        ) : (
                            <ul>
                                {filteredProducts.map(product => (
                                    <li key={product.id}>
                                        {product.name} - ¥{product.price}
                                        <p>カテゴリ: {product.categories.join(', ')}</p>
                                        <p>ベース: {product.bases.join(', ')}</p>
                                        <p>色: {product.color}</p>
                                        <p>アルコール度数: {product.alc}%</p>
                                        <p>レシピ: {product.recipe}</p>
                                        <p>材料: {product.materials.map(m => m.name).join(', ')}</p>
                                        <p>在庫: {product.isAvailable ? 'あり' : 'なし'}</p>
                                        <button onClick={() => handleEditProduct(product)}>編集</button>
                                        <button onClick={() => handleDeleteProduct(product.id)}>削除</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Products;
