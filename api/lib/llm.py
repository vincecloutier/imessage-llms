# © 2025 April Intelligence. All rights reserved.
# This code is proprietary and confidential.
# Unauthorized use, distribution, or copying is prohibited.
# For inquiries, contact vince@aprilintelligence.com

import os
import json
import base64
import requests

from openai import OpenAI

from lib.prompts import SHORT_PROMPT, RESPONDING_PROMPT
from lib.tools import search_internet, get_facts
from lib.utils_general import handle_tool_call

client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=os.getenv("OPENROUTER_API_KEY"))

def llm_call(profile, persona, profile_id, persona_id, msgs):
    # msgs = [{"role": m["role"], "content": f"({parse_time(m['created_at'], 'UTC', profile['timezone']).strftime('%a %I:%M%p')})\n{m['content']}"} for m in msgs]
    new_msgs = []
    for m in msgs:
        new_msgs.append({"role": m["role"], "content": m["content"]})
        if m.get("file_description"):
            new_msgs.append({"role": "system", "content": f"The user sent you an image with the following description: \n {m['file_description']}"})

    short_msg = {"role": "system", "content": SHORT_PROMPT}

    tools = [search_internet.spec, get_facts.spec]
    system_msg = {"role": "system", "content": RESPONDING_PROMPT(profile, persona)}

    new_msgs[:0] = [short_msg, system_msg]

    print(new_msgs)

    for i in range(5):
        # tool_choice = {"type": "function", "function": {"name": "get_facts"}} if (i == 0 and profile and persona) else "auto"
        resp = client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
            messages=new_msgs,
            tools=tools,
            tool_choice="auto",
            temperature=1.5,
            frequency_penalty=1,
            presence_penalty=1,
            max_tokens=100,
        )
        print("Full JSON:", resp)
        message = resp.choices[0].message
        new_msgs.append(message)
        if message.tool_calls:
            for tool_call in message.tool_calls:
                new_msgs.append(handle_tool_call(profile_id, persona_id, tool_call))
        else:
            return message.content
    return message.content

def get_attachment_description(data, mime_type):
    data_url = f"data:{mime_type};base64,{base64.b64encode(data).decode('utf-8')}"
    resp = client.chat.completions.create(
        model="google/gemini-2.0-flash-001",
        messages=[{"role": "user", "content": [{"type": "text", "text": "Reply with a short description of this image."}, 
                                               {"type": "image_url", "image_url": {"url": data_url}}]},
                  {"role": "assistant", "content": "Image Description: "}],
        max_tokens=100,
        temperature=0.3,
        frequency_penalty=1,
        presence_penalty=1
    )
    return resp.choices[0].message.content

def structured_call(model_id, messages, schema):
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "Content-Type": "application/json",
        },
        json={
            "model": model_id,
            "messages": messages, 
            "response_format": {
                "type": "json_schema",
                "json_schema": schema 
            }
        }
    )
    print(response.json())
    return json.loads(response.json()["choices"][0]["message"]["content"])

def chat_completion(system_prompt, conv_history, model):
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        },
        data=json.dumps({
            "model": "openai/o3", # Optional
            "messages": [
            {
                "role": "system",
                "content": system_prompt
            }
            ] + conv_history
        })
    )
    print("Chat Completion Response:")
    print(response.json())

    return json.loads(response.json()["choices"][0]["message"]["content"])