import psycopg2
from core.config import settings

def fix_schema():
    conn = psycopg2.connect(settings.SUPABASE_DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    # Check if table exists
    cur.execute("SELECT to_regclass('public.resumes');")
    if not cur.fetchone()[0]:
        print("Table 'resumes' does not exist. Creating it...")
        cur.execute("""
            CREATE TABLE resumes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                user_id UUID,
                raw_text TEXT,
                extracted_skills JSONB,
                experience_level TEXT,
                predicted_roles JSONB,
                ai_summary TEXT
            );
        """)
    else:
        print("Table 'resumes' exists. Adding columns if missing...")
        cur.execute("""
            ALTER TABLE resumes 
            ADD COLUMN IF NOT EXISTS raw_text TEXT,
            ADD COLUMN IF NOT EXISTS extracted_skills JSONB,
            ADD COLUMN IF NOT EXISTS experience_level TEXT,
            ADD COLUMN IF NOT EXISTS predicted_roles JSONB,
            ADD COLUMN IF NOT EXISTS ai_summary TEXT;
        """)
        
    print("Notifying PostgREST to reload schema...")
    cur.execute("NOTIFY pgrst, 'reload schema';")
    
    cur.close()
    conn.close()
    print("Done!")

if __name__ == '__main__':
    fix_schema()
