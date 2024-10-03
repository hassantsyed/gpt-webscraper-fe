import { createContext, useContext, Context, ReactNode } from "react";
import useFirebaseAuth from "@/components/hooks/useFirebaseAuth";
import { BaseUser } from "@/utils/interfaces";


const authUserContext = createContext({
  authUser: null as BaseUser | null,
  userLoading: true,
  signIn: async (): Promise<BaseUser | null> => { return null },
  logout: async () => {},
  getIdToken: async (): Promise<string | null> => { return null },
});

export function AuthUserProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  return <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>
}

export const useAuth = () => useContext(authUserContext);
