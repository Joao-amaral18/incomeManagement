import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Storage will fallback to localStorage.')
}

let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}

const BUCKET_NAME = 'expense-manager-data'
const STORAGE_PATH = (userId: string) => `${userId}/data.json`

/**
 * Ensure the storage bucket exists
 */
export async function ensureBucket(): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.warn('Supabase client not available')
    return false
  }

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', {
        message: listError.message,
      })
      // If we can't list buckets, we can't verify if it exists
      // Return true to allow trying operations (they will fail with better error messages)
      return true
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME)

    if (!bucketExists) {
      console.log(`Bucket '${BUCKET_NAME}' does not exist. Attempting to create...`)
      
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Private bucket
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: ['application/json']
      })

      if (createError) {
        console.error('Error creating bucket:', {
          message: createError.message,
        })
        console.warn('⚠️ You may need to create the bucket manually in Supabase Dashboard > Storage')
        return false
      }
      
      console.log(`Bucket '${BUCKET_NAME}' created successfully`)
    }

    return true
  } catch (error: any) {
    console.error('Error ensuring bucket:', {
      error,
      message: error?.message,
      stack: error?.stack
    })
    return false
  }
}

/**
 * Save data to Supabase Storage
 */
export async function saveToSupabaseStorage(userId: string, data: any): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.warn('Supabase client not available')
    return false
  }

  try {
    // Ensure bucket exists first
    const bucketExists = await ensureBucket()
    if (!bucketExists) {
      console.error('Bucket does not exist and could not be created')
      return false
    }

    const filePath = STORAGE_PATH(userId)
    const fileContent = JSON.stringify(data)
    const blob = new Blob([fileContent], { type: 'application/json' })

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        upsert: true,
        contentType: 'application/json',
      })

    if (error) {
      // Log detailed error for debugging
      console.error('Error saving to Supabase Storage:', {
        message: error.message,
        filePath,
        bucket: BUCKET_NAME
      })
      
      // If it's a permission error, suggest checking RLS policies
      if (error.message?.includes('permission') || error.message?.includes('policy')) {
        console.warn('⚠️ Permission error. Make sure RLS policies are configured in Supabase Storage.')
        console.warn('Go to Supabase Dashboard > Storage > Policies and add policies for the bucket.')
      }
      
      return false
    }

    return true
  } catch (error: any) {
    console.error('Error saving to Supabase Storage:', {
      error,
      message: error?.message,
      stack: error?.stack
    })
    return false
  }
}

/**
 * Load data from Supabase Storage
 */
export async function loadFromSupabaseStorage(userId: string): Promise<any | null> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.warn('Supabase client not available')
    return null
  }

  try {
    // Ensure bucket exists first
    const bucketExists = await ensureBucket()
    if (!bucketExists) {
      console.warn('Bucket does not exist and could not be created')
      return null
    }

    const filePath = STORAGE_PATH(userId)

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath)

    if (error) {
      // File doesn't exist yet, return null (this is normal for first use)
      // Check for 404 in multiple ways
      const isNotFound = 
        error.message?.includes('404') || 
        error.message?.includes('not found') ||
        error.message?.includes('Not Found')
      
      if (isNotFound) {
        // Silently return null for 404 - this is expected for new users
        return null
      }
      
      // Log detailed error for debugging (only for real errors, not 404)
      console.error('Error loading from Supabase Storage:', {
        message: error.message,
        filePath,
        bucket: BUCKET_NAME
      })
      
      // If it's a permission error, suggest checking RLS policies
      if (error.message?.includes('permission') || error.message?.includes('policy')) {
        console.warn('⚠️ Permission error. Make sure RLS policies are configured in Supabase Storage.')
        console.warn('Go to Supabase Dashboard > Storage > Policies and add policies for the bucket.')
        console.warn('See README.md or create policies that allow authenticated users to read/write their own files.')
      }
      
      return null
    }

    if (!data) {
      return null
    }

    // Convert blob to text and parse JSON
    const text = await data.text()
    return JSON.parse(text)
  } catch (error: any) {
    console.error('Error loading from Supabase Storage:', {
      error,
      message: error?.message,
      stack: error?.stack
    })
    return null
  }
}

/**
 * Delete data from Supabase Storage
 */
export async function deleteFromSupabaseStorage(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const filePath = STORAGE_PATH(userId)

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Error deleting from Supabase Storage:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting from Supabase Storage:', error)
    return false
  }
}

