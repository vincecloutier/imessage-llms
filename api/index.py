from flask import Flask, request, jsonify
from lib.dbp import get_profile, save_message, get_messages, get_persona
from lib.llm import llm_call
from lib.utils_general import sanitize_response
import random
from flask_cors import CORS
from flask import Flask, request, jsonify
from lib.messaging import Messaging, BlueBubbles, Telegram

BOTS: dict[str, Messaging] = {"imessage": BlueBubbles(), "telegram": Telegram()}

app = Flask(__name__)

@app.route('/api/frontend')
def frontend():
    # parse request
    data = request.form
    user_id, persona_id, message, attachment_file = data.get("user_id"), data.get("persona_id"), data.get("message"), request.files.get("attachment")
    attachment_data = {"name": attachment_file.filename, "bytes": attachment_file.read(), "mime_type": attachment_file.mimetype} if attachment_file else None

    # get user profile
    profile = get_profile("web", user_id)
    
    # get persona
    persona = get_persona("web", user_id, persona_id)

    # save user message
    save_message(user_id, persona_id, "web", "user", message, attachment_data)

    # call llm
    response = llm_call(profile, persona, user_id, persona_id, get_messages(user_id, persona_id, "web"))

    # parse the response
    response = sanitize_response(response)

    # send the response
    save_message(user_id, persona_id, "web", "assistant", response)

    return jsonify({"status": 200, "message": {"role": "assistant", "content": response}})


@app.route('/api/responder')
def responder():
    # get correct bot
    channel = request.args.get('channel')
    if channel not in BOTS:
        return jsonify({"status": 400, "message": "Invalid channel"})
    bot = BOTS[channel]

    # parse and sanitize request
    error, user_id, chat_id, message, attachment_data = bot.parse(request)
    print(error, user_id, chat_id, message, attachment_data)
    if error:
        return jsonify({"status": 400, "message": error})
        
    # send typing indicator
    bot.send_typing_indicator(chat_id)

    # get user profile
    profile = get_profile(channel, user_id)
    
    # get persona
    persona = get_persona(channel, profile["id"])
    
    # save user message
    save_message(profile["id"], persona["id"], channel, "user", message, attachment_data)

    # call llm
    response = llm_call(profile, persona, profile["id"], persona["id"], get_messages(profile["id"], persona["id"], channel))
        
    # parse the response
    response = sanitize_response(response)

    # send the response
    bot.send_message(chat_id, response)
    save_message(profile["id"], persona["id"], channel, "assistant", response)

    # for the web channel
    return jsonify({"status": 200, "message": {"role": "assistant", "content": response}})