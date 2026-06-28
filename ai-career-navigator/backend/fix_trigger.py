import psycopg2
from core.config import settings

def fix_trigger():
    conn = psycopg2.connect(settings.SUPABASE_DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    # 1. First, check if the column is full_name or name
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';")
    columns = [row[0] for row in cur.fetchall()]
    
    name_col = 'full_name' if 'full_name' in columns else 'name'
    
    print(f"Using name column: {name_col}")
    
    # 2. Update the trigger
    cur.execute(f"""
        CREATE OR REPLACE FUNCTION public.handle_new_user() 
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.profiles (id, email, {name_col}, avatar_url)
            VALUES (
                new.id, 
                new.email, 
                new.raw_user_meta_data->>'name',
                new.raw_user_meta_data->>'avatar_url'
            );
            RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    """)
    
    cur.close()
    conn.close()
    print("Trigger updated successfully!")

if __name__ == '__main__':
    fix_trigger()
