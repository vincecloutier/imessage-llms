# © 2025 April Intelligence. All rights reserved.
# This code is proprietary and confidential.
# Unauthorized use, distribution, or copying is prohibited.
# For inquiries, contact vince@aprilintelligence.com

import os
import uuid
import requests
from supabase import create_client, Client


supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)
_table_cache = {}

CONTEXT_WINDOW = 30


def get_table(table_name):
    if table_name in _table_cache:
        return _table_cache[table_name]
    tbl = supabase.table(table_name)
    _table_cache[table_name] = tbl
    return tbl


def get_profiles():
    resp = get_table("profiles").select("*").execute()
    return resp.data if resp and resp.data else []


def get_profile(channel: str, user_id: str):
    query = get_table("profiles").select("*")
    if channel == "telegram":
        query = query.eq("telegram_address", user_id)
    elif channel == "imessage":
        query = query.eq("imessage_address", user_id)
    else:
        query = query.eq("id", user_id)
    resp = query.maybe_single().execute()
    return resp.data if resp and resp.data else None


def get_profile_personas(profile_id: str):
    resp = get_table("personas").select("*").eq("user_id", profile_id).execute()
    return resp.data if resp and resp.data else []


def get_persona(channel: str, user_id: str, persona_id: str):
    query = get_table("personas").select("*").eq("user_id", user_id)
    if channel == "web":
        query = query.eq("id", persona_id)
    elif channel == "telegram":
        query = query.eq("is_telegram_persona", True)
    elif channel == "imessage":
        query = query.eq("is_imessage_persona", True)
    resp = query.maybe_single().execute()
    return resp.data if resp and resp.data else None


def get_messages(user_id: str, persona_id: str, channel: str, memorized: bool = None):
    table_name = "messages" if persona_id != "new" else "anonymous_messages"
    query = (
        get_table(table_name)
        .select("*")
        .eq("user_id", user_id)
        .eq("persona_id", persona_id)
        .eq("channel", channel)
        .order("created_at", desc=True)
        .limit(CONTEXT_WINDOW)
    )
    if memorized is not None:
        query = query.eq("memorized", memorized)
    resp = query.execute()
    return resp.data[::-1] if resp and resp.data else []


def save_message(
    user_id: str,
    persona_id: str,
    channel: str,
    role: str,
    content: str,
    attachment: dict = None,
):
    table_name = "messages" if persona_id != "new" else "anonymous_messages"
    message = {
        "user_id": user_id,
        "persona_id": persona_id,
        "channel": channel,
        "role": role,
        "content": content,
    }
    if attachment:
        message["file_path"] = upload_attachment(user_id, persona_id, attachment)
        from backend.llm import get_attachment_description

        message["file_description"] = get_attachment_description(
            attachment["bytes"], attachment["mime_type"]
        )
    get_table(table_name).insert(message).execute()
    if role == "assistant" and persona_id != "new":
        unmemorized = get_messages(user_id, persona_id, channel, False)
        if len(unmemorized) >= CONTEXT_WINDOW:
            from backend.memory import processor

            processor(user_id, persona_id, unmemorized)
            ids = [msg["id"] for msg in unmemorized]
            get_table(table_name).update({"memorized": True}).in_("id", ids).execute()


def upload_attachment(user_id: str, persona_id: str, attachment: dict):
    path = f"{user_id}/{persona_id}/{uuid.uuid4()}.{attachment['name'].split('.')[-1]}"
    supabase.storage.from_("attachments").upload(
        path, attachment["bytes"], {"content-type": attachment["mime_type"]}
    )
    return path


def update_server_address(address: str):
    get_table("server").upsert({"id": 1, "url": address}).execute()


def get_server_address():
    resp = get_table("server").select("url").eq("id", 1).maybe_single().execute()
    return resp.data["url"] if resp.data else None