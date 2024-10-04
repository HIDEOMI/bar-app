import { createContext } from "react";

type AuthContextType = {
    user: any | null;
    loading: boolean;
    isAdmin: boolean;
    isEngineer: boolean;
    isUser: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
