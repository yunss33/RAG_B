from __future__ import annotations

from typing import Any


class LLMProvider:
    async def generate(self, prompt: str) -> str:
        raise NotImplementedError

    async def structured_generate(self, prompt: str, schema_name: str) -> dict[str, Any]:
        raise NotImplementedError

    async def embed(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError


class StubLLMProvider(LLMProvider):
    async def generate(self, prompt: str) -> str:
        return f"Stub response for: {prompt[:120]}"

    async def structured_generate(self, prompt: str, schema_name: str) -> dict[str, Any]:
        return {"schema": schema_name, "summary": f"Stub structured output for {prompt[:80]}"}

    async def embed(self, texts: list[str]) -> list[list[float]]:
        return [[float(len(text) % 10), float((len(text) // 10) % 10), 1.0] for text in texts]


llm_provider = StubLLMProvider()
