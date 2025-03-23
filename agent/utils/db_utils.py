import logging
import asyncio
import traceback
import os
from typing import Any, Callable, TypeVar

from prisma import Prisma
from prisma.errors import PrismaError
from dotenv import load_dotenv


load_dotenv(dotenv_path=".env.local")

logger = logging.getLogger(__name__)

T = TypeVar('T')

_prisma_client = None

async def get_prisma_client() -> Prisma:
    """
    Get or create a Prisma client instance.
    
    Returns:
        A connected Prisma client instance
    """
    global _prisma_client
    
    if _prisma_client is None:
        logger.info("Initializing Prisma client")
        _prisma_client = Prisma()
        await _prisma_client.connect()
        
    return _prisma_client

async def close_prisma_client() -> None:
    """Close the Prisma client connection if it exists."""
    global _prisma_client
    
    if _prisma_client is not None:
        logger.info("Disconnecting Prisma client")
        await _prisma_client.disconnect()
        _prisma_client = None

# Functions needed for seed_responders.py compatibility
async def connect_db() -> Prisma:
    """
    Connect to the database and return the Prisma client.
    This is an alias for get_prisma_client for backwards compatibility.
    
    Returns:
        A connected Prisma client instance
    """
    return await get_prisma_client()

async def disconnect_db() -> None:
    """
    Disconnect from the database.
    This is an alias for close_prisma_client for backwards compatibility.
    """
    await close_prisma_client()

async def execute_db_operation(operation: Callable, *args: Any, **kwargs: Any) -> T:
    """
    Execute a database operation with error handling.
    
    Args:
        operation: The async function to execute
        *args: Positional arguments to pass to the operation
        **kwargs: Keyword arguments to pass to the operation
        
    Returns:
        The result of the operation
        
    Raises:
        Exception: If the operation fails
    """
    try:
        client = await get_prisma_client()
        result = await operation(client, *args, **kwargs)
        return result
    except PrismaError as e:
        error_message = f"Database operation failed: {str(e)}"
        logger.error(error_message)
        logger.error(traceback.format_exc())
        raise Exception(error_message) from e
    except Exception as e:
        error_message = f"Unexpected error during database operation: {str(e)}"
        logger.error(error_message)
        logger.error(traceback.format_exc())
        raise 