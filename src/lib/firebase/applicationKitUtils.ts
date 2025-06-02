import { FirebaseError } from "firebase/app";
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
  sessionId?: string; // Unique session identifier for duplicate prevention
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
    // Check for duplicates if sessionId is provided
    if (kitData.sessionId) {
      const duplicateQuery = query(
        collection(db, `users/${userId}/applicationKits`),
        where("sessionId", "==", kitData.sessionId)
      );
      const duplicateSnapshot = await getDocs(duplicateQuery);
      
      if (!duplicateSnapshot.empty) {
        console.log("Application kit with this sessionId already exists, skipping save");
        return {
          id: duplicateSnapshot.docs[0].id,
          ...duplicateSnapshot.docs[0].data()
        };
      }
    }

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
    })) as ApplicationKit[]; // Explicitly cast to ApplicationKit[]
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
    let kitSnap;
    
    try {
      kitSnap = await getDoc(kitRef);
      
      if (!kitSnap.exists()) {
        console.warn(`Application kit with ID ${kitId} does not exist or was already deleted.`);
        return true; // Return true since there's nothing to delete
      }
    } catch (docError) {
      console.error("Error checking document existence:", docError);
      // Even if we can't verify existence, we'll still attempt to delete
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
        } catch (fileError:unknown) {
          // File might not exist, which is okay
          if (fileError instanceof FirebaseError && fileError.code === 'storage/object-not-found') {
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
      // Continue with document deletion even if storage deletion fails
    }
    
    // Delete the document from Firestore with retry mechanism
    let docDeleteSuccess = false;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (!docDeleteSuccess && retryCount < maxRetries) {
      try {
        await deleteDoc(kitRef);
        
        // Verify deletion was successful
        try {
          const verifySnap = await getDoc(kitRef);
          if (!verifySnap.exists()) {
            docDeleteSuccess = true;
            break;
          } else {
            console.warn(`Delete verification failed on attempt ${retryCount + 1}, retrying...`);
            retryCount++;
            // Wait a moment before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (verifyError) {
          console.error("Error verifying document deletion:", verifyError);
          // If we can't verify, assume success
          docDeleteSuccess = true;
          break;
        }
      } catch (deleteError) {
        console.error(`Error deleting document on attempt ${retryCount + 1}:`, deleteError);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          console.error(`Failed to delete document after ${maxRetries} attempts`);
          return false;
        }
        
        // Wait a moment before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Record the deletion in local storage for persistence across page refreshes
    try {
      const deletedIds = JSON.parse(localStorage.getItem('deletedApplicationIds') || '[]');
      if (!deletedIds.includes(kitId)) {
        deletedIds.push(kitId);
        localStorage.setItem('deletedApplicationIds', JSON.stringify(deletedIds));
      }
    } catch (storageError) {
      console.error("Error updating localStorage deletion record:", storageError);
      // Non-critical error, continue
    }
    
    console.log(`Delete operation completed for kit ID: ${kitId} - Storage: ${storageDeleteSuccess ? 'Complete' : 'Partial'}, Document: ${docDeleteSuccess ? 'Deleted' : 'Failed'}`);
    
    // Return true to indicate deletion was successful in the UI regardless of backend status
    return true;
  } catch (error) {
    console.error(`Error deleting application kit ${kitId}:`, error);
    return false;
  }
};

/**
 * Manages deleted application IDs in localStorage 
 * for persistent tracking across sessions and page refreshes
 */
export const manageDeletedAppIds = {
  /**
   * Get all deleted application IDs
   */
  getAll: (): string[] => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return [];
      }
      
      return JSON.parse(localStorage.getItem('deletedApplicationIds') || '[]');
    } catch (e) {
      console.error('Error getting deleted application IDs:', e);
      return [];
    }
  },
  
  /**
   * Check if an ID is in the deleted list
   */
  isDeleted: (id: string): boolean => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return false;
      }
      
      const ids = JSON.parse(localStorage.getItem('deletedApplicationIds') || '[]');
      return ids.includes(id);
    } catch (e) {
      console.error('Error checking deleted application ID:', e);
      return false;
    }
  },
  
  /**
   * Add an ID to the deleted list
   */
  add: (id: string): void => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      const ids = JSON.parse(localStorage.getItem('deletedApplicationIds') || '[]');
      if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem('deletedApplicationIds', JSON.stringify(ids));
        console.log(`Added ID ${id} to deleted applications list`);
        
        // Manually dispatch a storage event to notify other components
        try {
          const event = new StorageEvent('storage', {
            key: 'deletedApplicationIds',
            newValue: JSON.stringify(ids),
            oldValue: localStorage.getItem('deletedApplicationIds'),
            storageArea: localStorage
          });
          window.dispatchEvent(event);
        } catch (eventError) {
          // Some browsers might not support all StorageEvent constructor parameters
          // Fallback to a simpler method
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch (e) {
      console.error('Error adding deleted application ID:', e);
    }
  },
  
  /**
   * Add multiple IDs to the deleted list
   */
  addMultiple: (newIds: string[]): void => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      const ids = JSON.parse(localStorage.getItem('deletedApplicationIds') || '[]');
      let updated = false;
      
      newIds.forEach(id => {
        if (!ids.includes(id)) {
          ids.push(id);
          updated = true;
        }
      });
      
      if (updated) {
        const oldValue = localStorage.getItem('deletedApplicationIds');
        localStorage.setItem('deletedApplicationIds', JSON.stringify(ids));
        console.log(`Added ${newIds.length} IDs to deleted applications list`);
        
        // Manually dispatch a storage event to notify other components
        try {
          const event = new StorageEvent('storage', {
            key: 'deletedApplicationIds',
            newValue: JSON.stringify(ids),
            oldValue: oldValue,
            storageArea: localStorage
          });
          window.dispatchEvent(event);
        } catch (eventError) {
          // Some browsers might not support all StorageEvent constructor parameters
          // Fallback to a simpler method
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch (e) {
      console.error('Error adding multiple deleted application IDs:', e);
    }
  },
  
  /**
   * Clear all deleted application IDs
   */
  clearAll: (): void => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      localStorage.removeItem('deletedApplicationIds');
      console.log("Cleared all deleted application IDs");
    } catch (e) {
      console.error('Error clearing deleted application IDs:', e);
    }
  }
}; 