import React, { useEffect, useState } from 'react';
import { Material } from "../../types/types"
import { getAllMaterials, addMaterial, updateMaterial, deleteMaterial, getMaterialsByCategory } from '../../services/materials';
import { MaterialTable } from '../../components/MaterialTable';


const Materials: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);  // 編集モードかどうかを管理
    const [message, setMessage] = useState<string | null>(null);  // メッセージを管理
    const [error, setError] = useState<string | null>(null);  // エラーメッセージの状態
    const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');  // 選択されたカテゴリ
    const [formMaterial, setFormMaterial] = useState<Material>({
        id: '',
        name: '',
        category: '',
        totalAmount: 0,
        unitCapacity: 0,
        unitPrice: 0,
        note: '',
        url: "",
        teiban: "",
    });
    const [pendingUpdates, setPendingUpdates] = useState<{ [key: string]: any; id: string }[]>([]);

    const categories = ['choose a category', '醸造酒', '蒸留酒', 'リキュール', 'ソフトドリンク', 'シロップ', 'その他'];  // カテゴリの選択肢
    const filterCategories = ['All', '醸造酒', '蒸留酒', 'リキュール', 'ソフトドリンク', 'シロップ', 'その他'];  // カテゴリの選択肢

    useEffect(() => {
        const fetchDatas = async () => {
            setLoading(true);
            try {
                const filteredMaterials = await getMaterialsByCategory(selectedCategory);
                setMaterials(filteredMaterials);
            } catch (error) {
                console.error("Error fetching datas: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatas();
    }, []);

    /** フォームのリセット処理 */
    const resetForm = () => {
        setFormMaterial({
            id: '',
            name: '',
            category: '',
            totalAmount: 0,
            unitCapacity: 0,
            unitPrice: 0,
            note: '',
            url: "",
            teiban: "",
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
        const isDuplicate = materials.some(
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
            window.confirm('材料を更新しました');
        } else {
            await addMaterial(formMaterial);
            window.confirm('材料を追加しました');
        }

        resetForm();
        const allMaterials = await getAllMaterials();
        setMaterials(allMaterials);
    };

    /** キャンセルボタンを押したときのハンドラ */
    const handleCancel = () => {
        resetForm();
        setMessage('キャンセルしました。');
    };

    /** カテゴリフィルタの変更ハンドラ */
    const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        setSelectedCategory(category);
        setMaterials(await getMaterialsByCategory(category));
    };

    /** 材料の変更内容をDBに保存するハンドラ
     * - firestoreへの書き込み回数を少なくするため、オブジェクトを再構築してから更新する
     * - 一度連想配列のオブジェクトを構築、同じIDのものをまとめてJSON形式で取得、最後にPromise.allで一括更新する
     */
    const handleSaveChanges = async () => {
        const isConfirmed = window.confirm('変更内容を保存しますか？');
        if (!isConfirmed) {
            window.confirm('変更をキャンセルしました');
            const allMaterials = await getAllMaterials();
            setMaterials(allMaterials);
            return;
        }

        const updateData = pendingUpdates.reduce((acc, update) => {
            const { id, ...data } = update;
            if (!acc[id]) {
                acc[id] = { id, ...data };
            } else {
                acc[id] = { ...acc[id], ...data };
            }
            return acc;
        }, {} as { [key: string]: any });

        const updatePromises = Object.values(updateData).map((data) => updateMaterial(data.id, data));
        await Promise.all(updatePromises);
        setPendingUpdates([]);
        window.confirm('変更を保存しました');
    }

    /** 材料の値を変更したときに変更内容を保持するハンドラ */
    const handlePendingUpdate = async (updateInfo: { [key: string]: any; id: string; }) => {
        setPendingUpdates([...pendingUpdates, updateInfo]);
        console.log(pendingUpdates);
    };

    /** 削除ボタンが押されたとき、材料を削除するハンドラ
     * - 削除実行前に確認メッセージを表示
     * - キャンセルボタンが押された場合、その旨メッセージ表示
     */
    const handleDeleteRow = async (id: string) => {
        const isConfirmed = window.confirm('本当に削除しますか？');
        if (isConfirmed) {
            await deleteMaterial(id);
            const allMaterials = await getAllMaterials();
            setMaterials(allMaterials);
            window.confirm('材料を削除しました');
        } else {
            window.confirm('削除をキャンセルしました');
        }
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

            <h2>材料リスト </h2>
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
                        {materials.length === 0 ? (
                            <p>該当する材料がありません。</p>
                        ) : (
                            <>
                                <button onClick={handleSaveChanges}>全体を更新する</button>
                                <MaterialTable
                                    materials={materials}
                                    handlePendingUpdate={handlePendingUpdate}
                                    handleDeleteRow={handleDeleteRow}
                                />
                            </>
                        )}
                    </div>

                )}
            </div>
        </div >
    );
};

export default Materials;
