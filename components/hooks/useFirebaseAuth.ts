import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth, provider } from "@/firebase-config";
import { BaseUser, Plan } from "@/utils/interfaces";
import { upsertUser, getUserDoc } from "@/utils/db/handlers";

const formatAuthUser = (user: User): BaseUser => {
  return {
    uid: user.uid,
    email: user.email || "",
    plan: "FREE" as Plan,
    stripeCustomerId: null,
    subscriptionId: null,
    monthlyScrapeCount: 0
  };
};

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<BaseUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const getIdToken = async () => {
    const user = auth.currentUser;
    if (user) {
      return user.getIdToken();
    }
    return null;
  };

  const signIn = async () => {
    console.log("in sign in");
    setUserLoading(true);
    return setPersistence(auth, browserLocalPersistence).then(() => {
      return signInWithPopup(auth, provider)
        .then(async (data) => {
          const formattedUser = formatAuthUser(data.user);
          const user = await upsertUser(formattedUser) as BaseUser;
          setAuthUser(user);
          setUserLoading(false);
          return user;
        })
        .catch((err) => {
          setAuthUser(null);
          setUserLoading(false);
          console.log(err);
          return null;
        });
    });
  };

  const logout = async () => {
    signOut(auth).then(() => {
      setAuthUser(null);
      setUserLoading(false);
    });
  };

  const authStateChanged = async (authState: User | null) => {
    if (!authState) {
      setAuthUser(null);
      setUserLoading(false);
      return;
    }

    setUserLoading(true);
    var formattedUser = formatAuthUser(authState);
    const user = await getUserDoc(formattedUser.uid);
    setAuthUser(user as BaseUser);
    setUserLoading(false);
  };

  // listen for Firebase state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, authStateChanged);
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    userLoading,
    signIn,
    logout,
    getIdToken
  };
}