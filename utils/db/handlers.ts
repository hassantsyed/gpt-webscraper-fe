import { db } from '../../firebase-config';
import { doc, setDoc, getDoc, onSnapshot, updateDoc, collection, where, query, getDocs, serverTimestamp, addDoc } from 'firebase/firestore';
import { BaseUser, CreateScrapeInput, Scrape } from '../interfaces';
// import { BlobServiceClient } from '@azure/storage-blob';
// import { v4 as uuidv4 } from 'uuid';

export const updateUserDoc = async (uid: string, data: Partial<BaseUser>) => {
  const userRef = doc(db, `User/${uid}`);
  try {
    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

export const upsertUser = async (user: BaseUser) => {
  const userRef = doc(db, `User/${user.uid}`);
  try {
    const doc = await getDoc(userRef);
    if (!doc.exists()) {
      const userObj = { ...user };
      userObj.plan = "FREE";
      await setDoc(userRef, userObj);
      return userObj;
    } else {
      return { ...doc.data() }
    }
  } catch (exc) {
    console.log(exc);
    throw exc;
  }
};

export const getUserDoc = async (uid: string) => {
  const userRef = doc(db, `User/${uid}`);
  try {
    const doc = await getDoc(userRef);
    if (doc.exists()) {
      return doc.data();
    } else {
      return null;
    }
  } catch (exc) {
    console.log(exc);
    throw exc;
  }
};

export const getUserByStripeCustomerId = async (stripeCustomerId: string): Promise<BaseUser | null> => {
  try {
    const usersRef = collection(db, 'User');
    const q = query(usersRef, where('stripeCustomerId', '==', stripeCustomerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Assuming there's only one user with this stripeCustomerId
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as BaseUser;
    return { ...userData, uid: userDoc.id };
  } catch (error) {
    console.error('Error fetching user by Stripe Customer ID:', error);
    throw error;
  }
};

export const listScrapes = async (user: BaseUser): Promise<Scrape[]> => {
    const scrapesRef = collection(db, "User", user.uid, "Scrape");
    try {
      const snapshot = await getDocs(scrapesRef);
      const res: Scrape[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as Scrape));
      return res;
    } catch (exc) {
      console.log(exc);
      throw exc;
    }
  };


export const getScrapeDateString = (createdTS: number | null): string => {
    if (!createdTS) {
      return 'Date unavailable';
    }
    
    // Assuming createdTS is in seconds
    const date = new Date(createdTS * 1000);
    
    return date.toLocaleString();
};

export const createScrape = async (user: BaseUser, scrapeInput: CreateScrapeInput) => {
    console.log("creating scrape");
    try {
      const docRef = await addDoc(collection(db, "User", user.uid, "Scrape"), {
        status: "pending",
        created: serverTimestamp(),
        done: null,
        url: scrapeInput.url,
        fields: scrapeInput.fields,
        html_blob_id: null,
        result_id: null,
        retry_count: 0,
      });
      return docRef.id;
    } catch (exc) {
      console.log(exc);
      throw exc;
    }
  };
  
export const createScrapes = async (user: BaseUser, scrapeInputs: CreateScrapeInput[]) => {
    const sids = await Promise.all(
        scrapeInputs.map((scrapeInput) => {
            return createScrape(user, scrapeInput);
        })
    );
    console.log(sids);
    await Promise.all(sids.map(async (sid) => {
      try {
        const response = await fetch('/api/trigger-scraping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: user.uid, sid }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await response.json();
      } catch (error) {
        console.error('Error triggering scraping:', error);
      }
    }));
};

export const getScrape = async (user: BaseUser, scrapeId: string) => {
    const scrapeRef = doc(db, `/User/${user.uid}/Scrape/${scrapeId}`);
    try {
      const doc = await getDoc(scrapeRef);
      if (doc.exists()) {
        return doc.data();
      } else {
        return null;
      }
    } catch (exc) {
      console.log(exc);
      throw exc;
    }
  };
  