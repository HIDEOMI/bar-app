import React, { useEffect, useState } from 'react';
import { Material } from "../../types/types"
import { getAllMaterials, addMaterial, updateMaterial, deleteMaterial } from '../../services/materials';


const Materials: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);  // 編集モードかどうかを管理
    const [message, setMessage] = useState<string | null>(null);  // メッセージを管理
    const [error, setError] = useState<string | null>(null);  // エラーメッセージの状態
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');  // 選択されたカテゴリ
    const [formMaterial, setFormMaterial] = useState<Material>({
        id: '',
        name: '',
        category: '',
        totalAmount: 0,
        unit: '',
        unitCapacity: 0,
        unitPrice: 0,
        note: ''
    });

    const categories = ['choose a category', '蒸留酒', '醸造酒', 'リキュール', 'ソフトドリンク', 'シロップ', 'その他'];  // カテゴリの選択肢  
    const filterCategories = ['All', '蒸留酒', '醸造酒', 'リキュール', 'ソフトドリンク', 'シロップ', 'その他'];  // カテゴリの選択肢  


    useEffect(() => {
        const fetchDatas = async () => {
            setLoading(true);
            try {
                const allMaterialsData = await getAllMaterials();
                setAllMaterials(allMaterialsData);
                setFilteredMaterials(allMaterialsData);  // 初期値としてすべての材料を表示
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
        setFormMaterial({
            id: '',
            name: '',
            category: '',
            totalAmount: 0,
            unit: '',
            unitCapacity: 0,
            unitPrice: 0,
            note: ''
        });  // 新規材料の初期値
        setIsEditing(false);  // 編集モードを解除
        setError(null);
    };


    /** 入力値が変更されたときに材料の情報を更新するハンドラ */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, type, value } = e.target;
        setFormMaterial({ ...formMaterial, [name]: type === "number" ? Number(value) : value });
    };

    /** 材料追加または編集するハンドラ */
    const handleSubmit = async () => {
        // バリデーション: 材料名が空欄
        if (formMaterial.name.trim() === '') {
            setError('材料名を入力してください。');
            return;
        }

        // バリデーション: 材料名が重複しているか
        const isDuplicate = allMaterials.some(
            (mat) => mat.name === formMaterial.name && mat.id !== formMaterial.id
        );
        if (isDuplicate) {
            setError('この材料名はすでに存在します。');
            return;
        }

        // バリデーション: カテゴリが未選択
        if (formMaterial.category.trim() === '') {
            setError('カテゴリを選択してください。');
            return;
        }

        // バリデーション: 単位が空欄
        if (formMaterial.unit.trim() === '') {
            setError('単位を入力してください。');
            return;
        }

        // バリデーション: 単位当たりの容量が空欄
        if (formMaterial.unitCapacity === 0) {
            setError('単位当たりの容量を入力してください。');
            return;
        }

        // バリデーション: 単価が空欄
        if (formMaterial.unitPrice === 0) {
            setError('単価を入力してください。');
            return;
        }

        if (isEditing) {
            const { id, ...updateData } = formMaterial;
            await updateMaterial(id, updateData);
            showMessage('材料を更新しました');
        } else {
            await addMaterial(formMaterial);
            showMessage('材料を追加しました');
        }

        resetForm();
        const allMaterialsData = await getAllMaterials();
        setAllMaterials(allMaterialsData);
        setFilteredMaterials(allMaterialsData);
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
            setFilteredMaterials(allMaterials);  // "All" を選んだ場合はすべての材料を表示
        } else {
            const filtered = allMaterials.filter((material) => material.category === category);
            setFilteredMaterials(filtered);  // 選択したカテゴリの材料だけを表示
        }
    };

    /** 材料を編集するハンドラ */
    const handleEditMaterial = (material: Material) => {
        setFormMaterial(material);  // 編集モードで既存データをセット
        setIsEditing(true);
    };

    /** 材料を削除するハンドラ */
    const handleDeleteMaterial = async (id: string) => {
        await deleteMaterial(id);
        showMessage('商品を削除しました');
        const data = await getAllMaterials();
        setAllMaterials(data);
        setFilteredMaterials(data);  // フィルタされたリストも更新
    };


    return (
        <div>
            <h2>材料管理</h2>

            <h3>材料登録 / 編集</h3>
            {message && <p style={{ color: 'red' }}>{message}</p>} {/* メッセージを表示 */}
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* エラーメッセージを表示 */}

            <div>
                <label >材料名: </label>
                <input
                    type="text"
                    name="name"
                    placeholder="材料名"
                    value={formMaterial.name}
                    onChange={handleChange}
                />
                <br />
                <label >カテゴリ: </label>
                <select
                    name="category"
                    value={formMaterial.category}
                    onChange={handleChange}
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <br />
                <label >数量: </label>
                <input
                    type="number"
                    name="totalAmount"
                    placeholder="数量"
                    value={formMaterial.totalAmount}
                    onChange={handleChange}
                />
                <br />
                <label >単位: </label>
                <input
                    type="text"
                    name="unit"
                    placeholder="単位"
                    value={formMaterial.unit}
                    onChange={handleChange}
                />
                <br />
                <label >単位当たりの容量: </label>
                <input
                    type="number"
                    name="unitCapacity"
                    placeholder="単位当たりの容量"
                    value={formMaterial.unitCapacity}
                    onChange={handleChange}
                />
                <br />
                <label >単価: </label>
                <input
                    type="number"
                    name="unitPrice"
                    placeholder="単価"
                    value={formMaterial.unitPrice}
                    onChange={handleChange}
                />
                <br />
                <label >備考: </label>
                {/* <textarea
                    name="note"
                    value={formMaterial.note}
                    // onChange={handleChange}
                /> */}
                <input
                    type="textarea"
                    name="note"
                    placeholder="備考"
                    value={formMaterial.note}
                    onChange={handleChange}
                />
                <br />

                <button onClick={handleSubmit}>{isEditing ? '材料を更新' : '材料を追加'}</button>
                <button onClick={handleCancel}>キャンセル</button>

            </div>

            <h3>材料リスト </h3>
            <div>
                <label>カテゴリ選択: </label>
                <select value={selectedCategory} onChange={handleCategoryChange}>
                    {filterCategories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                {loading ? (
                    <p>読み込み中...</p>
                ) : (
                    <div>
                        {filteredMaterials.length === 0 ? (
                            <p>該当する材料がありません。</p>
                        ) : (
                            <ul>
                                {filteredMaterials.map((material) => (
                                    <li key={material.id}>
                                        {material.name} - {material.totalAmount} {material.unit}:{material.unitCapacity} ({material.category}) <br />
                                        ￥: {material.unitPrice} <br />
                                        備考: {material.note} <br />
                                        <button onClick={() => handleEditMaterial(material)}>編集</button>
                                        <button onClick={() => handleDeleteMaterial(material.id)}>削除</button>
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

export default Materials;
