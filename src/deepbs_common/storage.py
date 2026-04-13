from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from .settings import settings


class ObjectStorage:
    def put_file(self, file_name: str, content: bytes) -> str:
        raise NotImplementedError

    def get_file_url(self, object_key: str) -> str:
        raise NotImplementedError

    def delete_file(self, object_key: str) -> None:
        raise NotImplementedError

    def copy_file(self, object_key: str, target_name: str) -> str:
        raise NotImplementedError


class LocalObjectStorage(ObjectStorage):
    def __init__(self, object_dir: str | None = None, public_base: str | None = None) -> None:
        self.object_dir = Path(object_dir or settings.object_dir)
        self.object_dir.mkdir(parents=True, exist_ok=True)
        self.public_base = (public_base or settings.public_object_base).rstrip("/")

    def put_file(self, file_name: str, content: bytes) -> str:
        suffix = Path(file_name).suffix
        object_key = f"{uuid4()}{suffix}"
        (self.object_dir / object_key).write_bytes(content)
        return object_key

    def get_file_url(self, object_key: str) -> str:
        return f"{self.public_base}/{object_key}"

    def delete_file(self, object_key: str) -> None:
        path = self.object_dir / object_key
        if path.exists():
            path.unlink()

    def copy_file(self, object_key: str, target_name: str) -> str:
        return self.put_file(target_name, (self.object_dir / object_key).read_bytes())

    def read_text(self, object_key: str) -> str:
        path = self.object_dir / object_key
        suffix = path.suffix.lower()
        if suffix in {".txt", ".md", ".html", ".json", ".csv"}:
            return path.read_text(encoding="utf-8", errors="ignore")
        return ""

    def read_bytes(self, object_key: str) -> bytes:
        return (self.object_dir / object_key).read_bytes()


storage = LocalObjectStorage()

