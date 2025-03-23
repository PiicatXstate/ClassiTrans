from flask import Flask, request, jsonify, make_response
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

def convert_paragraphs(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    div = soup.find('div', class_='view_con clearfix')
    
    if not div:
        return str(soup)

    pattern = re.compile(
        r'(?P<marker>[\u2460-\u2469\u247E-\u2487]+|【又】)(?P<content>.*?。)',
        flags=re.DOTALL
    )

    for element in div.find_all(text=True):
        if not pattern.search(element):
            continue

        new_content = []
        last_end = 0
        parent = element.parent
        
        for match in pattern.finditer(element):
            new_content.append(element[last_end:match.start()])
            span = soup.new_tag('span', attrs={'class': 'para'})
            span.string = match.group('marker') + match.group('content')
            new_content.append(span)
            
            last_end = match.end()
        
        new_content.append(element[last_end:])
        element.replace_with(*new_content)

    return str(soup)

def chinese_to_hex_hwx(s):
    hex_str = s.encode('utf-8').hex().upper()
    parts = [f'hwx{hex_str[i:i+2]}' for i in range(0, len(hex_str), 2)]
    return ''.join(parts)

def trans(text):
    url = 'https://wyw.hwxnet.com/view/' + chinese_to_hex_hwx(text) + '.html'
    r = requests.get(url)
    if r.status_code == 200:
        soup = BeautifulSoup(r.text, 'lxml')
        ans = soup.find('div', class_='view_con clearfix')
        return convert_paragraphs(str(ans))
    else:
        return False

@app.route('/trans', methods=['GET'])
def translate_api():
    text = request.args.get('text')
    
    if not text:
        return jsonify({'error': 'Missing text parameter'}), 400
    
    try:
        result = trans(text)
        if result == False:
            return jsonify({'error': f'Request failed: {str(e)}'}), 500
        else:
            response = make_response(result)
            response.headers['Content-Type'] = 'text/html; charset=utf-8'
            return response
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')