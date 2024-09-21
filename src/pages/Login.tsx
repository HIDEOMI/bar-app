import React from "react";
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from "../services/auth";

const Login: React.FC = () => {
    const navigate = useNavigate();  // useNavigate フックを使って navigate 関数を取得
    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
            navigate("/");  // ログイン後にメインメニューにリダイレクト
        } catch (error) {
            console.error("Failed to sign in: ", error);
        }
    };

    return (
        <div>
            <h1>ようこそ！！！</h1>
            <p>ログインしてください</p>
            <button onClick={handleSignIn}>Googleでサインイン</button>
        </div>
    );
};

export default Login;
