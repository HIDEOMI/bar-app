import React, { useEffect, useState } from 'react';
import { Material } from "../../types/types"
import { getMaterials, addMaterial, updateMaterial, deleteMaterial } from '../../services/materials';
import MaterialForm from '../../components/MaterialForm';


const Materials: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);  // 編集中の材料

    useEffect(() => {
        const fetchMaterials = async () => {
            const data = await getMaterials();
            setMaterials(data);
        };
        fetchMaterials();
    }, []);

    const handleSaveMaterial = async (material: Material) => {
        if (material.id) {
            // 編集モードの場合、既存の材料を更新
            await updateMaterial(material.id, material);
        } else {
            // 新規追加モードの場合、新しい材料を追加

            await addMaterial(material);
        }
        const data = await getMaterials();
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
        const data = await getMaterials();
        setMaterials(data);
    };

    return (
        <div>
            <h2>材料管理</h2>
            {/* 新規追加または編集時に共通のフォームを表示 */}
            {editingMaterial ? (
                <MaterialForm
                    material={editingMaterial}
                    existingMaterials={materials}
                    onSave={handleSaveMaterial}
                    onCancel={handleCancelEdit}
                />
            ) : (
                <MaterialForm
                    material={{ id: '', name: '', totalAmount: 0, unit: '', unitCapacity: 0, category: '', note: '' }}  // 新規材料の初期値
                    existingMaterials={materials}
                    onSave={handleSaveMaterial}
                    onCancel={handleCancelEdit}
                />
            )}
            <h3>材料リスト</h3>
            <ul>
                {materials.map((material) => (
                    <li key={material.id}>
                        {material.name} - {material.totalAmount} {material.unit}:{material.unitCapacity} ({material.category}) <br />
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
