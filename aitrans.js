function aitrans(){
    let array1 = JSON.parse(window.sessionStorage.getItem('select')).sort(function(a,b){
        　　return a - b;
        }
    )
    let text = window.sessionStorage.getItem('content')
    let part = ''
    let hisWord = array1[0] - 1
    for(let word of array1){
        if(hisWord == (word - 1)){
            part += text[word]
        }else{
            part += '...'
            part += text[word]
        }
        hisWord = word
    }
    let min,max
    if(array1[0] - 4 < 0){
        min = 0
    }else{
        min = array1[0] - 4
    }

    if(array1[array1.length - 1] + 4 > text.length - 1){
        max = text.length - 1
    }else{
        max = array1[array1.length - 1] + 5
    }

    let whole = text.slice(min,max)

    // API
    async function sendToAPI(content) {
        const transResult = document.getElementById('ait');
        transResult.innerHTML = '';

        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    history: [],
                    stream: true
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.delta) {
                            fullResponse += data.delta;
                            transResult.innerHTML += data.delta;
                            transResult.scrollTop = transResult.scrollHeight;
                        }
                    } catch (e) {
                        console.error('解析错误:', e);
                    }
                }
            }
        } catch (error) {
            console.error('API请求失败:', error);
            transResult.innerHTML = '翻译请求失败，请重试';
        }
    }

    sendToAPI(
        '本篇文言文全文内容：\n' + text + '\n在这句话（' + whole + ')中，' + part + '的意思是什么？(请直译，准确翻译出整体意思或单个次的意思)'
    )
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        aitrans()
    }
});