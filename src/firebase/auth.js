/**
 * TeaRoute Authentication Service
 * Manages Firebase Auth, error translation, and role-based sessions.
 */
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config.js';
import { store } from '../services/store.js';

/**
 * Translates Firebase Authentication error codes into actionable, user-friendly messages.
 * Note: Firebase may return 'auth/invalid-credential' for multiple invalid login situations
 * (e.g. wrong password or unregistered email) due to email enumeration protection.
 */
export function mapAuthError(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-credential':
      return 'Invalid email or password. If you have not registered this account yet, please click "Create an Account" below. If you already have an account, please verify your password or use "Forgot password?".';

    case 'auth/user-not-found':
      return 'No account found with this email address. Please click "Create an Account" to register.';

    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or click "Forgot password?" to reset it.';

    case 'auth/invalid-email':
      return 'The email address format is invalid. Please enter a valid email address (e.g. name@example.com).';

    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator. Please contact support@tearoute.io.';

    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to multiple failed login attempts. Please wait a few minutes or reset your password.';

    case 'auth/network-request-failed':
      return 'Network connection failed. Please verify your internet connection and try again.';

    case 'auth/operation-not-allowed':
      return 'Email/Password authentication is not enabled in the Firebase Console. Please enable Email/Password provider in Firebase Authentication.';

    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in or use a different email.';

    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters.';

    case 'auth/missing-password':
      return 'Please enter your password.';

    case 'auth/missing-email':
      return 'Please enter your email address.';

    default:
      if (error.message) {
        return error.message
          .replace(/^Firebase:\s*(Error\s*)?(\(auth\/[^)]+\)\.?\s*)?/i, '')
          .trim() || 'Authentication failed. Please verify your details.';
      }
      return 'Authentication failed. Please try again.';
  }
}

export const authService = {
  /**
   * Register a new user with role
   */
  async register(email, password, { role, name, phone, address, businessName, vehicleType }) {
    if (!email || !password || !role) {
      throw new Error('Email, password and user role are mandatory.');
    }

    if (role === 'admin') {
      throw new Error('Public registration for Administrator is prohibited. First admin must be provisioned via trusted setup.');
    }

    // 5. Remove accidental whitespace from email
    const cleanEmail = String(email).trim();
    if (!cleanEmail) {
      throw new Error('Please enter a valid email address.');
    }

    // 6. Do not modify or trim the user's password automatically
    if (isFirebaseConfigured && auth && db) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;

        const profile = {
          uid: user.uid,
          email: user.email,
          name: name ? String(name).trim() : '',
          phone: phone ? String(phone).trim() : '',
          role: role,
          address: address ? String(address).trim() : '',
          businessName: businessName ? String(businessName).trim() : '',
          vehicleType: vehicleType || '',
          status: (role === 'hotel' || role === 'shopkeeper' || role === 'delivery') ? 'pending_approval' : 'active',
          createdAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'users', user.uid), profile);
        } catch (docErr) {
          console.warn('Firestore profile write note:', docErr.message);
        }

        store.setCurrentUser(profile);
        return profile;
      } catch (err) {
        throw new Error(mapAuthError(err));
      }
    } else {
      // Local development session fallback
      const profile = {
        uid: 'user_' + Date.now(),
        email: cleanEmail,
        name: name ? String(name).trim() : cleanEmail.split('@')[0],
        phone: phone ? String(phone).trim() : '+91 98765 00000',
        role,
        address: address ? String(address).trim() : 'Koramangala, Bengaluru',
        businessName: businessName ? String(businessName).trim() : '',
        vehicleType: vehicleType || '',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      store.setCurrentUser(profile);
      return profile;
    }
  },

  /**
   * Login with email and password
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    // 5. Remove accidental whitespace from email using trim()
    const cleanEmail = String(email).trim();
    if (!cleanEmail) {
      throw new Error('Please enter a valid email address.');
    }

    // 6. Do not modify or trim the user's password automatically
    // 7. signInWithEmailAndPassword receives shared auth instance, cleanEmail, and raw password
    if (isFirebaseConfigured && auth && db) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;

        let profile;
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            profile = userDoc.data();
          } else {
            // Determine role by email domain or fallback to customer
            let defaultRole = 'customer';
            const lowerEmail = user.email ? user.email.toLowerCase() : '';
            if (lowerEmail.includes('hotel')) defaultRole = 'hotel';
            else if (lowerEmail.includes('shop') || lowerEmail.includes('vendor')) defaultRole = 'shopkeeper';
            else if (lowerEmail.includes('rider') || lowerEmail.includes('delivery')) defaultRole = 'delivery';
            else if (lowerEmail.includes('admin')) defaultRole = 'admin';

            profile = {
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              role: defaultRole,
              status: 'active',
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
            } catch (wErr) {
              console.warn('Profile write note:', wErr.message);
            }
          }
        } catch (fetchErr) {
          console.warn('Profile fetch note:', fetchErr.message);
          profile = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            role: 'customer'
          };
        }

        store.setCurrentUser(profile);
        return profile;
      } catch (err) {
        // Map error to human-friendly description
        throw new Error(mapAuthError(err));
      }
    } else {
      // Offline fallback
      let role = 'customer';
      let name = 'Rahul Sharma';
      const lower = cleanEmail.toLowerCase();
      if (lower.includes('hotel')) { role = 'hotel'; name = 'Vikram Oberoi'; }
      else if (lower.includes('shop') || lower.includes('vendor')) { role = 'shopkeeper'; name = 'Ramesh Sharma'; }
      else if (lower.includes('rider') || lower.includes('delivery')) { role = 'delivery'; name = 'Amit Verma'; }
      else if (lower.includes('admin')) { role = 'admin'; name = 'System Administrator'; }

      const profile = {
        uid: 'user_' + role,
        email: cleanEmail,
        name,
        role,
        status: 'active'
      };
      store.setCurrentUser(profile);
      return profile;
    }
  },

  /**
   * Sign out current user
   */
  async logout() {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Sign out note:', err.message);
      }
    }
    store.logout();
  },

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    const cleanEmail = String(email || '').trim();
    if (!cleanEmail) {
      throw new Error('Please enter your email address to receive password reset instructions.');
    }

    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        return true;
      } catch (err) {
        throw new Error(mapAuthError(err));
      }
    }
    return true;
  },

  /**
   * Get target landing URL for a given role
   */
  getRedirectUrlForRole(role) {
    switch (role) {
      case 'hotel': return '/hotel/dashboard.html';
      case 'shopkeeper': return '/shopkeeper/dashboard.html';
      case 'delivery': return '/delivery/dashboard.html';
      case 'admin': return '/admin/dashboard.html';
      case 'customer':
      default: return '/customer/dashboard.html';
    }
  }
};
