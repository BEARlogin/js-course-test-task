function TimerUi() {
    const timerButtonText = Object.freeze({
        PAUSE: 'Pause',
        RESUME: 'Resume',
        START: 'Start',
    })

    const timerStateClass = Object.freeze({
        POMODORO: 'pomodoro',
        BREAK: 'break',
    })

    const timerStateText = Object.freeze({
        POMODORO: 'Pomodoro',
        BREAK: 'Break',
    })

    function renderTimerDisplay(value) {
        const formattedTimer = formatTimer(value, (h,m,s) => {
            return `${h}:${m}:${s}`
        })

        requestAnimationFrame(() => {
            document.querySelector('.timer').innerHTML = formattedTimer;
        })
    }

    function renderStateDisplay(isWork) {
        if(!isWork) {
            document.querySelector('.main').classList.remove(timerStateClass.BREAK)
            document.querySelector('.main').classList.add(timerStateClass.POMODORO)
        } else {
            document.querySelector('.main').classList.remove(timerStateClass.POMODORO)
            document.querySelector('.main').classList.add(timerStateClass.BREAK)
        }

        document.querySelector('.state').innerHTML = isWork ? timerStateText.POMODORO : timerStateText.BREAK;
    }

    function updateTimerButtonText(text) {
        document.querySelector('.timer-button').innerHTML = text
    }

    // function togglePauseTimerClick() {
    //     togglePauseTimer();
    //     updateTimerButtonText( isPaused ? timerButtonText.RESUME : timerButtonText.PAUSE);
    //     if(!isPaused) {
    //         document.querySelector('.timer-button i')
    //             .classList.add('gg-play-pause-o')
    //     } else {
    //         document.querySelector('.timer-button i')
    //             .classList.remove('gg-play-pause-o')
    //     }
    // }

    function enableButton() {
        document.querySelector('.timer-button').removeAttribute('disabled');
    }

    return {
        renderTimerDisplay,
        renderStateDisplay,
        updateTimerButtonText,
        // togglePauseTimerClick,
        enableButton,
    }
}