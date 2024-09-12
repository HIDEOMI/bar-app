import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import app from './firebase';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Googleサインインの関数
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error during sign in: ", error);
    throw error;
  }
};

// サインアウトの関数
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error during sign out: ", error);
    throw error;
  }
};

// 認証状態を監視する関数
export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
