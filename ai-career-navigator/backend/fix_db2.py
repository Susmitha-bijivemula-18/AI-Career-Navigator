import psycopg2
from core.config import settings

def fix_schema():
    conn = psycopg2.connect(settings.SUPABASE_DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    cur.execute("""
    DO $$ 
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'resumes' AND is_nullable = 'NO' AND column_name NOT IN ('id', 'created_at', 'updated_at')
        ) LOOP
            EXECUTE 'ALTER TABLE resumes ALTER COLUMN ' || quote_ident(r.column_name) || ' DROP NOT NULL';
        END LOOP;
    END $$;
    """)
    
    print("Notifying PostgREST to reload schema...")
    cur.execute("NOTIFY pgrst, 'reload schema';")
    
    cur.close()
    conn.close()
    print("Done!")

if __name__ == '__main__':
    fix_schema()
