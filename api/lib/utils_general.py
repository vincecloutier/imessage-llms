import re
import json
import pendulum
from inspect import signature, Parameter
from typing import get_type_hints, get_args
from decimal import Decimal, ROUND_HALF_UP

TOOL_MAPPING = {}

def tool(func):
    """A decorator that automatically generates a JSON schema for a function's input from its signature."""
    type_map = {str: "string", int: "integer", float: "number", bool: "boolean", list: "array", dict: "object"}
    sig = signature(func)
    hints = get_type_hints(func, include_extras=True)
    properties, required = {}, []
    for name, param in sig.parameters.items():
        if name in ("user_id", "persona_id", "profile"):
            continue
        typ, desc = get_args(hints[name])
        properties[name] = {"type": type_map[typ], "description": desc}
        if param.default is Parameter.empty:
            required.append(name)
    func.expected_params = list(sig.parameters.keys())
    func.spec = {
        "type": "function",
        "function": {
            "name": func.__name__,
            "description": func.__doc__,
            "parameters": {
                "type": "object",
                "properties": properties,
                "required": required,
            }
        }
    }
    TOOL_MAPPING[func.__name__] = func
    return func

def handle_tool_call(user_id, persona_id, tool_call):
    try:
        tool_name = tool_call.function.name
        tool_args = json.loads(tool_call.function.arguments)
        tool_func = TOOL_MAPPING[tool_name]
        extra_args = {}
        if "user_id" in tool_func.expected_params:
            extra_args["user_id"] = user_id
        if "persona_id" in tool_func.expected_params:
            extra_args["persona_id"] = persona_id
        tool_result = tool_func(**extra_args, **tool_args)
        content = json.dumps(tool_result)
    except Exception as e:
        content = "Error: " + str(e)
    print(f"Tool call for {tool_name} returned {content}")
    return {"role": "tool", "tool_call_id": tool_call.id, "name": tool_name, "content": content}

def round_to_precision(n, precision=1):
    return float(Decimal(str(n)).quantize(Decimal(f'1.{"0"*precision}'), rounding=ROUND_HALF_UP))

def sanitize_response(text):
    text = re.sub(r'\(.*?\)|\[.*?\]|\{.*?\}', '', text) # removed bracketed content
    pattern = r'[^a-zA-Z0-9.,!?/\s\'"%\-]+' # remove any unwanted characters
    text = re.sub(pattern, '', text)
    text = text.replace(" .", " ") # remove any anachronistic punctuation
    text = text.replace("xoxo", "") # remove any xoxo's
    return text.lower().strip()

def is_within_wait(timestamp: str, minutes: int = 0, hours: int = 0):
    return now() - pendulum.parse(timestamp) <= pendulum.duration(minutes=minutes, hours=hours)

def parse_time(base_time, base_tz="UTC", target_tz="UTC"):
    return pendulum.parse(base_time, tz=base_tz).in_timezone(target_tz)

def now(tz="UTC"):
    return pendulum.now(tz)