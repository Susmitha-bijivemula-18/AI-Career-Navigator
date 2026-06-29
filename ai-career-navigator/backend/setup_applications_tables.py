import psycopg2
from core.config import settings

def setup_applications_tables():
    conn = psycopg2.connect(settings.SUPABASE_DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Updating Applications table...")
    cur.execute("""
        ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS notes TEXT;
        ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    """)
    
    print("Setting up Application Timeline table...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS public.application_timeline (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
            old_status TEXT,
            new_status TEXT NOT NULL,
            changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE public.application_timeline ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage own application timeline" ON public.application_timeline;
        CREATE POLICY "Users can manage own application timeline" 
        ON public.application_timeline FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM public.applications
                WHERE applications.id = application_timeline.application_id
                AND applications.user_id = auth.uid()
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.applications
                WHERE applications.id = application_timeline.application_id
                AND applications.user_id = auth.uid()
            )
        );
    """)

    # Create a trigger to auto-update updated_at on applications table
    print("Setting up updated_at trigger for applications...")
    cur.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
        CREATE TRIGGER update_applications_updated_at
        BEFORE UPDATE ON public.applications
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)
    
    # Reload postgrest
    cur.execute("NOTIFY pgrst, 'reload schema';")
    
    cur.close()
    conn.close()
    print("Applications schema updated successfully!")

if __name__ == '__main__':
    setup_applications_tables()
