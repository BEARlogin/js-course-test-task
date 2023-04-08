const timeBreakSeconds = 10;
const pomodoroSeconds = 20;
let currentTask = null;

const {startTimer, stopTimer, runTimer, togglePauseTimer, timerStates, currentTimerState}
    = Timer(undefined, (old, current) => {
    console.log({old, current});
    if (old === timerStates.STOPPED && current === timerStates.RUNNING) {
        startPomodoroTimer();
    } else if (old === timerStates.RUNNING && current === timerStates.PAUSED) {
        updateTimerButtonText('Resume');
    }

    if (current === timerStates.RUNNING) {
        updateTimerButtonText('Pause');
    }
});
const {renderTimerDisplay, renderStateDisplay, togglePauseTimerClick, updateTimerButtonText, enableButton} = TimerUi();
const {updateTask, createTask, tasks, deleteTask} = Tasks();
const {renderCurrentTask, createTaskNode, getTaskData, renderTasks} = TasksUi();


function init() {
    fetch('http://localhost:3005/tasks').then(res => {
        res.json().then(data => console.log(data));
    })
    document.getElementById('create-task-form')
        .addEventListener('submit', e => e.preventDefault())
    renderTimerDisplay(pomodoroSeconds)
    renderStateDisplay(true)
    renderTasks(tasks ?? [])
}

function onCreateTask() {
    const data = getTaskData();
    createTask(data.title);
    renderTasks(tasks);
}

function setCurrentTask(taskId) {
    currentTask = tasks.find(t => t.id === taskId);
    renderCurrentTask(currentTask);
    enableButton();
}

function incrementCurrentTaskPomodoroCount() {
    currentTask = updateTask(currentTask.id, {actual: currentTask.actual + 1})
    renderTasks(tasks);
}

function startPomodoroTimer() {
    renderStateDisplay(true)
    startTimer((timeLeft) => {
        renderTimerDisplay(timeLeft)
    }, startTimeBreak, pomodoroSeconds)
}

function startTimeBreak() {
    renderStateDisplay(false)
    incrementCurrentTaskPomodoroCount();
    startTimer((timeLeft) => {
        renderTimerDisplay(timeLeft)
    }, startPomodoroTimer, timeBreakSeconds)
}

init();
