from flask import Flask, request, jsonify, make_response
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

def chinese_to_hex_hwx(s):
    hex_str = s.encode('utf-8').hex().upper()
    parts = [f'hwx{hex_str[i:i+2]}' for i in range(0, len(hex_str), 2)]
    return ''.join(parts)

def trans(text):
    url = 'https://wyw.hwxnet.com/view/' + chinese_to_hex_hwx(text) + '.html'
    r = requests.get(url).text
    soup = BeautifulSoup(r, 'lxml')
    ans = soup.find('div', class_='view_con clearfix')
    return str(ans)

@app.route('/trans', methods=['GET'])
def translate_api():
    text = request.args.get('text')
    
    if not text:
        return jsonify({'error': 'Missing text parameter'}), 400
    
    try:
        result = trans(text)
        response = make_response(result)
        response.headers['Content-Type'] = 'text/html; charset=utf-8'
        return response
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')