import { db } from "@/lib/firebase/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  increment, 
  serverTimestamp 
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // Get the IP address
    const forwardedFor = headers().get('x-forwarded-for');
    const realIp = headers().get('x-real-ip');
    let ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    // Create a hash of the IP for privacy
    const ipHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(ip)
    ).then(hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    );
    
    // Check if this IP has created a pack before
    const ipDocRef = doc(db, 'ipTracking', ipHash);
    const ipDoc = await getDoc(ipDocRef);
    
    if (ipDoc.exists()) {
      const data = ipDoc.data();
      
      // Update the count and last access time
      await setDoc(ipDocRef, {
        count: increment(1),
        lastAccess: serverTimestamp()
      }, { merge: true });
      
      // If they've already created a pack, return false (not allowed)
      if (data.count >= 1) {
        return NextResponse.json({ 
          allowed: false,
          message: 'You have already created a Hire Me Pack. Please log in to create more.'
        });
      }
    } else {
      // First time user, create entry
      await setDoc(ipDocRef, {
        count: 1,
        firstAccess: serverTimestamp(),
        lastAccess: serverTimestamp()
      });
    }
    
    // Allow the creation
    return NextResponse.json({ 
      allowed: true 
    });
  } catch (error) {
    console.error('Error checking IP limits:', error);
    // On error, default to allowing (to prevent blocking legitimate users)
    return NextResponse.json({ 
      allowed: true,
      error: 'Error checking limits'
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get the IP address
    const forwardedFor = headers().get('x-forwarded-for');
    const realIp = headers().get('x-real-ip');
    let ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    // Create a hash of the IP for privacy
    const ipHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(ip)
    ).then(hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    );
    
    // Check if this IP has created a pack before
    const ipDocRef = doc(db, 'ipTracking', ipHash);
    const ipDoc = await getDoc(ipDocRef);
    
    if (ipDoc.exists()) {
      const data = ipDoc.data();
      return NextResponse.json({ 
        hasCreatedPack: data.count >= 1,
        count: data.count
      });
    }
    
    return NextResponse.json({ 
      hasCreatedPack: false,
      count: 0
    });
  } catch (error) {
    console.error('Error checking IP status:', error);
    return NextResponse.json({ 
      hasCreatedPack: false,
      error: 'Error checking status'
    });
  }
} 