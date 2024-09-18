import React, { useEffect, useState } from 'react';
import { Material } from "../../types/types"
import { getMaterials, addMaterial, updateMaterial, deleteMaterial } from '../../services/materials';


const Materials: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [newMaterial, setNewMaterial] = useState({ name: '', category: '', totalAmount: 0, unit: '', unitCapacity: 0, note: '' });
    const categories = ['choose a category', '蒸留酒', '醸造酒', 'リキュール', 'ソフトドリンク', 'シロップ', 'その他'];  // カテゴリの選択肢

    useEffect(() => {
        const fetchMaterials = async () => {
            const data = await getMaterials();
            setMaterials(data);
        };
        fetchMaterials();
    }, []);

    /** 新しい材料を追加する処理 */
    const handleAddMaterial = async () => {
        await addMaterial(newMaterial);
        setNewMaterial({ name: '', category: '', totalAmount: 0, unit: '', unitCapacity: 0, note: '' });
        // 材料リストを再取得
        const data = await getMaterials();
        setMaterials(data);
    };

    /** 材料を更新する処理 */
    const handleUpdateMaterial = async (id: string, updatedData: Partial<Material>) => {
        await updateMaterial(id, updatedData);
        const data = await getMaterials();
        setMaterials(data);
    };

    /** 材料を削除する処理 */
    const handleDeleteMaterial = async (id: string) => {
        await deleteMaterial(id);
        const data = await getMaterials();
        setMaterials(data);
    };

    return (
        <div>
            <div>
                <h2>材料管理</h2>
                <h3>新しい材料を追加</h3>
                <label>材料名: </label>
                <input
                    type="text"
                    placeholder="材料名"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                />
                <br />
                <label>カテゴリ: </label>
                <select
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
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
                    placeholder="数量"
                    value={newMaterial.totalAmount}
                    onChange={(e) => setNewMaterial({ ...newMaterial, totalAmount: Number(e.target.value) })}
                />
                <br />
                <label >単位: </label>
                <input
                    type="text"
                    placeholder="単位"
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                />
                <br />
                <label >単位当たりの容量:</label>
                <input
                    type="number"
                    placeholder="単位当たりの容量"
                    value={newMaterial.unitCapacity}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unitCapacity: Number(e.target.value) })}
                />
                <br />
                <label >備考:</label>
                <input
                    type="text"
                    placeholder="備考"
                    value={newMaterial.note}
                    onChange={(e) => setNewMaterial({ ...newMaterial, note: e.target.value })}
                />
                <br />
                <button onClick={handleAddMaterial}>追加</button>
            </div>
            <h3>材料リスト</h3>
            <ul>
                {materials.map((material) => (
                    <li key={material.id}>
                        {material.name} - {material.totalAmount} {material.unit}
                        {material.category}
                        {material.note}
                        <button onClick={() => handleUpdateMaterial(material.id, { totalAmount: material.totalAmount + 1 })}>+1</button>
                        <button onClick={() => handleUpdateMaterial(material.id, { totalAmount: material.totalAmount - 1 })}>-1</button>
                        <button onClick={() => handleDeleteMaterial(material.id)}>削除</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Materials;
