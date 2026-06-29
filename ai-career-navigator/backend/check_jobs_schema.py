import psycopg2
from core.config import settings

conn = psycopg2.connect(settings.SUPABASE_DB_URL)
cur = conn.cursor()

cur.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'jobs' 
    AND table_schema = 'public';
""")

rows = cur.fetchall()
print("Jobs Table Schema:")
for row in rows:
    print(f"- {row[0]}: {row[1]}")

cur.close()
conn.close()
