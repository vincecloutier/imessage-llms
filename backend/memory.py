# © 2025 April Intelligence. All rights reserved.
# This code is proprietary and confidential.
# Unauthorized use, distribution, or copying is prohibited.
# For inquiries, contact vince@aprilintelligence.com

from backend.dbv import index_upsert, index_query
from backend.llm import structured_call
from backend.utils import now

THRESHOLD = 0.5


def processor(user_id, persona_id, conversation_history):
    curr_id = conversation_history[-1]["id"]

    # split conversation text into factual chunks about the user and the agent
    chunks_by_role = chunker(conversation_history)
    print(f"Chunks by role: {chunks_by_role}")
    # process user and agent chunks to figure out final text for each chunk
    namespace = f"{user_id}/{persona_id}"
    process_chunks_for_index(
        "memories-user", namespace, curr_id, chunks_by_role.get("user_facts", [])
    )
    process_chunks_for_index(
        "memories-agent", namespace, curr_id, chunks_by_role.get("agent_facts", [])
    )


def process_chunks_for_index(index, namespace, curr_id, text_chunks):
    """Processes chunks by looking for matches and merging if necessary."""
    records, counter = [], 0
    for chunk_text in text_chunks:
        matches = index_query(index, namespace, chunk_text, top_k=1)
        if matches:
            best_match = matches[0]
            print(f"Best match: {best_match}")
            if (
                best_match.get("_score", 0) > THRESHOLD
            ):  # found a match; attempt_merge with existing text
                merged_text = merger(
                    best_match.get("fields", {}).get("text", ""), chunk_text
                )
                print(f"Merged text: {merged_text}")
                if merged_text:  # we'll overwrite the existing vector
                    records.append(
                        {
                            "id": best_match.get("_id", ""),
                            "text": merged_text,
                            "timestamp": now().isoformat(),
                        }
                    )
                    continue
        # if no high match or attempt_merge returned "", we create a new vector
        records.append(
            {
                "id": f"{curr_id}_{counter}",
                "text": chunk_text,
                "timestamp": now().isoformat(),
            }
        )
        counter += 1
    if records:
        index_upsert(index, namespace, records)
    return records


def merger(first_piece, second_piece):
    """Calls the Gemini model to resolve the conflicts between the user and agent chunks."""
    model_id = "anthropic/claude-3.5-haiku"
    messages = [
        {"role": "system", "content": MERGE_SYSTEM},
        {
            "role": "user",
            "content": MERGE_PROMPT.format(
                first_piece=first_piece, second_piece=second_piece
            ),
        },
    ]
    schema = {
        "name": "resolution",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "resolved_fact": {
                    "type": "string",
                    "description": "Enter the resolved fact here, or an empty string if the facts are already consistent.",
                },
            },
            "required": ["resolved_fact"],
            "additionalProperties": False,
        },
    }
    return structured_call(model_id, messages, schema).get("resolved_fact", "")


def chunker(conversation_history):
    """Calls the Claude model to split the provided conversation text into two sets of chunks."""
    text = "\n".join(f"{m['role']}: {m['content']}" for m in conversation_history)
    model_id = "anthropic/claude-3.5-haiku"
    messages = [
        {"role": "system", "content": CHUNKING_SYSTEM},
        {"role": "user", "content": CHUNKING_PROMPT.format(text=text)},
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
                        "user_facts": {
                            "type": "array",
                            "description": "The list of factual details about the user.",
                            "items": {
                                "type": "string",
                                "description": "A factual detail about the user.",
                            },
                        },
                        "agent_facts": {
                            "type": "array",
                            "description": "The list of factual details about the agent.",
                            "items": {
                                "type": "string",
                                "description": "A factual detail about the agent.",
                            },
                        },
                    },
                    "required": ["user_facts", "agent_facts"],
                    "additionalProperties": False,
                }
            },
            "required": ["facts"],
            "additionalProperties": False,
        },
    }
    response = structured_call(model_id, messages, schema)
    return response.get("facts", {})



