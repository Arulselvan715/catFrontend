from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class AlertType(str, Enum):
    camera_off = 'CAMERA_OFF'
    drowsiness_warning = 'DROWSINESS_WARNING'
    eyes_closed_emergency = 'EYES_CLOSED_EMERGENCY'
    face_missing_emergency = 'FACE_MISSING_EMERGENCY'


class AlertSeverity(str, Enum):
    warning = 'warning'
    critical = 'critical'


class AlertMetrics(BaseModel):
    eye_closed_duration_ms: float | None = Field(default=None, ge=0)
    face_missing_duration_ms: float | None = Field(default=None, ge=0)
    confidence: float | None = Field(default=None, ge=0, le=1)
    left_ear: float | None = None
    right_ear: float | None = None
    average_ear: float | None = None


class NotificationResult(BaseModel):
    attempted: bool = False
    sent: bool = False
    skipped_reason: str | None = None
    recipients: list[str] = Field(default_factory=list)
    provider_message_ids: list[str] = Field(default_factory=list)


class AlertCreate(BaseModel):
    type: AlertType
    severity: AlertSeverity
    message: str = Field(min_length=1, max_length=500)
    metrics: AlertMetrics | None = None


class AlertOut(AlertCreate):
    id: str
    notification: NotificationResult
    sms: NotificationResult | None = None
    created_at: datetime


class AlertStats(BaseModel):
    total: int
    warnings: int
    critical: int
