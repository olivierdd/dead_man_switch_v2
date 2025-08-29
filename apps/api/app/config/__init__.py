"""
Configuration package for Secret Safe API
"""

from .supabase import (
    get_supabase_client,
    get_supabase_service_client,
    get_postgrest_client,
    test_supabase_connection,
    get_supabase_info
)

__all__ = [
    "get_supabase_client",
    "get_supabase_service_client",
    "get_postgrest_client",
    "test_supabase_connection",
    "get_supabase_info"
]
