import React, { useEffect, useState } from 'react';
import { User } from '../../types/types';
import { getAllUsers, getUsersByRole, updateUser, deleteUser } from '../../services/users';
import { UserTable } from '../../components/UserTable';



const Users: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('All');  // 選択されたカテゴリ
    const [pendingUpdates, setPendingUpdates] = useState<{ [key: string]: any; id: string }[]>([]);

    const roles = ['user', 'engineer'];
    const roleList = ['All', '未承認', ...roles];  // カテゴリの選択肢

    useEffect(() => {
        const fetchDatas = async () => {
            setLoading(true);
            try {
                const filteredUsers = await getUsersByRole(selectedRole);
                setFilteredUsers(filteredUsers);
            } catch (error) {
                console.error("Error fetching datas: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatas();
    }, [selectedRole]);


    /** Roleフィルタの変更ハンドラ */
    const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const role = e.target.value;
        if (role === "未承認") {
            return setSelectedRole("");
        }

        setSelectedRole(role);
    };

    /** ユーザの変更内容をDBに保存するハンドラ
     * - firestoreへの書き込み回数を少なくするため、オブジェクトを再構築してから更新する
     * - 一度連想配列のオブジェクトを構築、同じIDのものをまとめてJSON形式で取得、最後にPromise.allで一括更新する
     */
    const handleSaveChanges = async () => {
        const isConfirmed = window.confirm('変更内容を保存しますか？');
        if (!isConfirmed) {
            window.confirm('変更をキャンセルしました');
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

        const updatePromises = Object.values(updateData).map((data) => updateUser(data.id, data));
        await Promise.all(updatePromises);
        setPendingUpdates([]);
        window.confirm('変更を保存しました');
    }

    /** ユーザの値を変更したときに変更内容を保持するハンドラ */
    const handlePendingUpdate = async (updateInfo: { [key: string]: any; id: string; }) => {
        setPendingUpdates([...pendingUpdates, updateInfo]);
        console.log(pendingUpdates);
    };

    /** 削除ボタンが押されたとき、ユーザを削除するハンドラ
     * - 削除実行前に確認メッセージを表示
     * - キャンセルボタンが押された場合、その旨メッセージ表示
     */
    const handleDeleteRow = async (id: string) => {
        const isConfirmed = window.confirm('本当に削除しますか？');
        if (!isConfirmed) {
            window.alert('キャンセルしました。');
            return;
        }

        await deleteUser(id);
        window.confirm('ユーザを削除しました。');

        const filteredUsers = await getUsersByRole(selectedRole);
        setFilteredUsers(filteredUsers);
    };


    return (
        <div>
            <h2>ユーザ管理</h2>
            <div>

                <label>Select Role: </label>
                <select value={selectedRole} onChange={handleRoleChange}>
                    {roleList.map((role) => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>


                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div>
                        <button onClick={handleSaveChanges}>ユーザ最新化</button>

                        {filteredUsers.length === 0 ? (
                            <p>There is not a user</p>
                        ) : (
                            <>
                                <UserTable
                                    users={filteredUsers}
                                    roles={roles}
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

export default Users;
