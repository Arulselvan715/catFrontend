from fastapi import APIRouter, HTTPException, status
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_database
from app.models.common import now_utc, object_id, serialize_document
from app.schemas.contact import ContactCreate, ContactOut, ContactUpdate

router = APIRouter()


@router.get('/', response_model=list[ContactOut])
async def list_contacts() -> list[dict]:
    db = get_database()
    contacts = await db.contacts.find().sort('created_at', -1).to_list(length=100)
    return [serialize_document(contact) for contact in contacts]


@router.post('/', response_model=ContactOut, status_code=status.HTTP_201_CREATED)
async def create_contact(payload: ContactCreate) -> dict:
    db = get_database()
    now = now_utc()
    document = payload.model_dump()
    document.update({'created_at': now, 'updated_at': now})
    try:
        result = await db.contacts.insert_one(document)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail='Phone number already exists') from exc
    contact = await db.contacts.find_one({'_id': result.inserted_id})
    return serialize_document(contact)


@router.patch('/{contact_id}', response_model=ContactOut)
async def update_contact(contact_id: str, payload: ContactUpdate) -> dict:
    db = get_database()
    try:
        oid = object_id(contact_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail='Invalid contact id') from exc

    update = {key: value for key, value in payload.model_dump().items() if value is not None}
    if not update:
        raise HTTPException(status_code=400, detail='No fields provided')
    update['updated_at'] = now_utc()

    try:
        contact = await db.contacts.find_one_and_update({'_id': oid}, {'$set': update}, return_document=ReturnDocument.AFTER)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail='Phone number already exists') from exc
    if contact is None:
        raise HTTPException(status_code=404, detail='Contact not found')
    return serialize_document(contact)


@router.delete('/{contact_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(contact_id: str) -> None:
    db = get_database()
    try:
        oid = object_id(contact_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail='Invalid contact id') from exc
    result = await db.contacts.delete_one({'_id': oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Contact not found')
