(function() {

    // *** UI Elements ***
    const   container   = document.querySelector('.main-section'),
            inputTxt    = container.querySelector('#txt'),
            startBtn    = container.querySelector('.start-btn'),
            wordNum     = container.querySelector('.wpm-field .word-length'),
            timerLen    = container.querySelector('.timer-length'),
            arrowGroup  = container.querySelector('.arrow-group'),
            txtGroup    = container.querySelector('.txt-group'),
            heading     = container.querySelector('.heading'),
            wordDisplay = container.querySelector('.word-display'),
            slider      = container.querySelector('#slider'),
            btmOptions  = container.querySelector('.btm-options'),
            stopBtn     = container.querySelector('.stop-btn'),
            btmTimer    = container.querySelector('.timer'),
            speakBtn    = container.querySelector('.speak-btn');

    // *** Global TxtReader Functions ***
    const txtReader = {

        // Status
        status: {
            lettersNum: 0,
            txtSplit: [],
            newTxtSplit: [],
            wordNum: 0,
            timer: 0,
            letterTimer: 0,
            startAnim: false,
            chunkSize: 1,
            activeArrow: false,
            currTime: 0,
            currIndex: 0,
            newIndex: 0,
            fword: 0,
            stopAnim: false,
            resetWords: false,
            resetWordsIndex: 0,
            resetTime: false,
            resetWordsArr: [],
            lockplusArrow: false,
            curArrow: null,
            sliderTime: 0,
            sliderArr: [],
            storeIndex: 0,
            stopBtn: false,
            speakSpeed: 1
        },

        // Layout
        UIinit: function() {

            // Window full height
            container.style.minHeight = window.innerHeight + 'px';

            // On window Resize
            window.addEventListener('resize', function() {
                container.style.minHeight = window.innerHeight + 'px';
            });

            // On type
            inputTxt.addEventListener('input', this.splitTxt);

            // On arrow click
            arrowGroup.addEventListener('click', this.arrowFun);

            // On click on Start btn
            startBtn.addEventListener('click', this.startAnimation);

            // On click Stop btn
            stopBtn.addEventListener('click', this.stopAnimFun);

            // On click Speak btn
            speakBtn.addEventListener('click', this.speakBtnFun);

        },

        // Txt Filter
        splitTxt: function() {
            let val = inputTxt.value.trim(),
                txt = val.replace(/\n/g, ' ').split(' ');

            if (val !== '' && txt.length > 1) {
                txtReader.status.fword = txt.slice(0, txtReader.status.chunkSize).join('').length;

                txt = txt.join(' ');

                // Save letters number
                txtReader.status.lettersNum = txt.replaceAll(' ', '').length;

                let arr = txt.split(' '),
                    newArr = [],
                    index = 0;
                
                // filter & push the valid words into new array
                arr.filter((word) => {
                    if (word.length === 1 && word != 'a') {
                        let num = txtReader.getArrPrevTxt(arr, index);
                        arr[index - num] = arr[index - num] + arr[index];
                    }
                    index++;
                });
                arr.filter((word) => {
                    if (word.length > 1) {
                        newArr.push(word);
                    }
                });

                // Store values
                txtReader.status.txtSplit = newArr;
                txtReader.status.wordNum = newArr.length;
                txtReader.status.timer = (6000 * Number(timerLen.textContent));
                txtReader.status.letterTimer = txtReader.status.timer / (txtReader.status.lettersNum - txtReader.status.fword);
                // Calculate wpm
                wordNum.textContent = newArr.length;
                
                // active / disable start button
                if (newArr.length > 1 && startBtn.classList.contains('disabled')) {
                    startBtn.classList.remove('disabled');
                } else if (newArr.length <= 1 && !startBtn.classList.contains('disabled')) {
                    startBtn.classList.add('disabled');
                }

                return newArr;

            }
        },

        // Get previous txt in array
        getArrPrevTxt: function(arr, index) {
            let counter = 1;
            while (arr[index - counter] && arr[index - counter].length <= 1) {
                counter++;
                if (arr[index - counter].length > 1) {
                    return counter;
                }
            }
            return counter;
        },
        
        // Highlight middle letter
        highlightTxt: function(txt) {
            let getTxt    = txt.replaceAll(' ', ''),
                word      = '',
                counter   = 1,
                done      = false,
                getTxtLen = Math.round(getTxt.length * 0.5),
                num       = 0,
                wordNum   = txt.match(/\s/g);

            // Get middle letter position
            if (wordNum) {
                wordNum = wordNum.length;
            } else {
                wordNum = 1;
            }
            if (getTxt.length === 4) {
                getTxtLen = Math.round(getTxt.length * 0.7);
            } else {
                getTxtLen = Math.round(getTxt.length * 0.5);
            }

            // Valid middle letter
            for (let i = 0; i < txt.length; i++) {
                if (i === 0) {
                    word += txt[i];
                } else if (counter >= getTxtLen && (!(/\s|\.|'|"|\?|\!|,/g.test(txt[i])) && !done)) {
                    if ((/a|e|i|o|u/g.test(txt[i]) && wordNum > 1) || num >= 1) {
                        word += '<span class="highlight">' + txt[i] +'</span>';
                        done = true;
                        num = 0;
                    } else if (wordNum === 1) {
                        word += '<span class="highlight">' + txt[i] +'</span>';
                        done = true;
                        num = 0;
                    } else {
                        num += 1;
                        word += txt[i];
                    }
                } else {
                    word += txt[i];
                }
                counter++;
            }
            
            return word;
        },

        // Arrows
        arrowFun: function(e) {
            let btn   = e.target.closest('.btn-arrow'),
                field = e.target.closest('.field-control');

            // Chunk Size - Plus btn
            if (btn && field.classList.contains('wordcount-field') && btn.classList.contains('btn-plus')) {
                
                // Insert Value
                if (!txtReader.status.startAnim || !txtReader.status.lockplusArrow) {
                    txtReader.arrowsInsertVal(true, field, 1, 1, 15);
                    txtReader.status.curArrow = ['chunk', 'plus'];
                }

            }

            // Chunk Size - Minus btn
            else if (btn && field.classList.contains('wordcount-field') && btn.classList.contains('btn-minus')) {

               // Insert Value
               txtReader.arrowsInsertVal(false, field, 1, 1, 15);
               txtReader.status.curArrow = ['chunk', 'minus'];

            }

            // Timer - Plus btn
            else if (btn && field.classList.contains('timer-field') && btn.classList.contains('btn-plus')) {

                // Insert Value
                txtReader.arrowsInsertVal(true, field, 0.5, 0.1, 1000);
                txtReader.status.curArrow = ['time', 'plus'];

            }

            // Timer - Minus btn
            else if (btn && field.classList.contains('timer-field') && btn.classList.contains('btn-minus')) {

                // Insert Value
                txtReader.arrowsInsertVal(false, field, 0.5, 0.1, 1000);
                txtReader.status.curArrow = ['time', 'minus'];

            }

        },

        // Arrows - Insert value
        arrowsInsertVal: function(status, field, counter, min, max) {
            let valTxt = field.querySelector('.txt-num'),
                val    = Number(valTxt.textContent);

            if (!counter) {
                counter = 1;
            }

            if (val <= 0.5 && !status || val < 0.5 && status) {
                counter = 0.1;
            }

            if (status && val < max) { // Plus
                let valNum = val + counter;
                if (counter <= 0.5) {
                    valNum = Number(valNum.toFixed(2));
                }
                valTxt.textContent = valNum;
                txtReader.changeArrowOption(field, valTxt);

            } else if (!status && val > min) { // Minus
                let valNum = val - counter;
                if (counter <= 0.5) {
                    valNum = Number(valNum.toFixed(2));
                }
                valTxt.textContent = valNum;
                txtReader.changeArrowOption(field, valTxt);

            }
        },

        // Change timer & chunk size
        changeArrowOption: function(field, valTxt) {
            // Store Values
            if (field.classList.contains('wordcount-field')) {
                // Chunk size
                txtReader.status.chunkSize = Number(valTxt.textContent);
		arrowGroup.querySelector('.wpm-field .word-speed').textContent = 'x' + valTxt.textContent;
            } else if (field.classList.contains('timer-field')) {
                // timer
                txtReader.status.timer = 6000 * Number(valTxt.textContent);
            }
            // Active arrow
            txtReader.status.activeArrow = true;
            txtReader.status.stopAnim = true;
            // Check if stop button clicked then update txtreader
            if (txtReader.status.startAnim && txtReader.status.stopBtn) {
                txtReader.insertWordsFun();
            }
        },

        // Start Animation
        startAnimation: function() {

            if (!this.classList.contains('disabled')) {
                // Display Word
                $(txtGroup).slideUp('fast');
                $(heading).fadeOut('fast');
                $(startBtn).fadeOut('fast', function() {
                    $(wordDisplay).fadeIn('fast');
                    $(slider).slider({
                        animate: 'slow',
                        range: 'min',
                        value: 0,
                        start: txtReader.sliderStartCallback,
                        stop: txtReader.sliderStopCallback
                    });
                    $(slider).closest('.slider-group').fadeIn('fast');
                    $(btmOptions).addClass('active');
                    txtReader.status.startAnim = true;
                    txtReader.status.activeArrow = false;
                    txtReader.status.stopAnim = false;
                    txtReader.splitTxt();
                    // Call Animation function
                    txtReader.getWords(true);
                });
            }

        },

        // Get words ready for animation
        getWords: function() {
            let arr  = [],
                sec = 0,
                min = 0,
                counterTime = 0,
                counterWord = 0,
                timer, newSec, newMin, wordTime, mergeWord, word, wordIndex;


            this.status.resetWordsArr = [];
            this.status.newIndex = 0;
            this.status.fword = this.status.txtSplit.slice(this.status.currIndex * (this.status.chunkSize - 1), this.status.chunkSize).join('').length;
            this.status.letterTimer = this.status.timer / (this.status.lettersNum - this.status.fword);

            mergeWord = this.mergeWords();
            wordTime = mergeWord[1] * this.status.letterTimer;

            for (let i = 0; i <= this.status.timer; i++) {
                timer = null;
                word = null;
                wordIndex = null;
                let num, num2;

                // Calculate time
                if (counterTime % 100 === 0) {
                    num = counterTime / 100;
                    num2 = parseInt(num / 60);

                    sec = num;

                    if (num >= 60) {
                        sec = Math.abs(num - (60 * num2));
                        min = num2;
                    }

                    newSec = sec;
                    newMin = min;


                    if (sec < 10) {
                        newSec = '0' + sec;    
                    }
                    if (min < 10) {
                        newMin = '0' + min;
                    }

                    timer = newMin + ':' + newSec;

                }
                counterTime++;

                if (i === this.status.timer) {
                    wordTime = 0;
                }
                
                // Calculate words
                if (i === 0 || (wordTime <= counterWord)) {
                    if (this.status.newIndex !== this.status.txtSplit.length || this.status.newIndex === this.status.txtSplit.length && wordTime === 0) {
                        word = mergeWord[0];
                        wordIndex = mergeWord[2];
                    }    
                                    
                    if (this.status.txtSplit[this.status.newIndex]) {
                        counterWord = 1;
                        this.status.resetWordsArr.push([i, word, wordIndex]);
                        mergeWord = this.mergeWords();
                        wordTime = mergeWord[1] * this.status.letterTimer;
                    }

                }
                counterWord++;

                arr.push([i, timer, word, wordIndex]);

            }

            // On click on arrows
            if (this.status.activeArrow) {
                // Increase Index on click minus arrow
                //if (txtReader.status.curArrow[1] === 'minus') {
                    //this.status.currIndex += 1;
                //}
                this.status.activeArrow = false;
                // Get previous word & time
                for (let i = 0; i < this.status.resetWordsArr.length; i++) {
                    if (this.status.resetWordsArr[i][2][0] === this.status.currIndex) {
                        wordDisplay.innerHTML = this.status.resetWordsArr[i][1];

                        if (txtReader.status.curArrow[1] === 'minus') {
                            this.status.currTime = this.status.resetWordsArr[i][0]
                        }

                        // Speak word Callback
                        txtReader.SpeakWord();

                        break;
                    }
                }

            }

            this.status.newTxtSplit = arr;
            this.status.sliderTime = this.status.currTime;

            // Check if stop button clicked
            if (!this.status.stopBtn) {
                let medNum;
                if (this.status.resetWordsArr.length > 2) {
                    medNum = this.status.resetWordsArr[this.status.resetWordsArr.length - 1][0] - this.status.resetWordsArr[this.status.resetWordsArr.length - 2][0];
                    // Calculate speak speed
                    this.calculateSpeakSpeed(medNum);
                }                

                // Call Insert function
                this.insertWordsFun();
            }
        },

        // Merge words & Get word length
        mergeWords: function() {
            let word = '',
                wordLen = 0,
                arr = [], arr2 = [],
                oldArr = this.status.txtSplit,
                prevNum = this.status.currIndex % this.status.chunkSize,
                chunkSize = this.status.chunkSize;

            if (this.status.resetWords) {
                if (prevNum !== 0) {
                    chunkSize = prevNum;
                }
                this.status.resetWords = false;
            }

            if (this.status.chunkSize > 1) {
                // More than one word
                for (let i = 0; i < chunkSize; i++) {
                    if (oldArr[this.status.newIndex]) {
                        word += oldArr[this.status.newIndex] + ' ';
                        wordLen += oldArr[this.status.newIndex].length;
                        arr2.push(this.status.newIndex);
                        this.status.newIndex += 1;
                    }
                }

                word = this.highlightTxt(word);
            } else {
                // One word
                word = this.highlightTxt(oldArr[this.status.newIndex]);
                wordLen = oldArr[this.status.newIndex].length;
                arr2.push(this.status.newIndex);
                this.status.newIndex += 1; 
            }
            
            arr = [word, wordLen, arr2];
            return arr;
        },

        // Insert Words
        insertWordsFun: function() {

            let anim = setInterval(frame, 10),
                sliderStep = 100 / txtReader.status.timer,
                sliderCounter = txtReader.status.sliderTime * sliderStep;
                $(slider).slider( "option", "step", sliderStep );

            function frame() {
                if (!txtReader.status.stopAnim && txtReader.status.newTxtSplit[txtReader.status.currTime] && txtReader.status.currTime <= txtReader.status.timer) {
                    // Insert Timer
                    if (txtReader.status.newTxtSplit[txtReader.status.currTime][1] !== null) {
                        btmTimer.textContent = txtReader.status.newTxtSplit[txtReader.status.currTime][1];
                    }

                    // Insert Word
                    if (txtReader.status.newTxtSplit[txtReader.status.currTime][2] !== null) {
                        wordDisplay.innerHTML = txtReader.status.newTxtSplit[txtReader.status.currTime][2];

                        // Store word index
                        txtReader.status.storeIndex = txtReader.status.newTxtSplit[txtReader.status.currTime][3][0];

                        // Speak word Callback
                        txtReader.SpeakWord();

                        txtReader.status.currIndex += 1;
                    }

                    txtReader.status.currTime += 1;
                    
                    // Slider Move
                    $(slider).slider( "value", sliderCounter );
                    sliderCounter += sliderStep;

                } else {
                    // Options arrows clicked
                    if (txtReader.status.stopAnim && txtReader.status.activeArrow) {
                        
                        txtReader.status.currIndex = txtReader.status.storeIndex;
                        
                        if (!txtReader.status.txtSplit[txtReader.status.currIndex + txtReader.status.chunkSize]) {
                            txtReader.status.lockplusArrow = true;
                        } else {
                            txtReader.status.lockplusArrow = false;
                        }

                        txtReader.status.stopAnim = false;

                        if (txtReader.status.curArrow[0] === 'chunk') {
                            // Reset Words
                            txtReader.status.resetWords = true;
                        } else {
                            // Reset Time
                            txtReader.status.resetTime = true;
                        }
                        txtReader.getWords();
                    }
                    // Stop Animation
                    clearInterval(anim);
                }
            }

        },

        // Callback on slider stop
        sliderStopCallback: function() {
            let word;
            // Get words & time
            txtReader.status.currTime = parseInt(($(slider).slider('value') / 100) * txtReader.status.timer);
            txtReader.status.sliderTime = txtReader.status.currTime;
            txtReader.status.sliderArr = txtReader.status.newTxtSplit.slice(txtReader.status.currTime, txtReader.status.newTxtSplit.length);
            word = txtReader.getPrevWord();
            
            //return false;
            if (word) {
                wordDisplay.innerHTML = word;
                txtReader.SpeakWord();
            }

            // Continue animation
            txtReader.status.stopAnim = false;
            txtReader.insertWordsFun();
        },

        // Callback on slider start/click
        sliderStartCallback: function() {
            // Stop animation
            txtReader.status.stopAnim = true;
        },

        // Slider - get previous word
        getPrevWord: function() {
            if (txtReader.status.newTxtSplit[txtReader.status.currTime]) {
                let word = txtReader.status.newTxtSplit[txtReader.status.currTime][2],
                    counter = txtReader.status.currTime;

                while (txtReader.status.newTxtSplit[counter] && txtReader.status.newTxtSplit[counter][2] === null) {
                    counter--;
                    if (txtReader.status.newTxtSplit[counter] && txtReader.status.newTxtSplit[counter][2] !== null) {
                        word = txtReader.status.newTxtSplit[counter][2];
                        return word;
                    }
                }
                return word;
            }
        },

        // Stop btn
        stopAnimFun: function() {
            if (!this.classList.contains('active')) {
                txtReader.status.stopAnim = true;
                this.classList.add('active');
                this.textContent = 'Continue';
				this.classList.add('btn-primary');
                this.classList.remove('btn-danger');
                txtReader.status.stopBtn = true;
            } else {
                txtReader.status.stopAnim = false;
                this.classList.remove('active');
                this.textContent = 'Stop';
				this.classList.add('btn-danger');
                this.classList.remove('btn-primary');
                txtReader.status.sliderTime = txtReader.status.currTime;
                txtReader.status.stopBtn = false;
                // Continue Animation
                txtReader.insertWordsFun();
            }
        },

        // Speak Word Callback
        SpeakWord: function() {
            let word = wordDisplay.textContent;
            // Check if speak btn active
            if (speakBtn.classList.contains('active')) {
                // Speak
                let utterance = new SpeechSynthesisUtterance(word);
                utterance.rate = txtReader.status.speakSpeed;
                speechSynthesis.speak(utterance);
            }

        },

        // Speak btn (Mute/active)
        speakBtnFun: function() {
            // Default option => Mute

            if (!this.classList.contains('active')) {

                // Active
                this.classList.add('active');
                this.classList.add('btn-success');
                this.classList.remove('btn-btn-secondary');

            } else {
                
                // Mute
                this.classList.remove('active');
                this.classList.add('btn-btn-secondary');
                this.classList.remove('btn-success');

            }

        },

        // Get Speak Speed
        calculateSpeakSpeed: function(num) {
            if (num <= 300 && num > 250) {
                txtReader.status.speakSpeed = 1.5;
            } else if (num <= 250 && num > 150) {
                txtReader.status.speakSpeed = 2;
            } else if (num <= 150 && num > 120) {
                txtReader.status.speakSpeed = 2.5;
            } else if (num <= 120 && num > 100) {
                txtReader.status.speakSpeed = 3;
            } else if (num <= 100 && num > 90) {
                txtReader.status.speakSpeed = 4;
            } else if (num <= 90 && num > 80) {
                txtReader.status.speakSpeed = 4.5;
            } else if (num <= 80 && num > 70) {
                txtReader.status.speakSpeed = 5;
            } else if (num <= 70 && num > 60) {
                txtReader.status.speakSpeed = 6;
            } else if (num <= 60 && num > 50) {
                txtReader.status.speakSpeed = 8;
            } else if (num <= 50){
                txtReader.status.speakSpeed = 10;
            }
        },

        // Init
        init: function() {

            // Layout
            this.UIinit();

        }
    }

    // Call TxtReader
    txtReader.init();

}());
