from __future__ import annotations

from typing import Any
import os
import httpx
import json

from .settings import settings


class LLMProvider:
    async def generate(self, prompt: str) -> str:
        raise NotImplementedError

    async def structured_generate(self, prompt: str, schema_name: str) -> dict[str, Any]:
        raise NotImplementedError

    async def embed(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError


class DashscopeLLMProvider(LLMProvider):
    def __init__(self, model_name: str | None = None, api_key: str | None = None):
        self.model_name = model_name or settings.model_name or os.getenv("MODEL_NAME") or "qwen-plus"
        self.api_key = api_key or settings.dashscope_api_key or os.getenv("DASHSCOPE_API_KEY")
        # 检查是否是开源模型（需要使用OpenAI兼容接口）
        self.is_open_source_model = self.model_name.startswith("qwen3.") and ("-" in self.model_name)
        self.base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    
    async def generate(self, prompt: str) -> str:
        try:
            if self.is_open_source_model:
                return await self._generate_openai_compatible(prompt)
            else:
                return await self._generate_dashscope(prompt)
        except Exception as e:
            print(f"LLM调用失败: {e}")
            raise
    
    async def _generate_dashscope(self, prompt: str) -> str:
        import dashscope
        if self.api_key:
            dashscope.api_key = self.api_key
        resp = dashscope.Generation.call(
            model=self.model_name,
            prompt=prompt,
        )
        if resp.status_code == 200:
            return resp.output.text
        else:
            raise Exception(f"API返回错误: {resp}")
    
    async def _generate_openai_compatible(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": self.model_name,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
    
    async def structured_generate(self, prompt: str, schema_name: str) -> dict[str, Any]:
        try:
            if self.is_open_source_model:
                content = await self._generate_openai_compatible(prompt)
                return {"schema": schema_name, "content": content}
            else:
                return await self._structured_generate_dashscope(prompt, schema_name)
        except Exception as e:
            print(f"结构化LLM调用失败: {e}")
            raise
    
    async def _structured_generate_dashscope(self, prompt: str, schema_name: str) -> dict[str, Any]:
        import dashscope
        if self.api_key:
            dashscope.api_key = self.api_key
        resp = dashscope.Generation.call(
            model=self.model_name,
            prompt=prompt,
            result_format='message'
        )
        if resp.status_code == 200:
            return {"schema": schema_name, "content": resp.output.choices[0].message.content}
        else:
            raise Exception(f"API返回错误: {resp}")
    
    async def embed(self, texts: list[str]) -> list[list[float]]:
        try:
            from .embedding import embedding_manager
            return embedding_manager.get_embeddings(texts)
        except Exception as e:
            print(f"Embedding调用失败: {e}")
            raise


class StubLLMProvider(LLMProvider):
    async def generate(self, prompt: str) -> str:
        return f"Stub response for: {prompt[:120]}"

    async def structured_generate(self, prompt: str, schema_name: str) -> dict[str, Any]:
        return {"schema": schema_name, "summary": f"Stub structured output for {prompt[:80]}"}

    async def embed(self, texts: list[str]) -> list[list[float]]:
        return [[float(len(text) % 10), float((len(text) // 10) % 10), 1.0] for text in texts]


llm_provider = DashscopeLLMProvider()
