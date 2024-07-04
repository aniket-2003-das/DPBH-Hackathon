from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import easyocr
import csv
import os

app = Flask(__name__)
CORS(app)

reader = easyocr.Reader(['en'])

CSV_FILE_PATH = 'data.csv'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/extract-text', methods=['POST'])
def extract_text():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        image_bytes = file.read()

        result = reader.readtext(image_bytes)

        extracted_text = ' '.join([text[1] for text in result])

        comment = request.form.get('comment', '') 
        pattern_category = request.form.get('patternCategory', '')  
        where_in_website = request.form.get('whereInWebsite', '')  
        deceptive = request.form.get('deceptive', '') 
        website_page = request.form.get('websitePage', '')  

        if extracted_text:
            save_to_csv(extracted_text, comment, pattern_category,
                        where_in_website, deceptive, website_page)

        return jsonify({'extracted_text': extracted_text}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def save_to_csv(pattern_string, comment, pattern_category, where_in_website, deceptive, website_page):
    if not os.path.exists(CSV_FILE_PATH):
        with open(CSV_FILE_PATH, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['Pattern String', 'Comment', 'Pattern Category',
                          'Where in website?', 'Deceptive?', 'Website Page']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

    with open(CSV_FILE_PATH, 'a', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Pattern String', 'Comment', 'Pattern Category',
                      'Where in website?', 'Deceptive?', 'Website Page']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writerow({
            'Pattern String': pattern_string,
            'Comment': comment,
            'Pattern Category': pattern_category,
            'Where in website?': where_in_website,
            'Deceptive?': deceptive,
            'Website Page': website_page
        })


if __name__ == '__main__':
    app.run(debug=True, port=8080)
