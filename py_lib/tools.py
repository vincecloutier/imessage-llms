import os
from exa_py import Exa
from typing import Annotated

from py_lib.dbv import index_query
from py_lib.utils_general import tool

@tool
def get_facts(
    user_id: str,
    persona_id: str,
    user_query: Annotated[str, "The query to search for relevant facts about the user."],
    agent_query: Annotated[str, "The query to search for relevant facts about yourself."]
):
    """Search for relevant facts about the user and/or yourself."""
    def format_hits(hits):
        return [{"text": h["fields"].get("text", ""), "uploaded_at": h["fields"].get("timestamp", "")} for h in hits] if hits else []
    namespace = f"{user_id}/{persona_id}"
    user_facts = format_hits(index_query("memories-user", namespace, user_query)) if user_query else []
    agent_facts = format_hits(index_query("memories-agent", namespace, agent_query)) if agent_query else []
    return {"facts_about_user": user_facts, "facts_about_you": agent_facts}

@tool
def search_internet(query: Annotated[str, "Question to ask the internet."]):
    """Get an answer to a question from the internet."""
    exa = Exa(api_key = os.getenv("EXA_API_KEY"))
    return exa.answer(query, model="exa").answer