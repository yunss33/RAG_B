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
    
    # 模型配置
    model_name: str = "qwen3.5-27b"
    dashscope_api_key: str = "sk-e0a3c05a49d444d79967e67cc5d1a2a9"
    
    # 功能开关
    enable_rag: bool = False
    enable_ai_thinking: bool = True

    model_config = SettingsConfigDict(
        env_prefix="DEEPBS_",
        extra="ignore",
    )


settings = Settings()
