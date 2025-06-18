# © 2025 April Intelligence. All rights reserved.
# This code is proprietary and confidential.
# Unauthorized use, distribution, or copying is prohibited.
# For inquiries, contact vince@aprilintelligence.com

from lib.dbv import index_upsert, index_query
from lib.llm import structured_call
from lib.prompts import CHUNKING_SYSTEM, CHUNKING_PROMPT, MERGE_SYSTEM, MERGE_PROMPT
from lib.utils_general import now

THRESHOLD = 0.5

def processor(user_id, persona_id, conversation_history):
    curr_id = conversation_history[-1]["id"]

    # split conversation text into factual chunks about the user and the agent
    chunks_by_role = chunker(conversation_history)
    print(f"Chunks by role: {chunks_by_role}")
    # process user and agent chunks to figure out final text for each chunk
    namespace = f"{user_id}/{persona_id}"
    process_chunks_for_index("memories-user", namespace, curr_id, chunks_by_role.get("user_facts", []))
    process_chunks_for_index("memories-agent", namespace, curr_id, chunks_by_role.get("agent_facts", []))

def process_chunks_for_index(index, namespace, curr_id, text_chunks):
    """Processes chunks by looking for matches and merging if necessary."""
    records, counter = [], 0
    for chunk_text in text_chunks:
        matches = index_query(index, namespace, chunk_text, top_k=1)
        if matches:
            best_match = matches[0]
            print(f"Best match: {best_match}")
            if best_match.get("_score", 0) > THRESHOLD: # found a match; attempt_merge with existing text
                merged_text = merger(best_match.get("fields", {}).get("text", ""), chunk_text)
                print(f"Merged text: {merged_text}")
                if merged_text: # we'll overwrite the existing vector
                    records.append({"id": best_match.get("_id", ""), "text": merged_text, "timestamp": now().isoformat()})
                    continue
        # if no high match or attempt_merge returned "", we create a new vector
        records.append({"id": f"{curr_id}_{counter}", "text": chunk_text, "timestamp": now().isoformat()})
        counter += 1
    if records:
        index_upsert(index, namespace, records)
    return records

def merger(first_piece, second_piece):
    """Calls the Gemini model to resolve the conflicts between the user and agent chunks."""
    model_id = "anthropic/claude-3.5-haiku"
    messages = [
        {"role": "system", "content": MERGE_SYSTEM},
        {"role": "user", "content": MERGE_PROMPT.format(first_piece=first_piece, second_piece=second_piece)},
    ]
    schema = {
        "name": "resolution",
        "strict": True,
        "schema": { 
            "type": "object",
            "properties": {
                "resolved_fact": {"type": "string", "description": "Enter the resolved fact here, or an empty string if the facts are already consistent."},
            },
            "required": ["resolved_fact"],
            "additionalProperties": False,
        }
    }
    return structured_call(model_id, messages, schema).get("resolved_fact", "")


def chunker(conversation_history):
    """Calls the Claude model to split the provided conversation text into two sets of chunks."""
    text = "\n".join(f"{m['role']}: {m['content']}" for m in conversation_history)
    model_id = "anthropic/claude-3.5-haiku"
    messages = [
        {"role": "system", "content": CHUNKING_SYSTEM},
        {"role": "user", "content": CHUNKING_PROMPT.format(text = text)},
    ]
    schema = {
        "name": "facts",
        "strict": True,
        "schema": { 
            "type": "object",
            "properties": {
                "facts": {
                    "type": "object",
                    "properties": {
                        "user_facts": {"type": "array", "description": "The list of factual details about the user.", "items": {"type": "string", "description": "A factual detail about the user."}},
                        "agent_facts": {"type": "array", "description": "The list of factual details about the agent.", "items": {"type": "string", "description": "A factual detail about the agent."}},
                    },
                    "required": ["user_facts", "agent_facts"],
                    "additionalProperties": False,
                }
            },
            "required": ["facts"],
            "additionalProperties": False,
        }
    }
    response = structured_call(model_id, messages, schema)
    return response.get("facts", {})
