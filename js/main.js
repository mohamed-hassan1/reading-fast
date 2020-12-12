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
            speakBtn    = container.querySelector('.speak-btn'),
            selectVoice = container.querySelector('.sound-select');

    // *** Global TxtReader Functions ***
    const txtReader = {

        // Text Variable
        txt: null,

        // Status
        status: {
            lettersNum: 0,
            txtSplit: [],
            newTxtSplit: [],
            wordNum: 0,
            timer: 0,
            startAnim: false,
            chunkSize: 1,
            wpm: 350,
            activeArrow: false,
            currTime: 0,
            currIndex: 0,
            timeCounter: 0,
            wordTime: 0,
            timerConuter: 0,
            storeMilliSec: [],
            nxtWord: null,
            insertWord: true,
            stopAnim: false,
            resetTime: false,
            lockplusArrow: false,
            curArrow: null,
            sliderTime: 0,
            sliderReset: false,
            stopBtn: false,
            speakSpeed: 1,
            wpmInput: false,
            storeTimePlay: 1,
            voicesList: [],
            voice: null,
            enablemicropauseNumbers: null,
            enablemicropausePunctuation: null,
            enablemicropauseLongWords: null,
            micropauseNumbersFactor: 0,
            micropausePunctuationFactor: 0,
            micropauseLongWordsFactor: 0
        },

        // Layout
        UIinit: function() {

            // Window full height
            container.style.minHeight = window.innerHeight + 'px';

            // Check text variable
            if (txtReader.txt !== null) {
                txtGroup.classList.add('d-none');
                txtReader.splitTxt();
            }

            // Add Voices
            speechSynthesis.addEventListener('voiceschanged', txtReader.addVoices);

            // On window Resize
            window.addEventListener('resize', function() {
                container.style.minHeight = window.innerHeight + 'px';
            });

            // On window click
            window.addEventListener('click', function(e) {
                // Hide Voice Select Drop List
                if (!e.target.closest('.voice-drop-list') && selectVoice.classList.contains('active')) {
                    selectVoice.classList.remove('active');
                    setTimeout(function() {
                        selectVoice.querySelector('.drop-list').classList.remove('d-block');
                    }, 200);
                }
            });


            // Set WPM input value
            wordNum.value = txtReader.status.wpm;

            // On type
            inputTxt.addEventListener('input', this.splitTxt);

            // On WPM input type
            wordNum.addEventListener('input', this.wpmInputFun);

            // On arrow click
            arrowGroup.addEventListener('click', this.arrowFun);

            // On click on Start btn
            startBtn.addEventListener('click', this.startAnimation);

            // On click Stop btn
            stopBtn.addEventListener('click', this.stopAnimFun);

            // On click Speak btn
            speakBtn.addEventListener('click', this.speakBtnFun);

            // On click on Select Voice btn
            selectVoice.addEventListener('click', this.selectVoiceFun);

        },

        // Txt Filter
        splitTxt: function() {
            let val, txt;

            // Check for txt variable
            if (txtReader.txt !== null) {
                val = txtReader.txt.trim()
            } else {
                val = inputTxt.value.trim();
            }

            txt = val;

            if (val !== '' && txt.split(' ').length > 1) {

                let arr = txt.split(' '),
                    newArr = [],
                    index = 0;
                
                // filter & push the valid words into new array
                arr.filter(function(word) {
                    if (word.length === 1 && word != 'a') {
                        let num = txtReader.getArrPrevTxt(arr, index);
                        arr[index - num] = arr[index - num] + arr[index];
                    }
                    index++;
                });
                arr.filter(function(word) {
                    if (word.length > 1) {
                        newArr.push(word);
                    }
                });

                // Store values
                txtReader.status.txtSplit = newArr;
                txtReader.status.wordNum = newArr.length;
                txtReader.status.timer = txtReader.calculateTotalTime(newArr);

                // Calculate play time
                txtReader.wpmPlayTime();
                                    
                // active / disable start button
                if (newArr.length > 1 && startBtn.classList.contains('disabled')) {
                    startBtn.classList.remove('disabled');
                } else if (newArr.length <= 1 && !startBtn.classList.contains('disabled')) {
                    startBtn.classList.add('disabled');
                }

                return newArr;

            } else {
                startBtn.classList.add('disabled');
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
            let getTxt    = txt.split(' ').join(''),
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

            // WPM - Plus btn
            else if (btn && field.classList.contains('wpm-field') && btn.classList.contains('btn-plus')) {

                // Insert Value
                txtReader.arrowsInsertVal(true, field, 1, 1, 100000);
                txtReader.status.curArrow = ['wpm', 'minus'];

            }

            // WPM - Minus btn
            else if (btn && field.classList.contains('wpm-field') && btn.classList.contains('btn-minus')) {

                // Insert Value
                txtReader.arrowsInsertVal(false, field, 1, 1, 100000);
                txtReader.status.curArrow = ['wpm', 'plus'];

            }

            // Timer - Plus btn
            else if (btn && field.classList.contains('timer-field') && btn.classList.contains('btn-plus')) {

                // Insert Value
                txtReader.arrowsInsertVal(true, field, 0.5, 0, 1000);
                txtReader.status.curArrow = ['time', 'plus'];

            }

            // Timer - Minus btn
            else if (btn && field.classList.contains('timer-field') && btn.classList.contains('btn-minus')) {

                // Insert Value
                txtReader.arrowsInsertVal(false, field, 0.5, 0, 1000);
                txtReader.status.curArrow = ['time', 'minus'];

            }

        },

        // Arrows - Insert value
        arrowsInsertVal: function(status, field, counter, min, max) {
            let valTxt = field.querySelector('.txt-num'),
                val, input = false;

            if (!valTxt) {
                input = true;
                valTxt = field.querySelector('.txt-input-num');
                val = Number(valTxt.value);
            } else {
                val = Number(valTxt.textContent);
            }

            if (!counter) {
                counter = 1;
            }

            if (status && val < max) { // Plus
                let valNum = val + counter;

                if (counter < 0.5 && counter > 0) {
                    valNum = Number(valNum.toFixed(2));
                }

                input ? valTxt.value = valNum : valTxt.textContent = valNum;
                txtReader.changeArrowOption(field, valTxt);

            } else if (!status && val > min) { // Minus
                let valNum = val - counter;

                if (counter < 0.5 && counter > 0) {
                    valNum = Number(valNum.toFixed(2));
                }

                input ? valTxt.value = valNum : valTxt.textContent = valNum;
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
                txtReader.calculateTotalTime(txtReader.status.txtSplit);
                // Calculate play time
                txtReader.wpmPlayTime();
            } else if (field.classList.contains('timer-field')) {
                // timer
                //txtReader.status.timer = 6000 * txtReader.status.storeTimePlay;
            } else if (field.classList.contains('wpm-field')) {
                // WPM
                txtReader.status.wpm = Number(valTxt.value);
                // Set timer
                txtReader.calculateTotalTime(txtReader.status.txtSplit);
                // Calculate play time
                txtReader.wpmPlayTime();
            }

            // Active arrow
            txtReader.status.activeArrow = true;
            txtReader.status.stopAnim = true;

            // Check if stop button clicked then update txtreader
            if (txtReader.status.startAnim && txtReader.status.stopBtn) {
                //txtReader.insertWordsFun();
            }
        },

        // WPM Input
        wpmInputFun: function() {
            // Check if animation working then stop
            if (txtReader.status.startAnim && !txtReader.status.stopAnim && !txtReader.status.stopBtn) {
                txtReader.stopAnimFun();
                txtReader.status.wpmInput = true;
                // Reset Time
                txtReader.status.activeArrow = true;
                txtReader.status.curArrow = ['wpm', 'minus'];
            }

            // Filter value
            if (/^\d+$/g.test(wordNum.value)) {
                // Store WPM value
                txtReader.status.wpm = Number(wordNum.value);
                // Set timer
                txtReader.calculateTotalTime(txtReader.status.txtSplit);
                // Calculate play time
                txtReader.wpmPlayTime();
                txtReader.status.currTime = parseInt(txtReader.calculateTotalTime(txtReader.status.txtSplit, txtReader.status.currIndex, true) / 100);

            } else if (wordNum.value.trim() !== '' || wordNum.value != 0) {
                wordNum.value = wordNum.value.slice(0, wordNum.value.length - 1);
            } else {
                wordNum.value = 1;
                txtReader.status.wpm = 1;
                // Set timer
                txtReader.calculateTotalTime(txtReader.status.txtSplit);
                // Calculate play time
                txtReader.wpmPlayTime();
            }

        },

        // Calculate play time
        wpmPlayTime: function() {
            let num = (txtReader.status.timer * 60) / 10000;
            wordNum.classList.add('active');

            if (num < 60) {
                arrowGroup.querySelector('.word-speed').textContent = 'sec';
                timerLen.classList.add('sec-counter');
                num = Math.round(num);
            } else if (num >= 60) {
                num = num / 60;
                timerLen.classList.remove('sec-counter');
                arrowGroup.querySelector('.word-speed').textContent = 'min';
                if (num > 1 && num % 2 !== 0) {
                    num = num.toFixed(1);
                }
            }
            
            // Insert time
            timerLen.textContent = num;
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
                    txtReader.status.activeArrow = false;
                    txtReader.status.stopAnim = false;
                    txtReader.status.startAnim = true;
                    // Call Animation function
                    txtReader.initAnimFun();
                });
            }

        },


        // Calculate total time
        calculateTotalTime: function(wordList, index, status, getIndex) {
            let arr, word, counter = 0, time = 0;
            if (!status) {
                // ignore Last chunk
                arr = wordList.slice(0, (txtReader.status.wordNum - txtReader.status.chunkSize));
            } else {
                // Get Prev words
                arr = wordList.slice(0, index + 1);
            }

            if (getIndex) {
                arr = wordList;
            }

            for (let i = 0; i < arr.length; i++) {
                if (arr[counter]) {
                    word = '';
                    if (txtReader.status.chunkSize > 1) {
                        for (let a = 0; a < txtReader.status.chunkSize; a++) {
                            if (arr[counter]) {
                                if (a === 0) {
                                    word = arr[counter];
                                } else {
                                    word += ' ' + arr[counter];
                                }
                                if (getIndex && time >= txtReader.status.currTime) {
                                    return counter;
                                }
                                counter += 1;
                            }
                        }
                    } else {
                        word = arr[counter];
                        counter += 1;
                    }
                    // Get Time
                    time += txtReader.getWordTime(word);
                    if (getIndex && time >= txtReader.status.currTime) {
                        return counter;
                    }
                } else {
                    break;
                }
            }
            if (!status) {
                txtReader.status.timer = Math.round(time);
                //txtReader.status.timer = parseInt(time + ((time / 100) * 10));
            }
            return Math.round(time);
            //return parseInt(time + ((time / 100) * 10));
        },

        // Get Word Time
        getWordTime: function(word) {
            let bonus = 0,
                delay = 1/(txtReader.status.wpm/60) * 1000,
                numbers_re = /(?:^|\s)(\d*\.?\d+|\d{1,4}(?:,\d{1,4})*(?:\.\d+)?)(?!\S)/g,
                numbers_matched = word.match(numbers_re),
                bonus_factor;


            if (txtReader.status.enablemicropauseNumbers == undefined) {
                txtReader.status.enablemicropauseNumbers = "true";
                txtReader.status.micropauseNumbersFactor = 0.05;
            }
            if (txtReader.status.enablemicropausePunctuation == undefined) {
                txtReader.status.enablemicropausePunctuation = "true";
                txtReader.status.micropausePunctuationFactor = 0.05;
            }
            if (txtReader.status.enablemicropauseLongWords == undefined) {
                txtReader.status.enablemicropauseLongWords = "true";
                txtReader.status.micropauseLongWordsFactor = 0.05;
            }

            //if contains a number
			if (numbers_matched && txtReader.status.enablemicropauseNumbers === "true") {

                numbers_matched = numbers_matched.join("");

                
                bonus_factor = (Math.round((numbers_matched.length - 1)/3.0) > 0 ? 1 : 0) * txtReader.status.micropauseNumbersFactor;

                // Get Bonus
                bonus = delay * bonus_factor;

            } else {
                if (txtReader.status.enablemicropausePunctuation === "true") {

                    //if not a number but contains punctuation (which includes comma separated numbers)
                    if(word.match(/[\,\.\!\;\:\?]/)) {
                        bonus_factor = (txtReader.status.micropausePunctuationFactor)
                        bonus = delay*bonus_factor;
                    }

                }

            }

            //delay longer words that are not numbers
			if(word.length > (8 * txtReader.status.chunkSize) && txtReader.status.enablemicropauseLongWords === "true" && numbers_matched === null) {

				bonus_factor = Math.ceil(word.length / (8*txtReader.status.chunkSize)) * txtReader.status.micropauseLongWordsFactor;
				bonus = bonus + delay*bonus_factor;
				
			}

            if (txtReader.status.wpm < 200) {
                bonus = 0;
            }

            txtReader.status.wordTime = delay + bonus;
            return delay + bonus;

        },

        // get words ready
        initAnimFun: function() {

            // Insert word without timer
            if (txtReader.status.insertWord) {
                txtReader.status.insertWord = false;
                txtReader.getNxtWord();
                wordDisplay.innerHTML = txtReader.status.nxtWord[1];
                // Speak word Callback
                txtReader.SpeakWord();
            }

            // Insert Word
            txtReader.insertWordsFun();
        },

        // Insert Words
        insertWordsFun: function() {

            if (txtReader.status.txtSplit[txtReader.status.currIndex] && !txtReader.status.stopAnim) {
                let miliiSec = Date.now(),
                    anim = setInterval(frame, 1),
                    sec = txtReader.status.timerConuter, min = 0, counter = 0,
                    sliderStep = 100 / txtReader.status.timer,
                    sliderCounter = (txtReader.status.timerConuter * sliderStep) + txtReader.status.sliderTime;

                $(slider).slider( "option", "step", sliderStep );

                function frame() {
                    let num, newSec, newMin;

                    if (txtReader.status.resetTime) {
                        miliiSec = txtReader.status.storeMilliSec[0] + counter;
                        num = miliiSec;
                        counter += 5;
                    } else {
                        num = parseInt((Date.now() - miliiSec));
                    }

                    if (!txtReader.status.txtSplit[txtReader.status.currIndex]) {
                        txtReader.status.stopAnim = true;
                    }

                    if (txtReader.status.stopAnim) {
                        // Stop Anim
                        clearInterval(anim);

                        txtReader.status.storeMilliSec.push(Date.now() - miliiSec);

                        if (!txtReader.status.stopBtn && !txtReader.status.activeArrow && !txtReader.status.sliderReset) {
                            txtReader.replayFun();
                            return false;
                        }

                        // When Arrow click
                        if (txtReader.status.activeArrow && !txtReader.status.wpmInput) {
                            txtReader.status.insertWord = true;
                            txtReader.status.currIndex -= 1;
                            txtReader.status.timeCounter = 0;

                            if (txtReader.status.curArrow[0] === 'chunk') {
                                if (txtReader.status.currIndex > 0) {
                                    txtReader.getPrevIndex();
                                    txtReader.status.currTime = parseInt(txtReader.calculateTotalTime(txtReader.status.txtSplit, txtReader.status.currIndex - 1, true) / 100);
                                    //txtReader.status.timerConuter = parseInt(txtReader.calculateTotalTime(txtReader.status.txtSplit, txtReader.status.currIndex - 1, true) / 100);
                                } else {
                                    txtReader.status.currTime = 0;
                                    //txtReader.status.timerConuter = 0;
                                }
                            } else {
                                txtReader.status.currTime = parseInt(txtReader.calculateTotalTime(txtReader.status.txtSplit, txtReader.status.currIndex, true) / 100);
                                //txtReader.status.timerConuter = parseInt(txtReader.calculateTotalTime(txtReader.status.txtSplit, txtReader.status.currIndex, true) / 100);
                            }

                            // Calculate time
                            txtReader.calculateTotalTime(txtReader.status.txtSplit);
                            // Calculate play time
                            txtReader.wpmPlayTime();
                            // Reset
                            txtReader.status.activeArrow = false;
                            txtReader.status.stopAnim = false;
                            txtReader.status.sliderTime = ((Number($('#slider').slider('value')) / 100) - (100 / txtReader.status.timer)) * 100
                            txtReader.status.timerConuter = parseInt((txtReader.status.currTime * 60) / 10000);

                            // Call animation
                            txtReader.initAnimFun();
                        }

                    } else {

                        if (num >= 1000) {
                            txtReader.status.resetTime = false;
                            txtReader.status.storeMilliSec = [];
                            counter = 0;
                            // 1 Sec
                            txtReader.status.timerConuter += 1;
                            
                            sec = Math.abs(txtReader.status.timerConuter - (60 * parseInt(txtReader.status.timerConuter / 60)));

                            if (txtReader.status.timerConuter >= 60) {
                                min = parseInt(txtReader.status.timerConuter / 60);
                            } else {
                                min = 0;
                            }

                            miliiSec = Date.now();

                            newSec = sec;
                            newMin = min;

                            if (sec < 10) {
                                newSec = '0' + sec;    
                            }
                            if (min < 10) {
                                newMin = '0' + min;
                            }
                            timer = newMin + ':' + newSec;
                            
                            // Insert timer
                            btmTimer.textContent = timer;                        
                        }

                        // Count
                        txtReader.status.timeCounter += 1;

                        if (txtReader.status.timeCounter >= txtReader.status.nxtWord[2]) {
                            // Voice Speed
                            txtReader.calculateSpeakSpeed(txtReader.status.nxtWord[2])
                            // Get word
                            txtReader.getNxtWord();
                            // Insert Word
                            wordDisplay.innerHTML = txtReader.status.nxtWord[1];
                            // Speak word Callback
                            txtReader.SpeakWord();
                            // Reset Counter
                            txtReader.status.timeCounter = 0;
                        }

                        if (!txtReader.status.sliderReset) {
                            // Slider Move
                            $(slider).slider( "value", sliderCounter );
                            sliderCounter += sliderStep;
                            txtReader.status.currTime += 1;
                        }
                    }

                }
            }
        },

        // Get Next Word
        getNxtWord: function() {
            let arr = [], word = '';

            if (txtReader.status.txtSplit[txtReader.status.currIndex]) {

                if (txtReader.status.chunkSize > 1) {
                    for (let i = 0; i < txtReader.status.chunkSize; i++) {
                        if (txtReader.status.txtSplit[txtReader.status.currIndex]) {
                            if (i === 0) {
                                word = txtReader.status.txtSplit[txtReader.status.currIndex];
                            } else {
                                word += ' ' + txtReader.status.txtSplit[txtReader.status.currIndex];
                            }
                            txtReader.status.currIndex += 1;
                        }
                    }
                } else {
                    word = txtReader.status.txtSplit[txtReader.status.currIndex];
                    txtReader.status.currIndex += 1;
                }
                arr.push(word, txtReader.highlightTxt(word), txtReader.getWordTime(word));
            }
            txtReader.status.nxtWord = arr;
            return arr;

        },

        // Calculate Index afte arrow click
        getPrevIndex: function() {
            if (txtReader.status.activeArrow) {
                txtReader.status.activeArrow = false;
                if (txtReader.status.curArrow[0] === 'chunk' && txtReader.status.curArrow[1] === 'plus') {
                    if (txtReader.status.currIndex - 1 >= 0) {
                        txtReader.status.currIndex -= 1;
                    }
                } else if (txtReader.status.curArrow[0] === 'chunk' && txtReader.status.curArrow[1] === 'minus') {
                    if (txtReader.status.currIndex - txtReader.status.chunkSize >= 0) {
                        txtReader.status.currIndex -= txtReader.status.chunkSize;
                    } else if (txtReader.status.currIndex - 1 >= 0) {
                        txtReader.status.currIndex -= 1;
                    }
                }
            }
        },

        // Callback on slider stop
        sliderStopCallback: function() {
            // check replay btn then remove it
            if (stopBtn.classList.contains('replay')) {
                stopBtn.classList.remove('replay');
                stopBtn.classList.remove('btn-primary');
                stopBtn.classList.add('btn-danger');
                stopBtn.textContent = 'Stop';
            }
            // Reset
            txtReader.status.currTime = ((Number($('#slider').slider('value')) / 100) * txtReader.status.timer);
            txtReader.status.timerConuter = parseInt((txtReader.status.currTime * 60) / 10000);
            txtReader.status.sliderTime = ((Number($('#slider').slider('value')) / 100) - (100 / txtReader.status.timer)) * 100;
            txtReader.status.currIndex = txtReader.calculateTotalTime(txtReader.status.txtSplit, null, null, true) - 1;

            // Continue animation
            if (!txtReader.status.stopBtn) {
                txtReader.status.insertWord = true;
                txtReader.status.stopAnim = false;
                txtReader.status.sliderReset = false;
                txtReader.initAnimFun();
            }

        },

        // Callback on slider start/click
        sliderStartCallback: function() {
            // Stop animation
            txtReader.status.stopAnim = true;
            txtReader.status.sliderReset = true;
        },

        // Stop btn
        stopAnimFun: function() {
            if (!stopBtn.classList.contains('active') && !stopBtn.classList.contains('replay')) {
                // Continue
                txtReader.status.stopAnim = true;
                stopBtn.classList.add('active');
                stopBtn.textContent = 'Continue';
				stopBtn.classList.add('btn-primary');
                stopBtn.classList.remove('btn-danger');
                txtReader.status.stopBtn = true;
            } else if (!stopBtn.classList.contains('replay')) {
                // Stop
                txtReader.status.stopAnim = false;
                stopBtn.classList.remove('active');
                stopBtn.textContent = 'Stop';
				stopBtn.classList.add('btn-danger');
                stopBtn.classList.remove('btn-primary');
                txtReader.status.sliderTime = $('#slider').slider('value');
                txtReader.status.stopBtn = false;
                txtReader.status.resetTime = true;
                if (txtReader.status.wpmInput) {
                    let num = txtReader.status.currIndex - 2;
                    txtReader.status.wpmInput = false;
                    if (num < 0 && txtReader.status.currIndex - 1 >= 0) {
                        num = txtReader.status.currIndex - 1
                    } else {
                        num = txtReader.status.currIndex;
                    }
                    txtReader.status.currTime = parseInt(txtReader.calculateTotalTime(txtReader.status.txtSplit, num, true) / 100);
                }
                //Continue Animation
                txtReader.insertWordsFun();
            } else if (stopBtn.classList.contains('replay')) {
                // Replay
                txtReader.status.stopBtn = false;
                txtReader.status.stopAnim = false;
                txtReader.status.activeArrow = false;
                txtReader.status.insertWord = true;
                stopBtn.classList.remove('replay');
                stopBtn.classList.remove('btn-primary');
                stopBtn.classList.add('btn-danger');
                stopBtn.textContent = 'Stop';
                btmTimer.textContent = '00:00';
                txtReader.status.sliderTime = 0;
                txtReader.initAnimFun();
            }
        },

        // Replay button
        replayFun: function() {
            stopBtn.classList.add('replay');
            stopBtn.textContent = 'Replay';
            stopBtn.classList.remove('btn-danger');
            stopBtn.classList.add('btn-primary');
            txtReader.status.currIndex = 0;
            txtReader.status.currTime = 0;
            txtReader.status.timeCounter = 0;
            txtReader.status.storeMilliSec = [];
        },

        // Speak Word Callback
        SpeakWord: function() {
            let word = wordDisplay.textContent;
            // Check if speak btn active
            if (speakBtn.classList.contains('active')) {
                // Speak
                let utterance = new SpeechSynthesisUtterance(word);
                utterance.rate = txtReader.status.speakSpeed;
                utterance.voice = txtReader.status.voice;
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
            if (num <= 5000 && num > 850) {
                txtReader.status.speakSpeed = 1.5;
            } else if (num <= 850 && num > 800) {
                txtReader.status.speakSpeed = 2;
            } else if (num <= 800 && num > 750) {
                txtReader.status.speakSpeed = 2.5;
            } else if (num <= 750 && num > 700) {
                txtReader.status.speakSpeed = 3;
            } else if (num <= 700 && num > 650) {
                txtReader.status.speakSpeed = 4;
            } else if (num <= 650 && num > 600) {
                txtReader.status.speakSpeed = 4.5;
            } else if (num <= 600 && num > 500) {
                txtReader.status.speakSpeed = 5;
            } else if (num <= 500 && num > 370) {
                txtReader.status.speakSpeed = 5.5;
            } else if (num <= 370 && num > 270) {
                txtReader.status.speakSpeed = 6;
            } else if (num <= 270){
                txtReader.status.speakSpeed = 8;
            }
        },

        // Add Voices
        addVoices: function() {
            let synth    = window.speechSynthesis,
                voices   = synth.getVoices(),
                dropList = selectVoice.querySelector('.drop-list');
            for (let i = 0; i < voices.length; i++) {
                let div = document.createElement('div');
                div.className = 'item';
                div.textContent = '(' + voices[i].lang.slice(-2) + ')';
                dropList.appendChild(div);
                // Store voices list
                txtReader.status.voicesList.push(voices[i]);
            }

            // add first voice
            selectVoice.querySelector('button .txt').textContent = '(' + txtReader.status.voicesList[0].lang.slice(-2) + ')';

            // Store voice
            txtReader.status.voice = txtReader.status.voicesList[0];
        },

        // Select Voice btn
        selectVoiceFun: function(e) {
            // On click on btn
            if (e.target.closest('button')) {

                if (!selectVoice.classList.contains('active')) { // Show
                    selectVoice.querySelector('.drop-list').classList.add('d-block');
                    setTimeout(function() {
                        selectVoice.classList.add('active');
                    }, 5);
                } else { // Hide
                    selectVoice.classList.remove('active');
                    setTimeout(function() {
                        selectVoice.querySelector('.drop-list').classList.remove('d-block');
                    }, 200);
                }

            } else if (e.target.closest('.item')) { // On click on item
                let index = Array.from(selectVoice.querySelectorAll('.drop-list .item')).indexOf(e.target.closest('.item'));

                // Insert Lang
                this.querySelector('button .txt').textContent = e.target.closest('.item').textContent;

                // Store voice
                txtReader.status.voice = txtReader.status.voicesList[index];

                // Hide droplist
                selectVoice.classList.remove('active');
                setTimeout(function() {
                    selectVoice.querySelector('.drop-list').classList.remove('d-block');
                }, 200);
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