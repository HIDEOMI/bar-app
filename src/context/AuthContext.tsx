import { createContext } from "react";

type AuthContextType = {
    user: any | null;
    loading: boolean;
    isAdmin: boolean;
    isFriend: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
