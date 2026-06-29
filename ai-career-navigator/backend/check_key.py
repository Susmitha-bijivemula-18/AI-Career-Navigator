from core.config import settings

if settings.SUPABASE_KEY.startswith("ey"):
    import jwt
    decoded = jwt.decode(settings.SUPABASE_KEY, options={"verify_signature": False})
    print(f"Supabase Key Role: {decoded.get('role')}")
else:
    print("Not a JWT")
