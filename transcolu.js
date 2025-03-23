// 文学网查词部分
let tarea = document.getElementById('tarea')
document.addEventListener('keydown', function(event) {
    function refresh(){
        let dict = document.getElementById('dict')
        let transtext = JSON.parse(window.sessionStorage.getItem('transtext'))
        let seq = window.sessionStorage.getItem('seq')
        let word = transtext[seq % transtext.length]
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://127.0.0.1:5000/trans?text=' + word);
        xhr.onload = () => {
        if (xhr.status === 200) {
            dict.innerHTML = "<span id='noname' style='font-size: 32px;color: brown;position: absolute;top: 7px;left: 6px;'>" + word + '</span>'
            let noname = document.getElementById('noname')
            noname.style.fontFamily = 'AGDK'
            let trans = xhr.responseText;
            dict.innerHTML += trans
        } else {
            window.sessionStorage.setItem('seq',Number(window.sessionStorage.getItem('seq')) + 1)
            refresh()
        }
        };
        xhr.send();
    }
    if (event.code === 'Space') {
        if(tarea.style.display == 'none'){
            // 查询部分
            function isChinese(str) {
                return /^\p{Script=Han}+$/u.test(str);
            }
            let array1 = JSON.parse(window.sessionStorage.getItem('select')).sort(function(a,b){
                　　return a - b;
                }
            )
            let array2 = []
            let text = window.sessionStorage.getItem('content')
            for(let word of array1){
                if(isChinese(text[word])){
                    array2.push(text[word])
                }
            }
            window.sessionStorage.setItem('transtext',JSON.stringify(array2))
            window.sessionStorage.setItem('seq',0)
            refresh()
        }
    }
    if (event.code === 'ArrowLeft') {
        window.sessionStorage.setItem('seq',Number(window.sessionStorage.getItem('seq')) - 1)
        refresh()
    }
    if (event.code === 'ArrowRight') {
        window.sessionStorage.setItem('seq',Number(window.sessionStorage.getItem('seq')) + 1)
        refresh()
    }
});