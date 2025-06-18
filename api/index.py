from flask import Flask
from typing import Dict
import time

app = Flask(__name__)


@app.route("/api/py/")
def root() -> Dict[str, str]:
    return {"message": "Hello World"}


def some_work(input: str) -> str:
    return f"processed '{input}'"




@app.route("/api/py/get-data", methods=["POST"])
def get_data() -> Dict[str, str]:
    return {"message": "get data response"}

