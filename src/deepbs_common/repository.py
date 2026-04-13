from __future__ import annotations

import json
from pathlib import Path

from .schemas import Project
from .settings import settings


class ProjectRepository:
    def __init__(self, data_dir: str | None = None) -> None:
        base_dir = Path(data_dir or settings.data_dir)
        self.projects_dir = base_dir / "projects"
        self.projects_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, project_id: str) -> Path:
        return self.projects_dir / f"{project_id}.json"

    def list_projects(self) -> list[Project]:
        projects: list[Project] = []
        for path in sorted(self.projects_dir.glob("*.json")):
            projects.append(Project.model_validate_json(path.read_text(encoding="utf-8")))
        return projects

    def create_project(self, project: Project) -> Project:
        self.save_project(project)
        return project

    def get_project(self, project_id: str) -> Project:
        path = self._path(project_id)
        if not path.exists():
            raise FileNotFoundError(project_id)
        return Project.model_validate_json(path.read_text(encoding="utf-8"))

    def save_project(self, project: Project) -> Project:
        path = self._path(project.id)
        path.write_text(
            json.dumps(project.model_dump(mode="json"), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return project


repository = ProjectRepository()

