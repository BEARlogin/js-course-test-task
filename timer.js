function Timer(initTime =  0, onStateTransition) {

    const states = Object.freeze({
        RUNNING: 'RUNNING',
        PAUSED: 'PAUSED',
        STOPPED: 'STOPPED'
    });

    let timeLeft = initTime;
    let timer = null;
    let currentState = states.STOPPED;

    function startTimer(onTimerTick, onTimerEnd, timeSeconds) {
        timeLeft = timeSeconds;
        onTimerTick(timeLeft);
        timer = setInterval(() => {
            if(currentState === states.PAUSED) {
                return;
            }
            timeLeft -= 1
            onTimerTick(timeLeft);
            if(timeLeft <= 0) {
                clearInterval(timer)
                onTimerEnd();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer)
        timeLeft = 0;
    }

    function setState(state) {
        currentState = state;
    }

    function runTimer() {
        const oldState = currentState;
        if(currentState === states.STOPPED) {
            setState(states.RUNNING)
        } else if(currentState === states.RUNNING) {
           setState(states.PAUSED)
        } else if(currentState === states.PAUSED) {
            setState(states.RUNNING)
        }
        onStateTransition(oldState, currentState);
    }

    return {
        startTimer,
        stopTimer,
        runTimer,
        timerStates: states,
        currentTimerState: currentState,
    }
}
