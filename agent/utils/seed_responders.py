#!/usr/bin/env python3
import asyncio
import logging
import random
from typing import List

from prisma.models import Responder, Location
from prisma.enums import ResponderType, ResponderStatus
from db_utils import connect_db, disconnect_db, execute_db_operation

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample data for responders
AMBULANCE_IDENTIFIERS = ["AMB-001", "AMB-002", "AMB-003", "AMB-004", "AMB-005"]
POLICE_IDENTIFIERS = ["POL-101", "POL-102", "POL-103", "POL-104", "POL-105"]
FIRE_IDENTIFIERS = ["FIRE-201", "FIRE-202", "FIRE-203"]
OTHER_IDENTIFIERS = ["OTHER-301", "OTHER-302"]

DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"]

async def create_sample_locations() -> List[Location]:
    """Create sample locations if they don't exist."""
    
    async def _operation(client):
        locations = []
        
        for district in DISTRICTS:
            # Check if location already exists
            existing = await client.location.find_first(
                where={"district": district}
            )
            
            if existing:
                locations.append(existing)
                logger.info(f"Location already exists: {district}")
                continue
            
            # Create new location
            new_location = await client.location.create(
                data={
                    "address": f"{district} District Center",
                    "landmark": f"{district} Main Road",
                    "city": district,
                    "district": district,
                    "gpsCoordinates": f"{random.uniform(8.0, 13.0)},{random.uniform(76.0, 80.5)}"
                }
            )
            locations.append(new_location)
            logger.info(f"Created location: {district}")
            
        return locations
    
    return await execute_db_operation(_operation)

async def seed_responders():
    """Seed the database with sample responders."""
    
    # First, create or get locations
    locations = await create_sample_locations()
    location_ids = [loc.id for loc in locations]
    
    async def _create_responders(client):
        # Create ambulances
        for identifier in AMBULANCE_IDENTIFIERS:
            existing = await client.responder.find_first(
                where={"identifier": identifier}
            )
            
            if existing:
                logger.info(f"Responder already exists: {identifier}")
                continue
                
            await client.responder.create(
                data={
                    "responderType": ResponderType.AMBULANCE,
                    "identifier": identifier,
                    "status": random.choice(list(ResponderStatus)),
                    "locationId": random.choice(location_ids)
                }
            )
            logger.info(f"Created ambulance: {identifier}")
        
        # Create police units
        for identifier in POLICE_IDENTIFIERS:
            existing = await client.responder.find_first(
                where={"identifier": identifier}
            )
            
            if existing:
                logger.info(f"Responder already exists: {identifier}")
                continue
                
            await client.responder.create(
                data={
                    "responderType": ResponderType.POLICE,
                    "identifier": identifier,
                    "status": random.choice(list(ResponderStatus)),
                    "locationId": random.choice(location_ids)
                }
            )
            logger.info(f"Created police unit: {identifier}")
        
        # Create fire units
        for identifier in FIRE_IDENTIFIERS:
            existing = await client.responder.find_first(
                where={"identifier": identifier}
            )
            
            if existing:
                logger.info(f"Responder already exists: {identifier}")
                continue
                
            await client.responder.create(
                data={
                    "responderType": ResponderType.FIRE,
                    "identifier": identifier,
                    "status": random.choice(list(ResponderStatus)),
                    "locationId": random.choice(location_ids)
                }
            )
            logger.info(f"Created fire unit: {identifier}")
        
        # Create other responders
        for identifier in OTHER_IDENTIFIERS:
            existing = await client.responder.find_first(
                where={"identifier": identifier}
            )
            
            if existing:
                logger.info(f"Responder already exists: {identifier}")
                continue
                
            await client.responder.create(
                data={
                    "responderType": ResponderType.OTHER,
                    "identifier": identifier,
                    "status": random.choice(list(ResponderStatus)),
                    "locationId": random.choice(location_ids)
                }
            )
            logger.info(f"Created other responder: {identifier}")
            
        # Count responders
        count = await client.responder.count()
        return count
    
    count = await execute_db_operation(_create_responders)
    logger.info(f"Total responders in database: {count}")
    return count

async def main():
    try:
        await connect_db()
        logger.info("Starting responder seeding...")
        count = await seed_responders()
        logger.info(f"Seeding completed. {count} total responders in database.")
    except Exception as e:
        logger.error(f"Error seeding database: {str(e)}")
        raise
    finally:
        await disconnect_db()

if __name__ == "__main__":
    asyncio.run(main()) 