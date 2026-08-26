from fastapi import Depends
from core.security import verify_api_key

async def common_auth_dep(authorized: bool = Depends(verify_api_key)):
    return authorized
