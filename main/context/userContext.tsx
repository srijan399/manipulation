"use client";
import {
    useContext,
    createContext,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";

interface GoogleUser {
    id: string;
    name: string;
    email: string;
    image: string;
}

interface UserContextType {
    user: GoogleUser | null;
    setUser: Dispatch<SetStateAction<GoogleUser | null>>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const values = { user, setUser };

    return (
        <UserContext.Provider value={values}>{children}</UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