CHUNKING_SYSTEM = """
You are an expert text classification system specializing in semantic chunking of conversations in a romantic relationship context.
Your role is to analyze a conversation between a partner chatbot (the agent) and a human user, and extract only factual and actionable information that is useful for future interactions.

Here is the context of the output:
<context>
    Your output is used to manage long-term memory for a virtual companion chatbot.
    The factual details saved will help the chatbot recall useful personal information—such as preferences, experiences, and past interactions—for both the user and the agent.
    After processing the conversation, the resulting JSON will be parsed and the factual details will be embedded and stored in a vector database.
    Later, these details will be used to tailor the chatbot's responses, ensuring both user and agent facts are consistent, realistic, and actionable.
    A successful outcome is one where only specific, factual, and actionable pieces of information are saved in the JSON. Generic or purely emotional statements should be excluded.
</context>

Here are the instructions for the output:
<instructions>
    1. Analyze the conversation provided above.
    2. Save only specific, factual details that are useful for future interactions. For example:
       - SAVE: Personal preferences (e.g., "likes tacos", "likes it when the agent kisses their neck", "i hate when it's cold outside").
       - SAVE: Past experiences (e.g., "had a negative association to the SuperBowl because his dad used to get drunk").
       - SAVE: Notable events or interactions (e.g., "had a negative interaction with his roommate Angelina because she didn't wash the dishes")
       - SAVE: Details about their life (e.g., "tries to go to the gym every night").
    NOTE: Treat the agent as a real person. When the agent provides personal details, extract them as factual information just as you would for the user.
    3. Ignore all information that is not useful for future interactions. For example:
        - IGNORE: Generic statements about the weather, current events, or other short-term information (e.g. "it is 12 degrees outside", "is going to the gym tonight").
    NOTE: It is okay to return an empty user_facts or agent_facts list if there are no relevant facts to save.
    3. For each relevant fact, create a element within the appropriate category:
       - user_facts: For factual details provided by the user. 
       - agent_facts: For factual details provided by the agent.
    IMPORTANT: Each fact should be between 100-500 characters for optimal embedding.
    IMPORTANT: Each fact should be semantically distinct from the others.
    4. Output only valid JSON using the structure shown in the example. Do not include any additional text or commentary.
</instructions>

Here is an example of how to chunk a conversation:
<example>
    INPUT:
    user: I just got home, the drive from Laguardia was so long.
    agent: I thought you told me you lived in San Francisco.
    user: I actually just moved to New York.
    agent: Oh I didn't know that.
    user: I don't really like the SuperBowl because my dad used to get drunk every year.
    agent: I know how you feel. I actually love tacos—they remind me of the good times from my childhood.
    user: Also, my roommate Angelina never washes the dishes and it really frustrates me.
    user: I miss you and I wish I could visit you.
    agent: I miss you too. did you know it's 12 degrees outside?
    user: I know, I'm freezing.
    agent: I'm sorry to hear that.
    user: I hate when it's cold outside.
    agent: i get that, but i love it! 
    user: I'm going to the gym tonight
    agent: do you do that often? 
    user: I try to go every night.
    agent: i'm impressed. the last time i went to the gym was 2 years ago.

    OUTPUT: 
    {
        "facts": {
            "user_facts": [
                "User has a negative association to the SuperBowl because their dad used to get drunk.",
                "User is frustrated by the fact that his roommate Angelina never washes the dishes.",
                "User moved from San Francisco to New York.",
                "User hates when it's cold outside.",
                "User tries to go to the gym every night.",
            ],
            "agent_facts": [
                "Agent likes tacos because they remind them of good times from their childhood.",
                "Agent loves when it's cold outside.",
            ]
        }
    }
</example>
"""

CHUNKING_PROMPT = """
Here is the conversation to chunk:
<conversation to chunk>
    {text}
</conversation to chunk>

Now please chunk the provided conversation in the <conversation to chunk> section as described in your system prompt.
Remember to output only valid JSON using the structure shown in the example. Do not include any additional text or commentary.
"""

MERGE_SYSTEM = """
You are an expert text classification system specializing in merging semantically similar pieces of information.
Your role is to analyze two pieces of factual information, and decide whether to combine the two pieces of information or keep them separate.

Here are the instructions for the output:
<instructions>
    1. Analyze the two pieces of information (provided in <first_piece> and <second_piece>) to determine if they are about the same topic/entity/person/etc.
    2. If the two pieces of information are about the same topic/entity/person/etc, combine the two pieces of information into a single piece of information while ensuring that we don't lose any details.
        a. If the two pieces contain conflicting details, prioritize the <second_piece>, while allowing for the <first_piece> to provide additional context.
        b. Return the merged piece of information in JSON format in resolved_fact.
        c. Ensure your response is between 100 and 500 characters for optimal embedding.
    3. Otherwise, the two pieces of information are not sufficiently similar, and so you should return an empty JSON object in resolved_fact.
    4. Output only valid JSON using the structure shown in the example. Do not include any additional text or commentary.
</instructions>

Here is an example of how to merge similar information:
<example>
    INPUT:
    <first_piece>
        User has a dog named Max who is extremely important to them.
    </first_piece>

    <second_piece>
        User has a golden retriever named Max.
    </second_piece>

    OUTPUT:
    {
        "resolved_fact": "Has a golden retriever named Max who is extremely important to them."
    }
</example>

Here is an example of how to merge conflicting information:
<example>
    INPUT:
    <first_piece>
        User does not like the SuperBowl because their dad used to get drunk every year during the game.
    </first_piece>

    <second_piece>
        User enjoyed the SuperBowl because they spent it with their friends.
    </second_piece>

    OUTPUT: 
    {
        "resolved_fact": "User enjoyed the SuperBowl because they spent it with their friends, but previously didn't like it because their dad used to get drunk during the game."
    }
</example>

Here is an example of when you should not merge information:
<example>
    INPUT:
    <first_piece> 
        Agent has a dog named Max who is extremely important to them.
    </first_piece>

    <second_piece>
        Agent has a cat named Waffles.
    </second_piece>

    OUTPUT:
    {
        "resolved_fact": ""
    }
</example>
"""

MERGE_PROMPT = """
Here is the first piece of information:
<first_piece>
    {first_piece}
</first_piece>

Here is the second piece of information:
<second_piece>
    {second_piece}
</second_piece>

Now, please decide whether to merge these two pieces of information or to keep them separate as described in your system prompt.
Remember to output only valid JSON using the structure shown in the example. Do not include any additional text or commentary.
"""
