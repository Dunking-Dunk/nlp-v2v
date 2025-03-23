import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime, timedelta

from db import prisma

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("emergency-api")

apis = APIRouter()

@apis.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@apis.get("/sessions")
async def list_sessions(
    status: Optional[str] = None,
    emergency_type: Optional[str] = None,
    limit: int = 100
):
    """List all sessions with optional filters for frontend display"""
    try:
        where = {}
        
        if status:
            where["status"] = status
            
        if emergency_type:
            where["emergencyType"] = emergency_type
        
        sessions = await prisma.session.find_many(
            where=where,
            include={
                "caller": True,
                "location": True,
                "dispatches": {
                    "include": {
                        "responder": True
                    }
                }
            },
            order_by={
                "createdAt": "desc"
            },
            take=limit 
        )
        
        serializable_sessions = [s.dict() for s in sessions]
        
        return {
            "success": True, 
            "sessions": serializable_sessions,
            "count": len(serializable_sessions)
        }
    except Exception as e:
        logger.error(f"Error retrieving sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@apis.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get detailed information about a specific session"""
    try:
        session = await prisma.session.find_unique(
            where={"id": session_id},
            include={
                "caller": True,
                "location": True,
                "dispatches": {
                    "include": {
                        "responder": True
                    }
                },
                "transcripts": {
                    "order_by": {
                        "timestamp": "asc"
                    }
                }
            }
        )
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
            
        serializable_session = session.dict()
        return {"success": True, "session": serializable_session}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@apis.get("/session-stats")
async def get_session_stats():
    """Get statistics about sessions for dashboard display"""
    try:
        # Get counts of sessions by status
        status_counts = {}
        for status in ["ACTIVE", "EMERGENCY_VERIFIED", "DISPATCHED", "COMPLETED", 
                      "DROPPED", "TRANSFERRED", "NON_EMERGENCY"]:
            count = await prisma.session.count(
                where={"status": status}
            )
            status_counts[status] = count
        

        type_counts = {}
        for etype in ["MEDICAL", "POLICE", "FIRE", "OTHER"]:
            count = await prisma.session.count(
                where={"emergencyType": etype}
            )
            type_counts[etype] = count
        
       
        total = await prisma.session.count()
        
     
        day_ago = datetime.now() - timedelta(days=1)
        recent = await prisma.session.count(
            where={
                "createdAt": {
                    "gte": day_ago
                }
            }
        )
        
        return {
            "success": True,
            "stats": {
                "total": total,
                "recent_24h": recent,
                "by_status": status_counts,
                "by_type": type_counts
            }
        }
    except Exception as e:
        logger.error(f"Error retrieving session statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 