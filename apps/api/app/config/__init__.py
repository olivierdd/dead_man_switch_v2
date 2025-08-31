"""
Configuration package for Secret Safe API
"""

from .supabase import (get_postgrest_client, get_supabase_client,
                       get_supabase_info, get_supabase_service_client,
                       test_supabase_connection)

__all__ = [
    "get_supabase_client",
    "get_supabase_service_client",
    "get_postgrest_client",
    "test_supabase_connection",
    "get_supabase_info",
]
