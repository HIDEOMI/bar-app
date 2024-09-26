import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


/** 認証認可状況を確認するロジック */
export const useAuth = () => {
    const authContext = useContext(AuthContext);
    // console.log(context);
    if (!authContext) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return authContext;
};
