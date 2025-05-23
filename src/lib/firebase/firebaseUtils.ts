import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

// Subscription functions
export const getUserSubscriptionStatus = async (uid: string) => {
  try {
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', uid));
    if (subscriptionDoc.exists()) {
      const subscriptionData = subscriptionDoc.data();
      // Convert any Timestamp objects to ISO strings for React compatibility
      const processedSubscription = Object.keys(subscriptionData).reduce((acc: Record<string, any>, key) => {
        const value = subscriptionData[key];
        if (value && typeof value.toDate === 'function') { // Check if it's a Timestamp
          acc[key] = value.toDate().toISOString();
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});
      return { hasSubscription: true, subscription: processedSubscription };
    } else {
      return { hasSubscription: false, subscription: null };
    }
  } catch (error) {
    console.error("Error fetching subscription status: assuming no subscription", error);
    return { hasSubscription: false, subscription: null };
  }
};


// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
