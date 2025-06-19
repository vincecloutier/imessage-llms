# © 2025 April Intelligence. All rights reserved.
# This code is proprietary and confidential.
# Unauthorized use, distribution, or copying is prohibited.
# For inquiries, contact vince@aprilintelligence.com

import os
import json
import uuid
import requests
from backend.dbp import get_server_address

class Messaging:
    def __init__(self):
        self.MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024
        self.MAX_MESSAGE_LENGTH = 500
        self.MAX_ATTACHMENTS = 1
        self.headers = {'Content-Type': 'application/json'}

    def parse(self, request):
        """Parse the request and return (error, user_id, chat_id, message, attachment_data)"""
        raise NotImplementedError("Subclasses must implement parse()")

    def send_message(self, chat_id, message):
        """Send a message to the specified chat"""
        raise NotImplementedError("Subclasses must implement send_message()")

    def send_typing_indicator(self, chat_id):
        """Send a typing indicator to the specified chat"""
        raise NotImplementedError

    def download_attachment(self, attachments):
        """Download and process attachments"""
        raise NotImplementedError("Subclasses must implement download_attachment()")
    
class BlueBubbles(Messaging):
    def __init__(self):
        super().__init__()
        self.params = {'password': os.getenv('BBL_API_KEY')}

    def parse(self, request):
        # parse request
        data = request.json.get("data", {})
        user_id = data.get("handle").get("address")
        chat_id = data.get("chats")[0].get("guid")
        message = data.get("text", "")
        attachments = data.get("attachments", [])

        # stop infinite loop
        if data.get("isFromMe"):
            return "Stopping infinite loop.", user_id, chat_id, message, None

        # check for errors
        error = None
        if len(message) > self.MAX_MESSAGE_LENGTH:
            error = "Message too long. Please keep it under 500 characters."
        elif len(attachments) > self.MAX_ATTACHMENTS:
            error = "Too many attachments. Please only send one image/audio file at a time."
        if error:
            self.send_message(chat_id, error)

        # return parsed request
        return error, user_id, chat_id, message, self.download_attachment(attachments) 
    
    def send_message(self, chat_guid, message):
        url = f'{get_server_address()}/api/v1/message/text'
        data = json.dumps({'chatGuid': chat_guid, 'tempGuid': str(uuid.uuid4()), 'message': message})
        requests.post(url, headers=self.headers, data=data, params=self.params, timeout=30)

    def send_typing_indicator(self, chat_guid):
        url = f'{get_server_address()}/api/v1/chat/{chat_guid}/typing'
        requests.post(url, headers=self.headers, params=self.params, timeout=30)

    def download_attachment(self, attachments):
        if not attachments:
            return None
        attachment_id, mime_type = attachments[0]["guid"], attachments[0]["mimeType"]
        url = f'{get_server_address()}/api/v1/attachment/{attachment_id}/download'
        response = requests.get(url, headers=self.headers, params=self.params, timeout=30)
        return {"name": attachment_id, "bytes": response.content, "mime_type": mime_type}

class Telegram(Messaging):
    def __init__(self):
        super().__init__()
        self.api_key = os.getenv('TELEGRAM_API_KEY')
        self.url = f"https://api.telegram.org"

    def parse(self, request):
        # parse request
        data = request.json.get("message")
        user_id = data.get("from").get("username")
        chat_id = data.get("chat").get("id")
        message = data.get("caption") if data.get("caption") is not None else data.get("text", "")
        attachments = data.get("photo", [])

        # check for errors
        error = None
        if data.get("media_group_id"):
            error = "Please only send one photo at a time."
        elif len(message) > self.MAX_MESSAGE_LENGTH:
            error = "Message too long. Please keep it under 500 characters."
        elif len(attachments) > self.MAX_ATTACHMENTS:
            error = "Too many attachments. Please only send one image/audio file at a time."
        if error:
            self.send_message(chat_id, error)

        # return parsed request
        return error, user_id, chat_id, message, self.download_attachment(attachments)

    def send_message(self, chat_id, message):
        url = f'{self.url}/bot{self.api_key}/sendMessage'
        data = json.dumps({'chat_id': chat_id, 'text': message})
        requests.post(url, headers=self.headers, data=data, timeout=30)

    def download_attachment(self, photo_sizes_list):
        if not photo_sizes_list:
            return None
        photo = max(photo_sizes_list, key=lambda x: x.get("file_size", 0) if x.get("file_size") <= self.MAX_PHOTO_SIZE_BYTES else 0)
        response_file_path = requests.get(f'{self.url}/bot{self.api_key}/getFile', params={'file_id': photo.get("file_id")}, timeout=10)
        file_path = response_file_path.json().get("result").get("file_path")
        response_bytes = requests.get(f'{self.url}/file/bot{self.api_key}/{file_path}', timeout=30)
        return {"name": photo.get("file_id"), "bytes": response_bytes.content, "mime_type": "image/jpeg"}