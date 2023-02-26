const timeBreakSeconds = 10;
const pomodoroSeconds = 20;
let currentTask = null;

const {startTimer, stopTimer, runTimer,  togglePauseTimer, timerStates, currentTimerState}
    = Timer(undefined, (old, current) => {
    if(old === timerStates.STOPPED && current === timerStates.RUNNING) {
        startPomodoroTimer();
        updateTimerButtonText('Pause');
    }
});
const {renderTimerDisplay, renderStateDisplay, togglePauseTimerClick, updateTimerButtonText, enableButton} = TimerUi();
const {updateTask, createTask, tasks, deleteTask} = Tasks();
const {renderCurrentTask, createTaskNode, getTaskData, renderTasks} = TasksUi();


function init() {
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

function setCurrentTask(task) {
    currentTask = task;
    renderCurrentTask(task);
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