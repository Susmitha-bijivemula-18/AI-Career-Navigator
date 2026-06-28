import psycopg2
from core.config import settings

def recreate_table():
    conn = psycopg2.connect(settings.SUPABASE_DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Dropping existing jobs table and enums if they exist...")
    cur.execute("DROP TABLE IF EXISTS jobs CASCADE;")
    cur.execute("DROP TYPE IF EXISTS experience_level_enum CASCADE;")
    cur.execute("DROP TYPE IF EXISTS employment_type_enum CASCADE;")
    
    print("Creating ENUM types...")
    cur.execute("CREATE TYPE experience_level_enum AS ENUM ('Internship', 'Entry Level', 'Mid Level', 'Senior Level', 'Executive');")
    cur.execute("CREATE TYPE employment_type_enum AS ENUM ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship');")
    
    print("Creating jobs table...")
    cur.execute("""
        CREATE TABLE jobs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_name TEXT NOT NULL,
            company_logo TEXT,
            role TEXT NOT NULL,
            job_description TEXT NOT NULL,
            required_skills JSONB DEFAULT '[]'::jsonb,
            experience_level experience_level_enum,
            location TEXT,
            salary TEXT,
            employment_type employment_type_enum,
            posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            job_apply_link TEXT,
            company_careers_link TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """)
    
    print("Creating indexes...")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_name);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING GIN (required_skills);")
    
    cur.execute("NOTIFY pgrst, 'reload schema';")
    
    cur.close()
    conn.close()
    print("Jobs table recreated and ready!")

if __name__ == '__main__':
    recreate_table()
