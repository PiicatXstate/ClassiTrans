// 文学网查词部分
let tarea = document.getElementById('tarea')
document.addEventListener('keydown', function(event) {
    function refresh(){
        let dict = document.getElementById('dict')
        let transtext = JSON.parse(window.sessionStorage.getItem('transtext'))
        let seq = window.sessionStorage.getItem('seq')
        dict.innerText = transtext[seq % transtext.length]
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