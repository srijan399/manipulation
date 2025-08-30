from pydantic import BaseModel
from typing import Optional


class Intent(BaseModel):
    intent: str
    topic: Optional[str] = None


class ContextQueries(BaseModel):
    queries: list[str]


class ContextSummary(BaseModel):
    summary: str


class ResponseValidation(BaseModel):
    quality: str
    reason: str
    resolution: str


class Response(BaseModel):
    response: str
