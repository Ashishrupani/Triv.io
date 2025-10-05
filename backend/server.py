from flask import Flask, jsonify, request
import json
from flask_cors import CORS
from os import environ as env
from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

app = Flask(__name__)


CORS(app, origins=["http://localhost:5173"]) 


@app.route('/')
def home():
    return 'Hello from Flask!'

@app.route('/api/generate-text', methods=['GET'])
def generate_text():
    query = request.args.get('query')
    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=query)
    print(response.text)
    return jsonify({'response': response.text}), 200

@app.route('/api/upload-notes', methods=['GET'])
def upload_notes():
    data = request.json
    query = data.get('query')
    notes = data.get('notes')
    print("Received notes:", notes)
    print("Received query:", query)
    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=query + notes)
    return jsonify({'message': response.text}), 200

# @app.route('/api/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')
#     # Simple check (for demonstration only)
#     if username == 'admin' and password == 'password':
#         return jsonify({'message': 'Login successful!'}), 200
#     else:
#         return jsonify({'message': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True)
