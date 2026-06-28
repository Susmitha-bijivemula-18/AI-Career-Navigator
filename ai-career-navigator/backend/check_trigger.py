import psycopg2
from core.config import settings

def test():
    conn = psycopg2.connect(settings.SUPABASE_DB_URL)
    cur = conn.cursor()
    
    cur.execute("SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';")
    print('Trigger exists:', cur.fetchone())
    
    cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';")
    print('Profiles columns:', cur.fetchall())
    
    # Try inserting a fake user manually? We can't really do that cleanly if we don't know the exact schema of auth.users
    # Let's check postgres logs or error directly from a fake trigger invocation?
test()
