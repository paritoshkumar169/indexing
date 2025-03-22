from flask import Flask, request, jsonify
import psycopg2
import json
import os

app = Flask(__name__)

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST')
    )

@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.json
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO indexed_data (data) VALUES (%s)", (json.dumps(data),))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
