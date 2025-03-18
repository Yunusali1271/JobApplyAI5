import { db, storage } from "./firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot 
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export interface ApplicationKit {
  id?: string;
  userId: string;
  jobTitle: string;
  company: string;
  status: string;
  coverLetter: string;
  resume: string;
  followUpEmail: string;
  original?: {
    cv: string;
    jobDescription: string;
    formality: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Save a new application kit to Firestore and store documents in Firebase Storage
 */
export const saveApplicationKit = async (userId: string, kitData: Omit<ApplicationKit, "id" | "userId" | "createdAt" | "updatedAt">) => {
  try {
    // Create a reference to the application kit document
    const kitRef = await addDoc(collection(db, `users/${userId}/applicationKits`), {
      userId,
      ...kitData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Store the cover letter in Firebase Storage
    if (kitData.coverLetter) {
      const coverLetterRef = ref(storage, `users/${userId}/applicationKits/${kitRef.id}/coverLetter.txt`);
      await uploadString(coverLetterRef, kitData.coverLetter);
      const coverLetterUrl = await getDownloadURL(coverLetterRef);
      await updateDoc(kitRef, { coverLetterUrl });
    }

    // Store the resume in Firebase Storage
    if (kitData.resume) {
      const resumeRef = ref(storage, `users/${userId}/applicationKits/${kitRef.id}/resume.txt`);
      await uploadString(resumeRef, kitData.resume);
      const resumeUrl = await getDownloadURL(resumeRef);
      await updateDoc(kitRef, { resumeUrl });
    }

    // Store the follow-up email in Firebase Storage
    if (kitData.followUpEmail) {
      const followUpEmailRef = ref(storage, `users/${userId}/applicationKits/${kitRef.id}/followUpEmail.txt`);
      await uploadString(followUpEmailRef, kitData.followUpEmail);
      const followUpEmailUrl = await getDownloadURL(followUpEmailRef);
      await updateDoc(kitRef, { followUpEmailUrl });
    }

    return {
      id: kitRef.id,
      ...kitData
    };
  } catch (error) {
    console.error("Error saving application kit:", error);
    throw error;
  }
};

/**
 * Get all application kits for a user
 */
export const getUserApplicationKits = async (userId: string) => {
  try {
    const q = query(
      collection(db, `users/${userId}/applicationKits`),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting application kits:", error);
    throw error;
  }
};

/**
 * Get a single application kit by ID
 */
export const getApplicationKit = async (userId: string, kitId: string) => {
  try {
    const docRef = doc(db, `users/${userId}/applicationKits/${kitId}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error("Application kit not found");
    }
  } catch (error) {
    console.error("Error getting application kit:", error);
    throw error;
  }
};

/**
 * Update an application kit
 */
export const updateApplicationKit = async (userId: string, kitId: string, updates: Partial<ApplicationKit>) => {
  try {
    const kitRef = doc(db, `users/${userId}/applicationKits/${kitId}`);
    
    await updateDoc(kitRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: kitId,
      ...updates
    };
  } catch (error) {
    console.error("Error updating application kit:", error);
    throw error;
  }
};

/**
 * Delete an application kit
 */
export const deleteApplicationKit = async (userId: string, kitId: string) => {
  try {
    const kitRef = doc(db, `users/${userId}/applicationKits/${kitId}`);
    await deleteDoc(kitRef);
    return true;
  } catch (error) {
    console.error("Error deleting application kit:", error);
    throw error;
  }
}; 