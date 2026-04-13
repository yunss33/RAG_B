from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    data_dir: str = "data"
    object_dir: str = "data/objects"
    public_object_base: str = "http://localhost:8100/objects"
    orchestrator_base_url: str = "http://localhost:8101"
    rag_service_base_url: str = "http://localhost:8102"
    agent_runtime_base_url: str = "http://localhost:8103"

    model_config = SettingsConfigDict(
        env_prefix="DEEPBS_",
        extra="ignore",
    )


settings = Settings()
