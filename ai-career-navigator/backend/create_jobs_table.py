import psycopg2
from core.config import settings

def create_table():
    conn = psycopg2.connect(settings.SUPABASE_DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    cur.execute("SELECT to_regclass('public.jobs');")
    if not cur.fetchone()[0]:
        print("Creating jobs table...")
        cur.execute("""
            CREATE TABLE jobs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                external_id TEXT UNIQUE NOT NULL,
                source TEXT NOT NULL,
                company_name TEXT NOT NULL,
                role TEXT NOT NULL,
                job_description TEXT,
                skills_required JSONB DEFAULT '[]'::jsonb,
                location TEXT,
                posted_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                apply_link TEXT NOT NULL,
                company_logo TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
    else:
        print("Jobs table exists, adding columns...")
        cur.execute("""
            ALTER TABLE jobs
            ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
            ADD COLUMN IF NOT EXISTS source TEXT,
            ADD COLUMN IF NOT EXISTS company_name TEXT,
            ADD COLUMN IF NOT EXISTS role TEXT,
            ADD COLUMN IF NOT EXISTS job_description TEXT,
            ADD COLUMN IF NOT EXISTS skills_required JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS location TEXT,
            ADD COLUMN IF NOT EXISTS posted_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS apply_link TEXT,
            ADD COLUMN IF NOT EXISTS company_logo TEXT,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        """)
        
    cur.execute("CREATE INDEX IF NOT EXISTS idx_jobs_posted_time ON jobs(posted_time DESC);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);")
    
    cur.execute("NOTIFY pgrst, 'reload schema';")
    
    cur.close()
    conn.close()
    print("Jobs table ready!")

if __name__ == '__main__':
    create_table()
