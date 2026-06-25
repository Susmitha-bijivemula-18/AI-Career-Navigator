import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# The direct connection string was provided by the user in .env
db_url = os.getenv("SUPABASE_DB_URL")

def run_migration():
    if not db_url:
        print("SUPABASE_DB_URL not found in .env")
        return

    print("Connecting to Supabase PostgreSQL...")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()

    print("Reading schema.sql...")
    with open('db/schema.sql', 'r') as f:
        sql = f.read()

    print("Executing schema.sql...")
    cursor.execute(sql)
    print("Schema applied successfully!")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    run_migration()
