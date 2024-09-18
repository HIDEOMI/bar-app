import React, { useState, useEffect } from 'react';
import { Material } from '../types/types';


type MaterialFormProps = {
    material: Material;
    categories: string[];
    onSave: (material: Material) => void;
    onCancel: () => void;
    existingMaterials: Material[];  // 既存の材料リストを追加
};

const MaterialForm: React.FC<MaterialFormProps> = ({ material, categories, onSave, onCancel, existingMaterials }) => {
    const [formMaterial, setFormMaterial] = useState<Material>(material);
    const [error, setError] = useState<string | null>(null);  // エラーメッセージの状態


    useEffect(() => {
        setFormMaterial(material); // 編集時に既存データをフォームに設定
    }, [material]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, type, value } = e.target;
        setFormMaterial({ ...formMaterial, [name]: type === "number" ? Number(value) : value });
    };

    /** 保存ボタンを押したときの処理 */
    const handleSubmit = () => {
        // バリデーション: 材料名が空欄
        if (formMaterial.name.trim() === '') {
            setError('材料名を入力してください。');
            return;
        }

        // バリデーション: 材料名が重複しているか
        const isDuplicate = existingMaterials.some(
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

        setError(null); // エラーがない場合はエラーメッセージをリセット
        onSave(formMaterial); // 保存のコールバックを実行
    };

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* エラーメッセージを表示 */}
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
            <input
                type="text"
                name="note"
                placeholder="備考"
                value={formMaterial.note}
                onChange={handleChange}
            />
            <br />

            <button onClick={handleSubmit}>保存</button>
            <button onClick={onCancel}>キャンセル</button>
        </div>
    );
};

export default MaterialForm;
