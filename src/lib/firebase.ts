import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDocFromServer,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Must pass databaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operational Types for Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Operation Failed:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Startup (mandated by SKILL.md)
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore Connection Verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('Firebase client is offline or network is unreachable.');
    }
  }
}

// Auth Helper Functions
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Logout Error:', error);
  }
}

// Firestore Helper API
export interface BookingPayload {
  name: string;
  phone: string;
  email?: string;
  serviceId: string;
  serviceTitle?: string;
  preferredDate?: string;
  preferredTime?: string;
  birthDetails?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export async function createBookingInFirestore(payload: BookingPayload) {
  const bookingId = 'bk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const path = `bookings/${bookingId}`;
  try {
    const data = {
      ...payload,
      id: bookingId,
      status: payload.status || 'pending',
      createdAt: new Date().toISOString(),
      ...(auth.currentUser ? { userId: auth.currentUser.uid } : {})
    };
    await setDoc(doc(db, 'bookings', bookingId), data);
    return bookingId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface EnquiryPayload {
  name: string;
  phone: string;
  message: string;
}

export async function createEnquiryInFirestore(payload: EnquiryPayload) {
  const enquiryId = 'enq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const path = `enquiries/${enquiryId}`;
  try {
    const data = {
      ...payload,
      id: enquiryId,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'enquiries', enquiryId), data);
    return enquiryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface KundliRecordPayload {
  name: string;
  gender?: 'male' | 'female' | 'other';
  dob: string;
  tob: string;
  pob: string;
  lagna?: string;
  rashi?: string;
  nakshatra?: string;
}

export async function saveKundliToFirestore(payload: KundliRecordPayload) {
  const kundliId = 'kn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const path = `kundli_records/${kundliId}`;
  try {
    const data = {
      ...payload,
      id: kundliId,
      createdAt: new Date().toISOString(),
      ...(auth.currentUser ? { userId: auth.currentUser.uid } : {})
    };
    await setDoc(doc(db, 'kundli_records', kundliId), data);
    return kundliId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
