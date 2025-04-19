import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '../types/database.types';
import { useAuth } from './AuthContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserContextType {
  user: Profile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  createProfile: (data: Partial<Profile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authUser) {
      fetchUserProfile();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [authUser]);

  async function fetchUserProfile() {
    try {
      setLoading(true);
      
      // First check if the profiles table exists
      const { error: tableCheckError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (tableCheckError && tableCheckError.code === '42P01') {
        // Table doesn't exist, create a mock profile from auth user
        console.log('Profiles table does not exist, using auth user data');
        setUser({
          id: authUser?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          full_name: authUser?.user_metadata?.full_name || null,
          avatar_url: null,
          company: authUser?.user_metadata?.company || null,
          role: authUser?.user_metadata?.role || 'user',
          email: authUser?.email || null,
          phone: null,
          address: null,
          notifications_enabled: true,
          dark_mode: false
        } as Profile);
        setLoading(false);
        return;
      }
      
      // Table exists, fetch the profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, create a mock profile from auth user
          console.log('Profile not found, using auth user data');
          setUser({
            id: authUser?.id || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            full_name: authUser?.user_metadata?.full_name || null,
            avatar_url: null,
            company: authUser?.user_metadata?.company || null,
            role: authUser?.user_metadata?.role || 'user',
            email: authUser?.email || null,
            phone: null,
            address: null,
            notifications_enabled: true,
            dark_mode: false
          } as Profile);
        } else {
          throw error;
        }
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }

  async function createProfile(data: Partial<Profile>) {
    try {
      setLoading(true);
      console.log('Creating profile with data:', data);
      
      // First check if the profiles table exists
      const { error: tableCheckError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.log('Profiles table does not exist, skipping profile creation');
        // Table doesn't exist, just update the auth user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: data.full_name,
            company: data.company,
            role: data.role
          }
        });
        
        if (updateError) throw updateError;
        
        // Create a mock profile
        setUser({
          id: authUser?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          full_name: data.full_name || null,
          avatar_url: null,
          company: data.company || null,
          role: data.role || 'user',
          email: authUser?.email || null,
          phone: null,
          address: null,
          notifications_enabled: true,
          dark_mode: false
        } as Profile);
        
        setLoading(false);
        return;
      }
      
      // Table exists, proceed with profile creation
      // First check if the profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking for existing profile:', checkError);
        throw checkError;
      }
      
      if (existingProfile) {
        console.log('Profile already exists, updating instead');
        // Profile exists, update it
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
          
        if (updateError) {
          console.error('Error updating existing profile:', updateError);
          throw updateError;
        }
      } else {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
        if (insertError) {
          console.error('Error inserting new profile:', insertError);
          throw insertError;
        }
      }
      
      console.log('Profile operation completed successfully');
      await fetchUserProfile();
    } catch (error) {
      console.error('Error in createProfile:', error);
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(data: Partial<Profile>) {
    try {
      setLoading(true);
      
      // First check if the profiles table exists
      const { error: tableCheckError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.log('Profiles table does not exist, updating auth user metadata instead');
        // Table doesn't exist, just update the auth user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: data.full_name,
            company: data.company,
            role: data.role
          }
        });
        
        if (updateError) throw updateError;
        
        // Update the mock profile
        setUser(prev => prev ? {
          ...prev,
          ...data,
          updated_at: new Date().toISOString()
        } : null);
        
        setLoading(false);
        return;
      }
      
      // Table exists, proceed with profile update
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser?.id);

      if (error) throw error;
      await fetchUserProfile();
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, error, updateProfile, createProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 