from flask import Flask, render_template, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)

# Load the dataset
df = pd.read_csv('dataset/healthcare_disease_advice_extended.csv')

# Preprocess the data
df['Disease'] = df['Disease'].str.lower()
df.drop_duplicates(inplace=True)

# Vectorize the diseases
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df['Disease'])

# Set a similarity threshold (e.g., 0.2)
SIMILARITY_THRESHOLD = 0.2

def get_response(user_input):
    user_input = user_input.lower()
    user_input_vec = vectorizer.transform([user_input])
    
    # Calculate cosine similarity between user input and all diseases
    similarities = cosine_similarity(user_input_vec, X)
    most_similar_index = np.argmax(similarities)
    highest_similarity_score = similarities[0, most_similar_index]
    
    # Check if the highest similarity score is below the threshold
    if highest_similarity_score < SIMILARITY_THRESHOLD:
        return None, None, None  # No match found
    
    # Get the most similar disease
    most_similar_disease = df.iloc[most_similar_index]['Disease']
    advice = df.iloc[most_similar_index]['Advice']
    tablets = df.iloc[most_similar_index]['Tablets']
    
    return most_similar_disease, advice, tablets

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def chatbot_response():
    user_input = request.json['user_input']
    if user_input.lower() == 'exit':
        return jsonify({'response': 'Goodbye!'})
    
    disease, advice, tablets = get_response(user_input)
    
    if disease is None:  # No match found
        response = "I'm sorry, I couldn't find a match for your input. Please try again with more specific symptoms."
    else:
        response = f"For <strong>{disease}</strong>, here is the advice: {advice}. Recommended tablets: {tablets}"
    
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)