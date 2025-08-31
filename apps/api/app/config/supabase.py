"""
Supabase configuration and client setup for Secret Safe API
"""

import os
from typing import Optional

import structlog
from postgrest import PostgrestClient
from supabase import Client, create_client

logger = structlog.get_logger()


class SupabaseConfig:
    """Supabase configuration and client management"""

    def __init__(self):
        self.url: str = os.getenv("SUPABASE_URL", "")
        self.anon_key: str = os.getenv("SUPABASE_KEY", "")
        self.service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.database_url: str = os.getenv("DATABASE_URL", "")

        # Initialize clients
        self._client: Optional[Client] = None
        self._postgrest_client: Optional[PostgrestClient] = None

        # Validate configuration
        self._validate_config()

    def _validate_config(self):
        """Validate Supabase configuration"""
        if not self.url:
            logger.warning("SUPABASE_URL not set")
        if not self.anon_key:
            logger.warning("SUPABASE_KEY not set")
        if not self.service_role_key:
            logger.warning("SUPABASE_SERVICE_ROLE_KEY not set")
        if not self.database_url:
            logger.warning("DATABASE_URL not set")

    @property
    def client(self) -> Client:
        """Get Supabase client instance"""
        if not self._client:
            if not self.url or not self.anon_key:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

            self._client = create_client(self.url, self.anon_key)
            logger.info("Supabase client initialized", url=self.url)

        return self._client

    @property
    def service_client(self) -> Client:
        """Get Supabase service role client for admin operations"""
        if not self.url or not self.service_role_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

        return create_client(self.url, self.service_role_key)

    @property
    def postgrest_client(self) -> PostgrestClient:
        """Get PostgREST client for direct database operations"""
        if not self._postgrest_client:
            if not self.url or not self.anon_key:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

            self._postgrest_client = PostgrestClient(
                base_url=f"{self.url}/rest/v1",
                headers={
                    "apikey": self.anon_key,
                    "Authorization": f"Bearer {self.anon_key}",
                },
            )
            logger.info("PostgREST client initialized")

        return self._postgrest_client

    def get_auth_client(self):
        """Get Supabase Auth client"""
        return self.client.auth

    def get_storage_client(self):
        """Get Supabase Storage client"""
        return self.client.storage

    def get_realtime_client(self):
        """Get Supabase Realtime client"""
        return self.client.realtime

    def test_connection(self) -> dict:
        """Test Supabase connection and return status"""
        try:
            # Test basic connection
            response = self.client.table("_dummy_table_").select("*").limit(1).execute()

            return {
                "status": "connected",
                "url": self.url,
                "features": {
                    "auth": True,
                    "storage": True,
                    "realtime": True,
                    "rls": True,
                },
            }
        except Exception as e:
            logger.error("Supabase connection test failed", error=str(e))
            return {"status": "failed", "url": self.url, "error": str(e)}

    def get_connection_info(self) -> dict:
        """Get connection information for debugging"""
        return {
            "url": self.url,
            "has_anon_key": bool(self.anon_key),
            "has_service_key": bool(self.service_role_key),
            "has_database_url": bool(self.database_url),
            "features": {"auth": True, "storage": True, "realtime": True, "rls": True},
        }


# Global Supabase configuration instance
supabase_config = SupabaseConfig()


def get_supabase_client() -> Client:
    """Get Supabase client instance"""
    return supabase_config.client


def get_supabase_service_client() -> Client:
    """Get Supabase service role client"""
    return supabase_config.service_client


def get_postgrest_client() -> PostgrestClient:
    """Get PostgREST client instance"""
    return supabase_config.postgrest_client


def test_supabase_connection() -> dict:
    """Test Supabase connection"""
    return supabase_config.test_connection()


def get_supabase_info() -> dict:
    """Get Supabase configuration information"""
    return supabase_config.get_connection_info()
