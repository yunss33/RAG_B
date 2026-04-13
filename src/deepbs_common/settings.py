from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    data_dir: str = "data"
    object_dir: str = "data/objects"
    public_object_base: str = "http://localhost:8100/objects"
    orchestrator_base_url: str = "http://localhost:8101"
    rag_service_base_url: str = "http://localhost:8102"
    agent_runtime_base_url: str = "http://localhost:8103"
    
    # Qdrant settings
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_api_key: str | None = None
    qdrant_collection_name: str = "deepbs_documents"

    model_config = SettingsConfigDict(
        env_prefix="DEEPBS_",
        extra="ignore",
    )


settings = Settings()
