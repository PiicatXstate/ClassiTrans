# app.py
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
import requests
import json

app = Flask(__name__)
CORS(app)

SILICONFLOW_API_KEY = 'sk-lbtjhwrjebrwhwttikwrkasfwcbsijbuojzlizzihmoksyca'

@app.route('/chat', methods=['POST'])
def chat_api():
    data = request.get_json()
    user_input = data.get('message')
    history = data.get('history', [])
    stream = data.get('stream', False)
    
    if not user_input:
        return jsonify({'error': 'Missing message parameter'}), 400

    try:
        messages = history + [{"role": "user", "content": user_input}]
        
        payload = {
            "model": "Qwen/Qwen2.5-7B-Instruct",
            "messages": messages,
            "stream": stream,
            "temperature": 0.7,
            "max_tokens": 4096
        }
        
        headers = {
            "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
            "Content-Type": "application/json"
        }

        if stream:
            def stream_generator():
                response = requests.post(
                    "https://api.siliconflow.cn/v1/chat/completions",
                    json=payload,
                    headers=headers,
                    stream=True
                )
                
                full_response = ""
                for chunk in response.iter_lines():
                    if chunk:
                        decoded_chunk = chunk.decode('utf-8')
                        if decoded_chunk.startswith('data:'):
                            try:
                                chunk_data = json.loads(decoded_chunk[5:])
                                delta = chunk_data['choices'][0]['delta'].get('content', '')
                                full_response += delta
                                yield json.dumps({
                                    "delta": delta,
                                    "message": full_response,
                                    "history": messages + [{"role": "assistant", "content": full_response}]
                                }) + "\n"
                            except Exception as e:
                                yield json.dumps({"error": str(e)}) + "\n"
            return Response(stream_generator(), mimetype='text/event-stream')
        
        else:
            response = requests.post(
                "https://api.siliconflow.cn/v1/chat/completions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            
            response_data = response.json()
            assistant_response = response_data['choices'][0]['message']['content']
            
            return jsonify({
                "message": assistant_response,
                "history": messages + [{"role": "assistant", "content": assistant_response}]
            })
    
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"API请求失败: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"服务器错误: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
