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
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";

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
    console.log(`Fetching application kits for user: ${userId}`);
    
    const q = query(
      collection(db, `users/${userId}/applicationKits`),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    
    // Log the number of documents returned
    console.log(`Found ${snapshot.docs.length} application kits for user ${userId}`);
    
    // Always return an array, even if empty
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting application kits:", error);
    // Return empty array instead of throwing to prevent UI from crashing
    return [];
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
    console.log(`Attempting to delete kit: ${kitId} for user: ${userId}`);
    
    // First, get the kit data to ensure it exists
    const kitRef = doc(db, `users/${userId}/applicationKits/${kitId}`);
    const kitSnap = await getDoc(kitRef);
    
    if (!kitSnap.exists()) {
      console.warn(`Application kit with ID ${kitId} does not exist or was already deleted.`);
      return true; // Return true since there's nothing to delete
    }
    
    // Delete files from Firebase Storage first to ensure complete cleanup
    let storageDeleteSuccess = true;
    try {
      console.log(`Deleting storage files for kit ID: ${kitId}`);
      
      // Define all possible file paths that might exist for this kit
      const filePaths = [
        `users/${userId}/applicationKits/${kitId}/coverLetter.txt`,
        `users/${userId}/applicationKits/${kitId}/resume.txt`, 
        `users/${userId}/applicationKits/${kitId}/followUpEmail.txt`
      ];
      
      // Create references and delete each file with proper error handling
      const deletePromises = filePaths.map(async (path) => {
        try {
          const fileRef = ref(storage, path);
          await deleteObject(fileRef);
          console.log(`Successfully deleted file: ${path}`);
          return true;
        } catch (fileError) {
          // File might not exist, which is okay
          if (fileError.code === 'storage/object-not-found') {
            console.log(`File not found (normal): ${path}`);
            return true;
          }
          console.error(`Error deleting file ${path}:`, fileError);
          return false;
        }
      });
      
      // Wait for all storage deletions to complete
      const results = await Promise.all(deletePromises);
      storageDeleteSuccess = results.every(result => result === true);
      
      if (!storageDeleteSuccess) {
        console.warn(`Some files could not be deleted for kit ID: ${kitId}`);
      }
    } catch (storageError) {
      console.error("Error during storage deletion process:", storageError);
      storageDeleteSuccess = false;
    }
    
    // Delete the document from Firestore
    await deleteDoc(kitRef);
    
    // Verify deletion was successful
    const verifySnap = await getDoc(kitRef);
    if (verifySnap.exists()) {
      console.error(`Failed to delete document for kit ID: ${kitId}`);
      return false;
    }
    
    console.log(`Successfully deleted kit ID: ${kitId} - Storage cleanup ${storageDeleteSuccess ? 'complete' : 'partial'}`);
    return true;
  } catch (error) {
    console.error(`Error deleting application kit ${kitId}:`, error);
    return false;
  }
}; 