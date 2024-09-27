import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { User } from '../types/types'
import { logout } from '../services/auth';
import { getUserDataById } from '../services/users';


const Navbar: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);  // ログイン状態を管理
    const [userData, setUserData] = useState<User | null>(null);
    const navigate = useNavigate();  // useNavigate フックを使って navigate 関数を取得


    useEffect(() => {
        // 認証状態を監視
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);  // ユーザーがログインしている場合
                const fetchUserData = async () => {
                    const data = await getUserDataById(user.uid);  // ユーザー情報を取得する非同期関数
                    setUserData(data);
                };
                fetchUserData();
            } else {
                setIsLoggedIn(false);  // ユーザーがログアウトしている場合
            }
        });

        // コンポーネントがアンマウントされたときに監視を解除
        return () => unsubscribe();
    }, []);

    /** ログアウトする処理 */
    const handleLogout = async () => {
        try {
            await logout();  // ログアウト処理を実行
            navigate('/login');  // ログアウト後にログインページにリダイレクト
            setUserData(null);
        } catch (error) {
            console.error('ログアウトに失敗しました: ', error);
        }
    };

    // ログインしていない場合はナビゲーションバーを非表示にする
    if (!isLoggedIn) {
        return null;
    }


    return (
        <nav>
            <ul style={{ display: 'flex', listStyle: 'none', padding: 0 }}>
                <li style={{ marginRight: '20px' }}>
                    <Link to="/">メインメニュー</Link>
                </li>
                <li style={{ marginRight: '20px' }}>
                    <Link to="/my_orders">注文履歴</Link>
                </li>
                <li style={{ marginRight: '20px' }}>
                    <Link to="/payment">支払い確認</Link>
                </li>
                <li>
                    <Link to="/admin">管理者ダッシュボード</Link>
                </li>
            </ul>
            <div>
                <p> ようこそ {userData && userData.displayName} さん</p>
                <button onClick={handleLogout}>ログアウト</button>
            </div>
        </nav>
    );
};

export default Navbar;
