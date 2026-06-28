import psycopg2
from core.config import settings

def create_auth_tables():
    conn = psycopg2.connect(settings.SUPABASE_DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    # Enable UUID extension if not present
    cur.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    
    # 1. Profiles Table
    print("Setting up Profiles table...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
        CREATE POLICY "Users can view own profile" 
        ON public.profiles FOR SELECT 
        USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        CREATE POLICY "Users can update own profile" 
        ON public.profiles FOR UPDATE 
        USING (auth.uid() = id);
    """)

    # 2. Saved Jobs Table
    print("Setting up Saved Jobs table...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS public.saved_jobs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
            saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, job_id)
        );
        ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own saved_jobs" ON public.saved_jobs;
        CREATE POLICY "Users can view own saved_jobs" ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can insert own saved_jobs" ON public.saved_jobs;
        CREATE POLICY "Users can insert own saved_jobs" ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can delete own saved_jobs" ON public.saved_jobs;
        CREATE POLICY "Users can delete own saved_jobs" ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);
    """)

    # 3. Recently Viewed Jobs Table
    print("Setting up Recently Viewed Jobs table...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS public.recently_viewed_jobs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
            viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, job_id)
        );
        ALTER TABLE public.recently_viewed_jobs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage own viewed_jobs" ON public.recently_viewed_jobs;
        CREATE POLICY "Users can manage own viewed_jobs" ON public.recently_viewed_jobs FOR ALL USING (auth.uid() = user_id);
    """)

    # 4. Applications Table
    print("Setting up Applications table...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS public.applications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'applied',
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, job_id)
        );
        ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage own applications" ON public.applications;
        CREATE POLICY "Users can manage own applications" ON public.applications FOR ALL USING (auth.uid() = user_id);
    """)

    # Trigger for new user signup
    print("Setting up User Profile Trigger...")
    cur.execute("""
        CREATE OR REPLACE FUNCTION public.handle_new_user() 
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.profiles (id, email, name, avatar_url)
            VALUES (
                new.id, 
                new.email, 
                new.raw_user_meta_data->>'name',
                new.raw_user_meta_data->>'avatar_url'
            );
            RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    """)
    
    # Reload postgrest
    cur.execute("NOTIFY pgrst, 'reload schema';")
    
    cur.close()
    conn.close()
    print("Database Auth Schema setup successfully!")

if __name__ == '__main__':
    create_auth_tables()
