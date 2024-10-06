import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { User } from '../../types/types';
import { getAllUsers, getUsersByRole, updateUser, deleteUser } from '../../services/users';
import { UserTable } from '../../components/UserTable';



const Users: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);  // 編集モードかどうかを管理
    const [message, setMessage] = useState<string | null>(null);  // メッセージを管理
    const [error, setError] = useState<string | null>(null);  // エラーメッセージの状態
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('All');  // 選択されたカテゴリ
    const [formUser, setFormUser] = useState<User>({
        id: "",
        email: "",
        role: "",
        displayName: "",
    });
    const [pendingUpdates, setPendingUpdates] = useState<{ [key: string]: any; id: string }[]>([]);

    const roleList = ['All', '未承認', 'user', 'engineer'];  // カテゴリの選択肢

    useEffect(() => {
        const fetchDatas = async () => {
            setLoading(true);
            try {
                const usersData = await getAllUsers();
                setAllUsers(usersData);
                setFilteredUsers(usersData);  // 初期値としてすべての材料を表示
                // console.log(usersData);
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
        setFormUser({
            id: "",
            email: "",
            role: "",
            displayName: "",
        });
        setIsEditing(false);  // 編集モードを解除
        setError(null);
    };


    /** 入力値が変更されたときにユーザの情報を更新するハンドラ */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormUser({ ...formUser, [name]: type === "number" ? Number(value) : value });
    };

    /** セレクトが変更されたときにユーザの情報を更新するハンドラ */
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, options } = e.target;
        const selectedValues = Array.from(options).filter(option => option.selected).map(option => option.value);
        setFormUser({ ...formUser, [name]: selectedValues });
    };

    /** ユーザ追加または編集するハンドラ */
    const handleSubmit = async () => {
        resetForm();
        const allUsersData = await getAllUsers();
        setAllUsers(allUsersData);
        setFilteredUsers(allUsersData);
    };

    /** キャンセルボタンを押したときのハンドラ */
    const handleCancel = () => {
        resetForm();
        setMessage('キャンセルしました。');
    };

    /** ユーザ更新ボタンを押したときのハンドラ */
    const handleUpdateUsers = async () => {
        console.log("==== ユーザの在庫状況と値段を最新化 ====");
        const isConfirmed = window.confirm('ユーザの在庫状況と値段を最新化しますか？');
        if (!isConfirmed) {
            window.alert('キャンセルしました。');
            return;
        }

        const allUsers = await getAllUsers();
        /** 在庫状況と値段を最新化した User[] */
        const updatedUsers = allUsers.map(user => {
            console.log(user.displayName);
            // ユーザに含まれる材料から在庫と値段を最新化
            let isAvailable = true;
            let price = 0;

            return user; // 更新後の `user` を返す
        });

        setAllUsers(updatedUsers);
        window.confirm('ユーザの在庫状況と値段を最新化しました。');
    };

    /** Roleフィルタの変更ハンドラ */
    const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const role = e.target.value;
        setSelectedRole(role);
        const filtered = await getUsersByRole(role);
        setFilteredUsers(filtered);
    };

    /** ユーザの値を変更したときに変更内容を保持するハンドラ */
    const handlePendingUpdate = async (updateInfo: { [key: string]: any; id: string; }) => {
        setPendingUpdates([...pendingUpdates, updateInfo]);
        console.log(pendingUpdates);
    };

    /** ユーザを編集するハンドラ */
    const handleEditUser = (user: User) => {
        setFormUser(user);  // 編集モードで既存データをセット
        setIsEditing(true);
    };

    /** ユーザを削除するハンドラ */
    const handleDeleteRow = async (id: string) => {
        const isConfirmed = window.confirm('本当に削除しますか？');
        if (!isConfirmed) {
            window.alert('キャンセルしました。');
            return;
        }

        await deleteUser(id);
        window.confirm('ユーザを削除しました。');
        const data = await getAllUsers();
        setAllUsers(data);
        setFilteredUsers(data);
    };


    return (
        <div>
            <h2>ユーザ管理</h2>
            <div>
                {/* <button onClick={handleUpdateUsers}>ユーザ最新化</button> */}
                {/* <br /> */}

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
                        {filteredUsers.length === 0 ? (
                            <p>There is not a user</p>
                        ) : (
                            <>
                                <UserTable
                                    users={filteredUsers}
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
