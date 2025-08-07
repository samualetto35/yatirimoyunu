import { supabase } from '../supabase';
import { UserProgress, UserEntries, MarketRow } from '../supabase';

export class DatabaseService {
  
  // Test fonksiyonu: Manuel olarak user kayıtları oluştur
  static async createUserRecordsManually(userId: string, userEmail: string): Promise<void> {
    try {
      console.log('🔧 [DB] Manually creating user records for:', userEmail);
      console.log('🔧 [DB] User ID:', userId);
      
      // UserProgress tablosuna kayıt ekle
      const userProgressData: UserProgress = {
        user_id: userId,
        user_email: userEmail,
        group_name: null, // Şimdilik boş
        t0btl: 100000, // Başlangıç bakiyesi
        t0stl: null, // Boş
        t1stl: null, // Boş
        t2stl: null, // Boş
        t3stl: null, // Boş
        t4stl: null, // Boş
        t5stl: null, // Boş
        t6stl: null, // Boş
        t7stl: null  // Boş
      };

      console.log('🔧 [DB] Inserting user_progress data:', userProgressData);
      const { error: progressError } = await supabase
        .from('user_progress')
        .insert(userProgressData);

      if (progressError) {
        console.error('❌ [DB] Error creating user_progress record:', progressError);
        throw progressError;
      } else {
        console.log('✅ [DB] User progress record created successfully');
      }

      // UserEntries tablosuna kayıt ekle
      const userEntriesData: UserEntries = {
        user_id: userId,
        user_email: userEmail,
        group_name: null, // Şimdilik boş
        t0percent: null, // Boş
        t1percent: null, // Boş
        t2percent: null, // Boş
        t3percent: null, // Boş
        t4percent: null, // Boş
        t5percent: null, // Boş
        t6percent: null, // Boş
        t7percent: null, // Boş
        t8percent: null  // Boş
      };

      console.log('🔧 [DB] Inserting user_entries data:', userEntriesData);
      const { error: entriesError } = await supabase
        .from('user_entries')
        .insert(userEntriesData);

      if (entriesError) {
        console.error('❌ [DB] Error creating user_entries record:', entriesError);
        throw entriesError;
      } else {
        console.log('✅ [DB] User entries record created successfully');
      }

      console.log('✅ [DB] All user records created successfully for:', userEmail);
    } catch (error) {
      console.error('❌ [DB] Error in createUserRecordsManually:', error);
      throw error;
    }
  }

  // Test fonksiyonu: Supabase bağlantısını test et
  static async testSupabaseConnection(): Promise<void> {
    try {
      console.log('🔗 [DB] Testing Supabase connection...');
      
      // Market tablosunu test et
      const { data: marketData, error: marketError } = await supabase
        .from('market')
        .select('count')
        .limit(1);
      
      if (marketError) {
        console.error('❌ [DB] Market table test failed:', marketError);
      } else {
        console.log('✅ [DB] Market table connection successful');
      }

      // User progress tablosunu test et
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('count')
        .limit(1);
      
      if (progressError) {
        console.error('❌ [DB] User progress table test failed:', progressError);
      } else {
        console.log('✅ [DB] User progress table connection successful');
      }

      // User entries tablosunu test et
      const { data: entriesData, error: entriesError } = await supabase
        .from('user_entries')
        .select('count')
        .limit(1);
      
      if (entriesError) {
        console.error('❌ [DB] User entries table test failed:', entriesError);
      } else {
        console.log('✅ [DB] User entries table connection successful');
      }

    } catch (error) {
      console.error('❌ [DB] Supabase connection test failed:', error);
      throw error;
    }
  }

  // Market verilerini getir
  static async getMarketData(): Promise<MarketRow[]> {
    try {
      const { data, error } = await supabase
        .from('market')
        .select('*')
        .order('id');

      if (error) {
        console.error('Error fetching market data:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMarketData:', error);
      throw error;
    }
  }

  // Kullanıcı progress verilerini getir
  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user progress:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProgress:', error);
      throw error;
    }
  }

  // Kullanıcı entries verilerini getir
  static async getUserEntries(userId: string): Promise<UserEntries | null> {
    try {
      const { data, error } = await supabase
        .from('user_entries')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user entries:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserEntries:', error);
      throw error;
    }
  }

  // UserEntries güncelle (gelecekteki hesaplamalar için)
  static async updateUserEntries(userId: string, entries: Partial<UserEntries>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_entries')
        .update(entries)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user entries:', error);
        throw error;
      }

      console.log('User entries updated successfully for:', userId);
    } catch (error) {
      console.error('Error in updateUserEntries:', error);
      throw error;
    }
  }

  // UserProgress güncelle (gelecekteki hesaplamalar için)
  static async updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_progress')
        .update(progress)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user progress:', error);
        throw error;
      }

      console.log('User progress updated successfully for:', userId);
    } catch (error) {
      console.error('Error in updateUserProgress:', error);
      throw error;
    }
  }

  // Aktif haftayı getir
  static async getActiveWeek(): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('admin_week_control')
        .select('week_1, week_2, week_3, week_4, week_5, week_6, week_7, week_8')
        .eq('group_number', 1)
        .single();

      if (error) {
        console.error('Error fetching active week:', error);
        throw error;
      }

      // Hangi hafta aktif (1) ise onu döndür
      const weekData = data as any;
      for (let i = 1; i <= 8; i++) {
        if (weekData[`week_${i}`] === 1) {
          return i;
        }
      }

      return null;
    } catch (error) {
      console.error('Error in getActiveWeek:', error);
      throw error;
    }
  }
} 