import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { supabase } from '../lib/supabase';
import { setCurrentUser, clearCurrentUser, getCurrentUser } from '../utils/localStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [userStatus, setUserStatus] = useState(null); // "pending" | "approved" | "rejected"
  const [isNewUser, setIsNewUser] = useState(false);

  // Listen for Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      // Check localStorage for cached session (faculty, etc.)
      const cached = getCurrentUser();
      if (cached?.role === 'faculty') {
        setProfile(cached);
        setUser({ id: cached.id, email: cached.email });
      } else if (cached?.isAdmin) {
        setProfile(cached);
        setIsAdmin(true);
      }
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadFirestoreProfile(firebaseUser);
      } else {
        // Check localStorage for cached session (faculty, etc.)
        const cached = getCurrentUser();
        if (cached?.role === 'faculty') {
          setProfile(cached);
          setUser({ id: cached.id, email: cached.email });
        } else if (cached?.isAdmin) {
          setProfile(cached);
          setIsAdmin(true);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setUserStatus(null);
          setIsNewUser(false);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load or create Firestore user profile
  async function loadFirestoreProfile(firebaseUser) {
    if (!db) {
      console.warn("Firestore db is not initialized.");
      return;
    }
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Existing user
        const data = userSnap.data();
        const profileData = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          full_name: data.full_name || data.displayName || firebaseUser.displayName || 'User',
          email: data.email || firebaseUser.email,
          role: data.role || 'participant',
          status: data.status || 'pending',
          student_id: data.student_id || '',
          department: data.department || '',
          year: data.year || '',
          phone: data.phone || '',
          photo_url: data.photo_url || firebaseUser.photoURL || '',
          isAdmin: data.role === 'admin',
          registered_at: data.registered_at || null,
        };
        setProfile(profileData);
        setIsAdmin(data.role === 'admin');
        setUserStatus(data.status || 'pending');
        setIsNewUser(false);
        setCurrentUser(profileData);
      } else {
        // New user — create a basic record
        const newUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photo_url: firebaseUser.photoURL || '',
          role: 'participant',
          status: 'pending',
          created_at: serverTimestamp(),
        };
        await setDoc(userRef, newUserData);

        const profileData = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          full_name: firebaseUser.displayName || '',
          email: firebaseUser.email,
          role: 'participant',
          status: 'pending',
          student_id: '',
          department: '',
          year: '',
          phone: '',
          photo_url: firebaseUser.photoURL || '',
          isAdmin: false,
        };
        setProfile(profileData);
        setIsAdmin(false);
        setUserStatus('pending');
        setIsNewUser(true);
        setCurrentUser(profileData);
      }
    } catch (err) {
      console.error('Error loading Firestore profile:', err);
      // Fallback profile from Firebase Auth data
      const fallbackProfile = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        full_name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: 'participant',
        status: 'pending',
        photo_url: firebaseUser.photoURL || '',
        isAdmin: false,
      };
      setProfile(fallbackProfile);
      setCurrentUser(fallbackProfile);
    } finally {
      setLoading(false);
    }
  }

  // Google Sign-In
  async function signInWithGoogle() {
    setAuthError(null);
    if (!auth) {
      const err = new Error("Google Sign-In is unavailable because Firebase credentials are not set on Vercel.");
      setAuthError(err.message);
      throw err;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        return null; // User closed popup, not an error
      }
      setAuthError(err.message);
      throw err;
    }
  }

  // Email/Password Sign Up
  async function signUp(email, password, metadata = {}) {
    setAuthError(null);
    if (!auth) {
      const err = new Error("Email Sign Up is unavailable because Firebase credentials are not set on Vercel.");
      setAuthError(err.message);
      throw err;
    }
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase Auth display name
      if (metadata.fullName) {
        await firebaseUpdateProfile(newUser, { displayName: metadata.fullName });
      }

      // Create Firestore record
      if (db) {
        const userRef = doc(db, 'users', newUser.uid);
        await setDoc(userRef, {
          uid: newUser.uid,
          email: newUser.email,
          displayName: metadata.fullName || '',
          full_name: metadata.fullName || '',
          role: 'participant',
          status: 'pending',
          student_id: metadata.studentId || '',
          department: metadata.department || '',
          year: metadata.year || '',
          created_at: serverTimestamp(),
        });
      }

      return newUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }

  // Email/Password Sign In
  async function signIn(email, password) {
    setAuthError(null);
    if (!auth) {
      const err = new Error("Email Sign In is unavailable because Firebase credentials are not set on Vercel.");
      setAuthError(err.message);
      throw err;
    }
    try {
      const { user: existingUser } = await signInWithEmailAndPassword(auth, email, password);
      return existingUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }

  // Faculty Sign In (still uses Supabase for faculty table)
  async function signInAsFaculty(username, password) {
    setAuthError(null);
    try {
      const { data, error } = await supabase
        .from('event_faculty')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Invalid username or password');

      const facultyProfile = {
        id: data.id,
        full_name: data.faculty_name,
        email: data.email || `${username}@faculty.college.edu`,
        role: 'faculty',
        status: 'approved',
        department: data.department || '',
        faculty_role: data.faculty_role || '',
        phone: data.phone || '',
        username: data.username,
      };

      setProfile(facultyProfile);
      setUser({ id: data.id, email: facultyProfile.email });
      setIsAdmin(false);
      setUserStatus('approved');
      setCurrentUser(facultyProfile);
      return facultyProfile;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }

  // Sign Out
  async function signOut() {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.error('Firebase sign out error:', err);
    }
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setUserStatus(null);
    setIsNewUser(false);
    clearCurrentUser();
  }

  // Complete participant registration (after Google sign-in form)
  async function completeRegistration(formData) {
    if (!user) return;
    if (!db) {
      const updatedProfile = {
        ...profile,
        full_name: formData.fullName,
        student_id: formData.studentId,
        department: formData.department,
        year: formData.year,
        phone: formData.phone || '',
        status: 'pending',
        registered_at: new Date().toISOString(),
      };
      setProfile(updatedProfile);
      setIsNewUser(false);
      setUserStatus('pending');
      setCurrentUser(updatedProfile);
      return updatedProfile;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      const updates = {
        full_name: formData.fullName,
        student_id: formData.studentId,
        department: formData.department,
        year: formData.year,
        phone: formData.phone || '',
        status: 'pending',
        registered_at: serverTimestamp(),
      };
      await updateDoc(userRef, updates);

      const updatedProfile = {
        ...profile,
        ...updates,
        registered_at: new Date().toISOString(),
      };
      setProfile(updatedProfile);
      setIsNewUser(false);
      setUserStatus('pending');
      setCurrentUser(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error completing registration:', err);
      throw err;
    }
  }

  // Update profile
  async function updateProfile(updates) {
    if (!user) return;
    if (!db) {
      // Fallback: update locally
      const updated = { ...profile, ...updates };
      setProfile(updated);
      setCurrentUser(updated);
      return updated;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);

      const updated = { ...profile, ...updates };
      setProfile(updated);
      setCurrentUser({ ...updated, isAdmin: updated.role === 'admin' });
      return updated;
    } catch (err) {
      console.error('Error updating profile:', err);
      // Fallback: update locally
      const updated = { ...profile, ...updates };
      setProfile(updated);
      setCurrentUser(updated);
      return updated;
    }
  }

  // Admin: Approve user
  async function approveUser(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { status: 'approved' });
      return true;
    } catch (err) {
      console.error('Error approving user:', err);
      throw err;
    }
  }

  // Admin: Reject user
  async function rejectUser(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { status: 'rejected' });
      return true;
    } catch (err) {
      console.error('Error rejecting user:', err);
      throw err;
    }
  }

  // Admin: Fetch all pending users
  async function getPendingUsers() {
    try {
      const q = query(collection(db, 'users'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Error fetching pending users:', err);
      return [];
    }
  }

  // Admin: Fetch all users
  async function getAllUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Error fetching all users:', err);
      return [];
    }
  }

  // Quick login for demo (creates user in local state without Firebase auth)
  function quickLogin(userData) {
    const emailKey = userData.email ? userData.email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : `guest-${Date.now()}`;
    const userProfile = {
      id: `usr-${emailKey}`,
      full_name: userData.name || userData.fullName || (userData.email ? userData.email.split('@')[0] : 'User'),
      email: userData.email,
      student_id: userData.studentId || 'S-000001',
      department: userData.department || 'Computer Science',
      year: userData.year || 'junior',
      role: 'student',
      status: 'approved',
      isAdmin: false,
    };
    setProfile(userProfile);
    setUser({ id: userProfile.id, email: userProfile.email });
    setUserStatus('approved');
    setCurrentUser(userProfile);
    return userProfile;
  }

  const [showLogin, setShowLogin] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        authError,
        userStatus,
        isNewUser,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        quickLogin,
        updateProfile,
        signInAsFaculty,
        completeRegistration,
        approveUser,
        rejectUser,
        getPendingUsers,
        getAllUsers,
        showLogin,
        setShowLogin,
        setIsNewUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
