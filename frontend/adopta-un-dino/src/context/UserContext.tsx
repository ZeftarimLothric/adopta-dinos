import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";

interface User {
  username: string;
  role: "admin" | "user";
  points: number;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUser: function (): void {
    throw new Error("Function not implemented.");
  },
  loading: false,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false); // <-- indicamos que ya terminamos de cargar
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider
      value={{ user, token, login, logout, updateUser, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};
