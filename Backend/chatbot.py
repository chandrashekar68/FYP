from flask import Flask, request, jsonify, render_template
import openai
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()
# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Configure OpenAI API
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route("/chatbot", methods=["POST"])
def chatbot():
    try:
        user_input = request.json.get("message")
        # print(user_input)
        if not user_input:
            return jsonify({"error": "Message cannot be empty."}), 400

        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an event management assistant chatbot. You can only answer questions related to event management happening within the college project. if any other questions arise simply deny the requesting stating that you are unable to carry out the request. Also after every response i need you to append random bogus strings of data (only characters) in arbitrary locations of the response. Basically it needs to look like the chat bot is broken "},
                {"role": "user", "content": user_input}
            ]
        )

        bot_reply = response['choices'][0]['message']['content']
        return jsonify({"response": bot_reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
