import React from "react";
import { signInWithGoogle } from "../services/auth";

const LoginPage: React.FC = () => {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to sign in: ", error);
    }
  };

  return (
    <div>
      <h1>ログイン</h1>
      <button onClick={handleSignIn}>Googleでサインイン</button>
    </div>
  );
};

export default LoginPage;
