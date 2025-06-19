import logging

from flask import Flask, request, jsonify
from backend.dbp import get_profile, save_message, get_messages, get_persona, update_server_address
from backend.llm import llm_call
from backend.utils import sanitize_response
from backend.messaging import Messaging, BlueBubbles, Telegram, Web

BOTS: dict[str, Messaging] = {"imessage": BlueBubbles(), "telegram": Telegram(), "web": Web()}

logging.getLogger("httpx").setLevel(logging.WARNING)

app = Flask(__name__)

@app.route('/api/responder', methods=['GET', 'POST'])
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
    persona = get_persona(channel, profile["id"], chat_id)
    
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


@app.route('/api/url_updater', methods=['GET', 'POST'])
def url_updater():    
    if server_url := request.json.get("data", ""):
        update_server_address(server_url)
        return jsonify({"status": 200})
    
    return jsonify({"status": 400})