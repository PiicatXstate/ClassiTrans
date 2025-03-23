
window.sessionStorage.setItem('modify',JSON.stringify(false))
window.sessionStorage.setItem('select',JSON.stringify([]))
window.sessionStorage.setItem('content','')

function modify(){
    let btn = document.getElementById('btn')
    let textarea = document.getElementById('tarea')
    let text = document.getElementById('text')
    let modify = JSON.parse(window.sessionStorage.getItem('modify'))
    if(modify == false){
        btn.style.backgroundColor = 'rgba(224, 224, 224, 0.5)'
        textarea.style.display = '';
        text.style.display = 'none';
        textarea.style.border = '2px solid rgb(255, 127, 0)'
    }else{
        btn.style.backgroundColor = 'rgba(224, 224, 224, 0.303)'
        textarea.style.border = '1px solid rgb(251, 232, 232)'
        textarea.style.display = 'none';
        text.style.display = '';
        window.sessionStorage.setItem('content',textarea.value)
        let value = textarea.value
        const container = document.getElementById('text');

        container.innerHTML = '';
        const nodes = Array.from(value).map((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.dataset.index = index;
            return span;
        });

        container.append(...nodes);

        container.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'SPAN') {
            const index = parseInt(target.dataset.index);
            target.classList.toggle('active');
            let select = JSON.parse(window.sessionStorage.getItem('select'))
            if (select.indexOf(index) === -1) {
                select.push(index)
            } else {
                select.splice(select.indexOf(index),1)
            }
            window.sessionStorage.setItem('select',JSON.stringify(select))
        }
        });
    }
    window.sessionStorage.setItem('modify',JSON.stringify(!modify))
}