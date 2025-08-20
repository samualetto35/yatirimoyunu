import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';
import { supabase } from '../supabase';

interface AuthContextType {
  currentUser: User | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  createUserRecords: (userId: string, userEmail: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase user için database kayıtları oluştur
  async function createUserRecords(userId: string, userEmail: string): Promise<void> {
    try {
      console.log('🔧 [AUTH] Creating user records for Firebase user:', userEmail);
      console.log('👤 [AUTH] User ID:', userId);
      console.log('📧 [AUTH] User email:', userEmail);

      // Supabase fonksiyonunu çağır
      const { error } = await supabase.rpc('create_user_records_for_firebase_user', {
        p_user_id: userId,
        p_user_email: userEmail
      });

      if (error) {
        console.error('❌ [AUTH] Error creating user records:', error);
        console.error('❌ [AUTH] Error details:', error.message);
        throw error;
      } else {
        console.log('✅ [AUTH] User records created successfully via Supabase function');
        console.log('✅ [AUTH] Both user_progress and user_entries records created');
      }
    } catch (error) {
      console.error('❌ [AUTH] Error in createUserRecords:', error);
      throw error;
    }
  }

  async function register(email: string, password: string) {
    try {
      console.log('🚀 [AUTH] Registration started for:', email);
      
      // Firebase user oluştur
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ [AUTH] Firebase user created successfully:', result.user.uid);
      console.log('📧 [AUTH] User email:', result.user.email);
      console.log('🔍 [AUTH] Email verified status:', result.user.emailVerified);
      
      // Email verification gönder
      await sendEmailVerification(result.user);
      console.log('📨 [AUTH] Verification email sent to:', email);
      
      // Supabase bağlantısını test et
      console.log('🔗 [AUTH] Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('market')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ [AUTH] Supabase connection test failed:', testError);
      } else {
        console.log('✅ [AUTH] Supabase connection test successful');
      }
      
      // Firebase user bilgilerini logla
      console.log('👤 [AUTH] Firebase user details:');
      console.log('  - UID:', result.user.uid);
      console.log('  - Email:', result.user.email);
      console.log('  - Email Verified:', result.user.emailVerified);
      console.log('  - Creation Time:', result.user.metadata.creationTime);
      
      // Database kayıtları artık Supabase trigger'ı ile email verification sonrası otomatik oluşturulacak
      console.log('⏳ [AUTH] Database records will be created after email verification via Supabase trigger');
      
      // Otomatik giriş yapılmasın, kullanıcı login olana kadar oturum açık kalmasın
      await signOut(auth);
      console.log('🚪 [AUTH] User logged out after registration');
      
    } catch (error: any) {
      console.error('❌ [AUTH] Registration failed:', error.message);
      console.error('❌ [AUTH] Error code:', error.code);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      console.log('🔐 [AUTH] Login attempt for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('✅ [AUTH] Login successful for:', result.user.email);
      console.log('🔍 [AUTH] Email verified status:', result.user.emailVerified);
      console.log('👤 [AUTH] User UID:', result.user.uid);
      
      if (!result.user.emailVerified) {
        console.log('⚠️ [AUTH] Email not verified, resending verification email...');
        try {
          await sendEmailVerification(result.user);
          console.log('📨 [AUTH] Verification email re-sent');
        } catch (e) {
          console.error('❌ [AUTH] Failed to re-send verification email:', (e as any)?.message);
        }
        // Oturumu kapat ve özel hata fırlat
        await signOut(auth);
        const err = new Error('E-posta adresiniz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin.');
        (err as any).code = 'auth/email-not-verified';
        throw err;
      }
      
      // Email doğrulandıysa database kayıtları kontrol et ve gerekirse oluştur
      console.log('✅ [AUTH] Email verified, checking existing database records...');
      
      // Kullanıcı doğrulandıysa Supabase'de kayıt var mı kontrol et
      console.log('🔍 [AUTH] Checking if user records exist in Supabase...');
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', result.user.uid)
        .single();
      
      const { data: entriesData, error: entriesError } = await supabase
        .from('user_entries')
        .select('*')
        .eq('user_id', result.user.uid)
        .single();
      
      // Kayıt oluşturma stratejisi: önce RPC, ardından eksik olanları tek tek tamamla
      if (progressError || entriesError) {
        console.log('🔧 [AUTH] Ensuring user records exist (progress/entries) ...');
        // 1) RPC dene
        const { error: rpcError } = await supabase.rpc('create_user_records_for_firebase_user', {
          p_user_id: result.user.uid,
          p_user_email: result.user.email || ''
        });
        if (rpcError) {
          console.warn('⚠️ [AUTH] RPC failed, will try direct inserts if needed:', rpcError.message);
        }

        // 2) Tek tek doğrula ve eksikleri tamamla
        const { data: progressCheck } = await supabase
          .from('user_progress')
          .select('user_id')
          .eq('user_id', result.user.uid)
          .single();
        if (!progressCheck) {
          console.log('🔧 [AUTH] Creating missing user_progress directly...');
          const { error: insertProgErr } = await supabase
            .from('user_progress')
            .insert({
              user_id: result.user.uid,
              user_email: result.user.email || '',
              group_name: null,
              t0btl: 100000,
              t0stl: null,
              t1stl: null,
              t2stl: null,
              t3stl: null,
              t4stl: null,
              t5stl: null,
              t6stl: null,
              t7stl: null
            });
          if (insertProgErr) console.error('❌ [AUTH] Direct insert user_progress failed:', insertProgErr.message);
        }

        const { data: entriesCheck } = await supabase
          .from('user_entries')
          .select('user_id')
          .eq('user_id', result.user.uid)
          .single();
        if (!entriesCheck) {
          console.log('🔧 [AUTH] Creating missing user_entries directly...');
          const { error: insertEntErr } = await supabase
            .from('user_entries')
            .insert({
              user_id: result.user.uid,
              user_email: result.user.email || '',
              group_name: null,
              t0percent: null,
              t1percent: null,
              t2percent: null,
              t3percent: null,
              t4percent: null,
              t5percent: null,
              t6percent: null,
              t7percent: null,
              t8percent: null
            });
          if (insertEntErr) console.error('❌ [AUTH] Direct insert user_entries failed:', insertEntErr.message);
        }
      } else {
        console.log('✅ [AUTH] User progress and entries found in Supabase');
      }
      
    } catch (error: any) {
      if (error.code === 'auth/email-not-verified') {
        console.error('❌ [AUTH] Login failed: email not verified');
        throw error;
      }
      console.error('❌ [AUTH] Login failed:', error.message);
      throw error;
    }
  }

  async function logout() {
    try {
      console.log('🚪 [AUTH] Logout attempt');
      await signOut(auth);
      console.log('✅ [AUTH] Logout successful');
    } catch (error: any) {
      console.error('❌ [AUTH] Logout failed:', error.message);
      throw error;
    }
  }

  async function sendVerificationEmail() {
    if (currentUser) {
      try {
        console.log('📨 [AUTH] Sending verification email to:', currentUser.email);
        await sendEmailVerification(currentUser);
        console.log('✅ [AUTH] Verification email sent successfully');
      } catch (error: any) {
        console.error('❌ [AUTH] Failed to send verification email:', error.message);
        throw error;
      }
    }
  }

  async function resetPassword(email: string) {
    try {
      console.log('🔑 [AUTH] Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('✅ [AUTH] Password reset email sent successfully');
    } catch (error: any) {
      console.error('❌ [AUTH] Failed to send password reset email:', error.message);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 [AUTH] Auth state changed:', user ? user.email : 'No user');
      if (user) {
        console.log('👤 [AUTH] User details:');
        console.log('  - UID:', user.uid);
        console.log('  - Email:', user.email);
        console.log('  - Email Verified:', user.emailVerified);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    register,
    login,
    logout,
    sendVerificationEmail,
    resetPassword,
    createUserRecords,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 