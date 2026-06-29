from fastapi import APIRouter, HTTPException, Header, Query
from typing import List, Optional
from services.database import supabase
from models.applications import ApplicationCreate, ApplicationUpdate, ApplicationOut, DashboardStats
from core.logging import log
from datetime import datetime
import collections

router = APIRouter()

def get_user_id(user_id: Optional[str] = Header(None)) -> str:
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID is missing from headers")
    return user_id

@router.post("", response_model=ApplicationOut)
def create_application(application: ApplicationCreate, user_id: str = Header(...)):
    """Create a new job application tracker entry."""
    try:
        data = application.dict(exclude_unset=True)
        data["user_id"] = user_id
        
        # Insert application
        res = supabase.table("applications").insert(data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create application")
        
        # Log timeline (handled by DB trigger automatically, but we can do it explicitly if needed)
        # Actually our SQL script had a trigger for this `log_application_status_change` if we added it,
        # but just in case, we will insert explicitly for the first status
        supabase.table("application_timeline").insert({
            "application_id": res.data[0]["id"],
            "new_status": res.data[0]["status"]
        }).execute()
        
        return get_application_by_id(res.data[0]["id"], user_id)
    except Exception as e:
        log.error("create_application_error", error=str(e))
        raise HTTPException(status_code=500, detail="Error creating application")

@router.get("", response_model=List[ApplicationOut])
def get_applications(
    user_id: str = Header(...),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("latest")
):
    """Get all applications for the user, with optional filtering."""
    try:
        query = supabase.table("applications").select("*, jobs!inner(*)").eq("user_id", user_id)
        
        if status:
            query = query.eq("status", status)
            
        if sort_by == "oldest":
            query = query.order("applied_at", desc=False)
        else:
            query = query.order("applied_at", desc=True)
            
        res = query.execute()
        return res.data
    except Exception as e:
        log.error("get_applications_error", error=str(e))
        raise HTTPException(status_code=500, detail="Error fetching applications")

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(user_id: str = Header(...)):
    """Get statistics for the applications dashboard."""
    try:
        res = supabase.table("applications").select("status, applied_at").eq("user_id", user_id).execute()
        apps = res.data
        
        stats = {
            "total_applications": len(apps),
            "under_review": 0,
            "interviews_scheduled": 0,
            "offers_received": 0,
            "rejected": 0,
            "status_distribution": collections.defaultdict(int),
            "applications_per_month": collections.defaultdict(int)
        }
        
        for app in apps:
            st = app.get("status")
            stats["status_distribution"][st] += 1
            
            if st == "Under Review":
                stats["under_review"] += 1
            elif "Interview" in st:
                stats["interviews_scheduled"] += 1
            elif st == "Offer Received":
                stats["offers_received"] += 1
            elif st == "Rejected":
                stats["rejected"] += 1
                
            # Month grouping
            applied_at = app.get("applied_at")
            if applied_at:
                try:
                    # '2026-06-29T14:30:11.12345+00:00'
                    month = applied_at[:7] # YYYY-MM
                    stats["applications_per_month"][month] += 1
                except:
                    pass
        
        return stats
    except Exception as e:
        log.error("get_dashboard_stats_error", error=str(e))
        raise HTTPException(status_code=500, detail="Error fetching stats")

@router.get("/{id}", response_model=ApplicationOut)
def get_application(id: str, user_id: str = Header(...)):
    """Get a specific application details."""
    return get_application_by_id(id, user_id)

@router.patch("/{id}", response_model=ApplicationOut)
def update_application(id: str, application: ApplicationUpdate, user_id: str = Header(...)):
    """Update application status or notes."""
    try:
        # Check ownership
        existing = get_application_by_id(id, user_id)
        
        data = application.dict(exclude_unset=True)
        if not data:
            return existing
            
        res = supabase.table("applications").update(data).eq("id", id).eq("user_id", user_id).execute()
        
        if application.status and application.status != existing.get("status"):
            supabase.table("application_timeline").insert({
                "application_id": id,
                "old_status": existing.get("status"),
                "new_status": application.status
            }).execute()
            
        return get_application_by_id(id, user_id)
    except HTTPException:
        raise
    except Exception as e:
        log.error("update_application_error", error=str(e))
        raise HTTPException(status_code=500, detail="Error updating application")

@router.delete("/{id}")
def delete_application(id: str, user_id: str = Header(...)):
    """Delete an application."""
    try:
        res = supabase.table("applications").delete().eq("id", id).eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Application not found or unauthorized")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        log.error("delete_application_error", error=str(e))
        raise HTTPException(status_code=500, detail="Error deleting application")

def get_application_by_id(id: str, user_id: str):
    res = supabase.table("applications").select("*, jobs(*), application_timeline(*)").eq("id", id).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_data = res.data[0]
    # Sort timeline by changed_at descending if it exists
    if "application_timeline" in app_data and app_data["application_timeline"]:
        app_data["application_timeline"].sort(key=lambda x: x.get("changed_at", ""), reverse=True)
        
    return app_data
