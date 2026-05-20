from datetime import datetime
import re

import phonenumbers
from pydantic import BaseModel, Field, field_validator, model_validator

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


class ContactBase(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    phone: str | None = None
    email: str | None = None
    active: bool = True

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if not value:
            return None
        try:
            parsed = phonenumbers.parse(value, None)
        except phonenumbers.NumberParseException as exc:
            raise ValueError('Use E.164 phone format, for example +14155552671') from exc
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError('Invalid phone number')
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)

    @field_validator('email')
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if not value:
            return None
        normalized = value.strip().lower()
        if not EMAIL_RE.match(normalized):
            raise ValueError('Invalid email address')
        return normalized

    @model_validator(mode='after')
    def require_phone_or_email(self):
        if not self.phone and not self.email:
            raise ValueError('Phone or email is required')
        return self


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    phone: str | None = None
    email: str | None = None
    active: bool | None = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        return ContactBase.validate_phone(value)

    @field_validator('email')
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        return ContactBase.validate_email(value)


class ContactOut(ContactBase):
    id: str
    created_at: datetime
    updated_at: datetime
