import React, { useEffect, useState } from 'react';
import { getMaterials, addMaterial, updateMaterial, deleteMaterial } from '../../services/materials';
import { Material } from "../../types/types"


const Materials: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [newMaterial, setNewMaterial] = useState({ name: '', quantity: 0, unit: '' });

    useEffect(() => {
        const fetchMaterials = async () => {
            const data = await getMaterials();
            setMaterials(data);
        };
        fetchMaterials();
    }, []);

    const handleAddMaterial = async () => {
        await addMaterial(newMaterial);
        setNewMaterial({ name: '', quantity: 0, unit: '' });
        // 材料リストを再取得
        const data = await getMaterials();
        setMaterials(data);
    };

    const handleUpdateMaterial = async (id: string, updatedData: Partial<Material>) => {
        await updateMaterial(id, updatedData);
        const data = await getMaterials();
        setMaterials(data);
    };

    const handleDeleteMaterial = async (id: string) => {
        await deleteMaterial(id);
        const data = await getMaterials();
        setMaterials(data);
    };

    return (
        <div>
            <h2>材料管理</h2>
            <h3>新しい材料を追加</h3>
            <input
                type="text"
                placeholder="材料名"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
            />
            <input
                type="number"
                placeholder="数量"
                value={newMaterial.quantity}
                onChange={(e) => setNewMaterial({ ...newMaterial, quantity: Number(e.target.value) })}
            />
            <input
                type="text"
                placeholder="単位"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
            />
            <button onClick={handleAddMaterial}>追加</button>

            <h3>材料リスト</h3>
            <ul>
                {materials.map((material) => (
                    <li key={material.id}>
                        {material.name} - {material.quantity} {material.unit}
                        <button onClick={() => handleUpdateMaterial(material.id, { quantity: material.quantity + 1 })}>+1</button>
                        <button onClick={() => handleUpdateMaterial(material.id, { quantity: material.quantity - 1 })}>-1</button>
                        <button onClick={() => handleDeleteMaterial(material.id)}>削除</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Materials;
