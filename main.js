(function() {
    'use strict';
    const globalObj = {
        options: {
            speed: 0,
            txt: null
        },
        status: {
            firstLoad: false
        },
        onResize: function() {
            loadMainContent(['resize']);
        }
    };

    // Events
    window.addEventListener('resize', globalObj.onResize);

    // Main Content
    function loadMainContent(arr) {
        const section = document.querySelector('.main-section'),
              boxForm = section.querySelector('.box'),
              startBtn = boxForm.querySelector('.start-btn'),
              heading = section.querySelector('.heading');

        // Init
        if (!globalObj.status.firstLoad) {

            // On click start btn
            startBtn.addEventListener('click', function() {
                let num = boxForm.querySelector('.speed-input'),
                    txt = boxForm.querySelector('.txt-input'),
                    formControl = boxForm.querySelectorAll('.form-control'),
                    word = section.querySelector('.word-display');

                if (num.value.trim() !== '' && txt.value.trim() !== '') {
                    // Assign value
                    globalObj.options.speed = Number(num.value.trim());
                    globalObj.options.txt = txt.value.trim();
                    // Fade box
                    boxForm.classList.add('fadeout');
                    heading.classList.add('fadeout');
                    setTimeout(() => {
                        heading.classList.add('d-none');
                        boxForm.classList.add('d-none');
                        word.style.display = 'block';
                        // Call Display function
                        displayTxt();
                    }, 300);
                }

                // Valid/Invalid
                Array.from([...formControl]).filter((item) => {
                    if (item.value.trim() === '') {
                        item.parentElement.classList.add('invalid');
                    } else {
                        item.parentElement.classList.remove('invalid');
                    }
                });

            });
        }

        // Resize
        if (!globalObj.status.firstLoad || arr.includes('resize')) {
            // fit window height
            section.style.minHeight = window.innerHeight + 'px';
        }

        globalObj.status.firstLoad = true;
    }

    // Load All
    window.addEventListener('load', loadMainContent);

    // Display txt
    function displayTxt() {

        // Extract Text
        let arrWord = globalObj.options.txt.split(' '),
            arrEle = [], newWord = '';
        arrWord.filter((word) => {
            newWord = '';
            for (let i = 0; i < word.length; i++) {
                if (word.length === 1 || i !== (Math.floor(word.length / 2))) {
                    newWord += word[i];
                } else {
                    newWord += '<span>' + word[i] + '</span>';
                }
            }
            arrEle.push(newWord);
        });

        // Text Animation
        let txt = document.querySelector('.word-display .txt'),
            anim = setInterval(frame, globalObj.options.speed),
            counter = 1;
        txt.innerHTML = arrEle[0];
        function frame() {
            if (counter > (arrEle.length - 1)) {
                clearInterval(anim);
            } else {
                txt.innerHTML = arrEle[counter];
                counter++;
            }
        }
    }

}());