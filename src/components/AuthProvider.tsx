import React, { useEffect, useState } from "react";
import { User } from "../types/types";
import { onAuthStateChange } from "../services/auth";
import { getUserDataById, iAmOwer } from '../services/users';
import { AuthContext } from "../context/AuthContext";

/** 認証認可状態を監視するラッパー */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isFriend, setIsFriend] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (user) => {
            if (user) {
                const userData = await getUserDataById(user.uid);
                setUser({ ...user, ...userData });
                setIsAdmin(await iAmOwer(user.uid));
                setIsFriend(userData?.isFriend || false);
            } else {
                setUser(null);
                setIsAdmin(false);
                setIsFriend(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, loading, isAdmin, isFriend }}>
            {/* 下階層のコンポーネントを内包する */}
            {!loading && children}
        </AuthContext.Provider>
    );
};
