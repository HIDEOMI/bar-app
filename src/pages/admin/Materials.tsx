import React, { useEffect, useState } from 'react';
import { Material } from "../../types/types"
import { getAllMaterials, addMaterial, updateMaterial, deleteMaterial } from '../../services/materials';
import MaterialForm from '../../components/MaterialForm';


const Materials: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);  // フィルタされた材料
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);  // 編集中の材料
    const [selectedCategory, setSelectedCategory] = useState<string>('全て');  // 選択されたカテゴリ

    const categories = ['choose a category', '蒸留酒', '醸造酒', 'リキュール', 'ソフトドリンク', 'シロップ', 'その他'];  // カテゴリの選択肢  
    const filterCategories = ['All', '蒸留酒', '醸造酒', 'リキュール', 'ソフトドリンク', 'シロップ', 'その他'];  // カテゴリの選択肢  

    useEffect(() => {
        const fetchMaterials = async () => {
            const data = await getAllMaterials();
            setMaterials(data);
            setFilteredMaterials(data);  // 初期値としてすべての材料を表示
        };
        fetchMaterials();
    }, []);

    /** カテゴリフィルタの変更ハンドラ */
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        setSelectedCategory(category);

        if (category === 'All') {
            setFilteredMaterials(materials);  // "All" を選んだ場合はすべての材料を表示
        } else {
            const filtered = materials.filter((material) => material.category === category);
            setFilteredMaterials(filtered);  // 選択したカテゴリの材料だけを表示
        }
    };

    /** 保存ボタンのハンドラ */
    const handleSaveMaterial = async (material: Material) => {
        if (material.id) {
            // 編集モードの場合、既存の材料を更新
            await updateMaterial(material.id, material);
        } else {
            // 新規追加モードの場合、新しい材料を追加
            await addMaterial(material);
        }
        const data = await getAllMaterials();
        setMaterials(data);
        setEditingMaterial(null); // フォームをリセット
    };

    const handleEditMaterial = (material: Material) => {
        setEditingMaterial(material);
    };

    const handleCancelEdit = () => {
        setEditingMaterial(null);  // 編集モードを解除
    };

    /** 材料を削除する処理 */
    const handleDeleteMaterial = async (id: string) => {
        await deleteMaterial(id);
        const data = await getAllMaterials();
        setMaterials(data);
        setFilteredMaterials(data);  // フィルタされたリストも更新
    };

    return (
        <div>
            <h2>材料管理</h2>

            {/* 新規追加または編集時に共通のフォームを表示 */}
            {editingMaterial ? (
                <MaterialForm
                    material={editingMaterial}
                    categories={categories.filter(c => c !== 'All')}  // "All" を除いたカテゴリを渡す
                    existingMaterials={materials}
                    onSave={handleSaveMaterial}
                    onCancel={handleCancelEdit}
                />
            ) : (
                <MaterialForm
                    material={{ id: '', name: '', category: '', totalAmount: 0, unit: '', unitCapacity: 0, unitPrice: 0, note: '' }}  // 新規材料の初期値
                    categories={categories.filter(c => c !== 'All')}  // "All" を除いたカテゴリを渡す
                    existingMaterials={materials}
                    onSave={handleSaveMaterial}
                    onCancel={handleCancelEdit}
                />
            )}

            <h3>材料リスト</h3>

            {/* カテゴリフィルタのプルダウン */}
            <select value={selectedCategory} onChange={handleCategoryChange}>
                {filterCategories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>

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
        </div>
    );
};

export default Materials;
