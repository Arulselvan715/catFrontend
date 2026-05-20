from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def serialize_document(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None
    document = dict(document)
    document['id'] = str(document.pop('_id'))
    return document


def object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise ValueError('Invalid object id')
    return ObjectId(value)
