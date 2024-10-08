import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import { Product, Material, MaterialInProduct } from '../../types/types';
import { getAllProducts, getFilteredProducts, addProduct, updateProduct, deleteProduct } from '../../services/products';
import { getAllMaterials } from '../../services/materials';


const Products: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);  // 編集モードかどうかを管理
    const [message, setMessage] = useState<string | null>(null);  // メッセージを管理
    const [error, setError] = useState<string | null>(null);  // エラーメッセージの状態
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('All');  // 選択されたステータス
    const [selectedCategory, setSelectedCategory] = useState<string>('All');  // 選択されたカテゴリ
    const [selectedMaterials, setSelectedMaterials] = useState<MaterialInProduct[]>([]);
    const [formProduct, setFormProduct] = useState<Product>({
        id: "",
        name: "",
        price: 0,
        description: "",
        summary: "",
        categories: [],
        bases: [],
        color: "",
        alc: 0,
        alc_taste: "",
        already: "",
        isAvailable: false,
        recipe: "",
        imageUrl: "",
        materials: [],
        method: "",
        recommendation: "",
        tpo: "",
        glass: "",
        type: "",
        word: "",
        date: "",
    });

    const categoriesList = ['カクテル', 'ビール', 'ワイン'];  // カテゴリの選択肢
    const statusesList = ['All', 'Ready', 'Done', '見つからない', ''];  // ステータスの選択肢
    const baseList = ['ウイスキー', 'ジン', 'ウォッカ', 'ラム'];  // ベースの選択肢
    const baseCategories = ['All', 'ウイスキー', 'ジン', 'ウォッカ', 'ラム'];  // カテゴリの選択肢  

    /** react-select 用の材料オプション */
    const materialOptions = allMaterials.map(material => ({
        value: material.id,
        label: material.name,
    }));

    const formRef = useRef<HTMLDivElement>(null);  // フォームへの参照を作成
    const productRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});  // 商品ごとの参照を格納


    useEffect(() => {
        const fetchDatas = async () => {
            setLoading(true);
            try {
                const allMaterialsData = await getAllMaterials();
                setAllMaterials(allMaterialsData);
                const filteredProducts = await getFilteredProducts(selectedCategory, selectedStatus);
                setFilteredProducts(filteredProducts);
            } catch (error) {
                console.error("Error fetching datas: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatas();
    }, [selectedCategory, selectedStatus]);


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
            id: "",
            name: "",
            price: 0,
            description: "",
            summary: "",
            categories: [],
            bases: [],
            color: "",
            alc: 0,
            alc_taste: "",
            already: "",
            isAvailable: false,
            recipe: "",
            imageUrl: "",
            materials: [],
            method: "",
            recommendation: "",
            tpo: "",
            glass: "",
            type: "",
            word: "",
            date: "",
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
        // if (formProduct.color.trim() === '') {
        //     setError('色を入力してください。');
        //     return;
        // }

        // バリデーション: ノンアルじゃないのにアルコールが0
        // if (formProduct.alc === 0) {
        //     setError('アルコール度数を入力してください。');
        //     return;
        // }

        formProduct.isAvailable = true;
        // 商品の価格を計算する
        const prices = selectedMaterials.map(selectedMaterialInProduct => {
            /** 材料リスト一覧の中でselectedMaterialInProductと同じもの */
            const selectedMaterial = allMaterials.find(m => m.id === selectedMaterialInProduct.id);
            if (selectedMaterial && (selectedMaterial.totalAmount <= 0)) {
                formProduct.isAvailable = false;
            }
            return selectedMaterial ? Math.ceil(selectedMaterial.unitPrice * selectedMaterialInProduct.quantity / selectedMaterial.unitCapacity) : 0;
        });
        formProduct.price = 50 + prices.reduce((sum, element) => sum + element, 0);

        if (isEditing) {
            // 商品の更新処理

            const { id, ...updateData } = formProduct;
            updateData.materials = selectedMaterials;

            // 材料のquntityが1より大きい場合、alreadyステータスをReadyに変更
            if (selectedMaterials.some(m => m.quantity > 0)) {
                updateData.already = "Ready";
            }

            await updateProduct(id, updateData);

            // 更新完了後に、編集していた商品にスクロール
            productRefs.current[formProduct.id]?.scrollIntoView();
            window.confirm('商品を更新しました');
        } else {
            // 新規追加の場合の処理

            formProduct.materials = selectedMaterials;
            await addProduct(formProduct);
            window.confirm('商品を追加しました');
        }

        resetForm();
        const filteredProducts = await getFilteredProducts(selectedCategory, selectedStatus);
        setAllProducts(filteredProducts);
    };

    /** キャンセルボタンを押したときのハンドラ */
    const handleCancel = () => {
        resetForm();
        setMessage('キャンセルしました。');
    };

    /** 商品更新ボタンを押したときのハンドラ */
    const handleUpdateProducts = async () => {
        console.log("==== 商品の在庫状況と値段を最新化 ====");
        const isConfirmed = window.confirm('商品の在庫状況と値段を最新化しますか？');
        if (!isConfirmed) {
            window.alert('キャンセルしました。');
            return;
        }

        const allMaterials = await getAllMaterials();
        /** 在庫状況と値段を最新化した Product[] */
        const updatedProducts = allProducts.map(product => {
            console.log(product.name);
            // 商品に含まれる材料から在庫と値段を最新化
            let isAvailable = true;
            let price = 0;
            product.materials = product.materials.map(materialInProduct => {
                // 商品に含まれる材料の１つを特定
                const matchedMaterial = allMaterials.find((material) => material.id === materialInProduct.id) ?? false;

                // 在庫の有無を確認：一個でも足りない材料があれば売り切れ
                if (isAvailable) {
                    isAvailable = matchedMaterial
                        ? matchedMaterial.totalAmount - (materialInProduct.quantity / matchedMaterial.unitCapacity) >= 0
                        : false; // `isAvailable` を更新
                }

                // matchedMaterialが存在する場合のみ値段を計算
                if (matchedMaterial) {
                    price += matchedMaterial.unitPrice * (materialInProduct.quantity / matchedMaterial.unitCapacity);
                } else {
                    console.warn(`Material not found for ID: ${materialInProduct.id}`);
                }

                return materialInProduct; // 更新後の `materialInProduct` を返す
            });

            price = Math.ceil(price) + 50;  // 氷 + ソフトドリンク + 消耗品

            // 更新対象かどうか確認
            if ((product.isAvailable !== isAvailable) || (product.price !== price)) {
                product.isAvailable = isAvailable;
                product.price = price;
                updateProduct(product.id, {
                    isAvailable: product.isAvailable,
                    price: product.price,
                    name: product.name,
                });
                console.log(`${product.name} の情報をFirestoreに更新しました(` + product.id + ")");
            }
            return product; // 更新後の `product` を返す
        });

        setAllProducts(updatedProducts);
        window.confirm('商品の在庫状況と値段を最新化しました。');
    };

    /** ステータスフィルタの変更ハンドラ */
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const currentStatus = e.target.value;
        setSelectedStatus(currentStatus);
    };

    /** カテゴリフィルタの変更ハンドラ */
    const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const currentCategory = e.target.value;
        setSelectedCategory(currentCategory);
    };

    /** 商品を編集するハンドラ */
    const handleEditProduct = (product: Product) => {
        setFormProduct(product);  // 編集対象の商品をフォームにセット
        setIsEditing(true);  // 編集モードに切り替え

        setFormProduct(product);  // 編集モードで既存データをセット
        setSelectedMaterials(product.materials);

        // 編集フォームにスクロール
        formRef.current?.scrollIntoView();
    };

    /** 商品を削除するハンドラ */
    const handleDeleteRow = async (id: string) => {
        const isConfirmed = window.confirm('本当に削除しますか？');
        if (!isConfirmed) {
            window.alert('キャンセルしました。');
            return;
        }

        await deleteProduct(id);
        showMessage('商品を削除しました');
        const data = await getAllProducts();
        setAllProducts(data);
        setFilteredProducts(data);
    };


    return (
        <div>
            <h2>商品管理</h2>
            <div ref={formRef}>  {/* 編集フォームに参照を設定 */}
                <h3>商品登録 / 編集</h3>
                {message && <p style={{ color: 'red' }}>{message}</p>} {/* メッセージを表示 */}
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* エラーメッセージを表示 */}

                <div>
                    <label>商品名: </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="商品名"
                        value={formProduct.name}
                        onChange={handleInputChange}
                    />
                    <br />
                    <label>概要: </label>
                    <input
                        type="text"
                        name="summary"
                        placeholder="概要"
                        value={formProduct.summary}
                        onChange={handleInputChange}
                        style={{ width: '80%', fontSize: '1rem' }} // 幅とフォントサイズを調整
                    />
                    <br />
                    <label>説明: </label>
                    <textarea
                        name="description"
                        placeholder="説明"
                        value={formProduct.description}
                        onChange={handleInputChange}
                        rows={3} // ここで行数を指定
                        style={{ width: '80%', fontSize: '1rem' }} // 幅とフォントサイズを調整
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
                    <label>画像URL: </label>
                    <input
                        type="text"
                        name="imageUrl"
                        placeholder="画像URL"
                        value={formProduct.imageUrl}
                        onChange={handleInputChange}
                    />
                    <br />
                    <label>メソッド: </label>
                    <input
                        type="text"
                        name="method"
                        placeholder="メソッド"
                        value={formProduct.method}
                        onChange={handleInputChange}
                    />
                    <br />
                    <label>レシピ: </label>
                    <textarea
                        name="recipe"
                        placeholder="レシピ"
                        value={formProduct.recipe}
                        onChange={handleInputChange}
                        rows={5} // ここで行数を指定
                        style={{ width: '80%', fontSize: '1rem' }} // 幅とフォントサイズを調整
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

                    {/* 使用する材料のリスト */}
                    <h4>使用する材料</h4>
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
            </div>

            <h2>商品リスト</h2>
            <div>
                <button onClick={handleUpdateProducts}>商品最新化</button>
                <br />

                <label>ステータス選択: </label>
                <select value={selectedStatus} onChange={handleStatusChange}>
                    {statusesList.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>

                <br />
                <label>カテゴリ選択: </label>
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
                            <>
                                <ul>
                                    {filteredProducts.map(product => (
                                        <li
                                            key={product.id}
                                            ref={el => (productRefs.current[product.id] = el)}  // 各商品に対して参照を設定
                                        >
                                            <>
                                                <h4>{product.name}</h4>
                                                値段: ¥ {product.price.toLocaleString()} <br />
                                                カテゴリ: {product.categories.join(', ')} <br />
                                                ベース: {product.bases.join(', ')} <br />
                                                アルコール度数: {product.alc}% <br />
                                                色: {product.color} <br />
                                                材料: {product.materials.map(m => m.name).join(', ')} <br />
                                                在庫: {product.isAvailable ? 'あり' : 'なし'} <br />
                                                レシピ: {product.recipe} <br />
                                                準備完了： {product.already} <br />
                                                <button onClick={() => handleEditProduct(product)}>編集</button>
                                                <button onClick={() => handleDeleteRow(product.id)}>削除</button>
                                            </>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Products;
