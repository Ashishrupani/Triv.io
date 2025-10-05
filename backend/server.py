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


CORS(app) 


format = "Makes sure to also format it like this, dont add any newlines or spacing. Just format it like sampleQuestions = [{question:'What does HTML stand for?',options:['HyperText Markup Language','HyperText Machine Language','HighText Markdown Language','None of the above'],answer:0},{question:'Which programming language is used for web apps?',options:['Python','JavaScript','C++','All of the above'],answer:1},{question:'What year was JavaScript created?',options:['1991','1995','2000','1989'],answer:1},{question:'CSS is used for?',options:['Structure','Styling','Database','Logic'],answer:1},{question:'React is maintained by?',options:['Google','Facebook (Meta)','Microsoft','Twitter'],answer:1},{question:'Which of these is a JavaScript framework?',options:['Laravel','Django','React','Flask'],answer:2},{question:'Which tag is used for inserting a line break in HTML?',options:['<lb>','<break>','<br>','<hr>'],answer:2},{question:'Which keyword is used to define a constant in JavaScript?',options:['let','var','const','constant'],answer:2},{question:'In CSS, which property is used to change text color?',options:['font-color','color','text-color','fgcolor'],answer:1},{question:'What does API stand for?',options:['Application Programming Interface','Applied Programming Internet','App Performance Interface','Application Program Input'],answer:0}];"


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

@app.route('/api/upload-notes', methods=['POST'])
def upload_notes():
    data = request.json
    query = data.get('query')
    notes = data.get('notes')
    print("Received notes:", notes)
    print("Received query:", query)
    client = genai.Client(api_key=GEMINI_API_KEY)
    notes_text = "\n".join(str(n) for n in notes)
    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=query + notes_text + format)
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
