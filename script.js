const timeBreakSeconds = 10;
const pomodoroSeconds = 20;
const tasksKey = 'tasks';

let tasks = [];
let timer = null;
let timeLeft = 0;
let currentTask = null;
let onPause = false;


function saveTasks() {
    localStorage.setItem(tasksKey, JSON.stringify(tasks))
}

function loadTasks() {
    try {
        tasks = JSON.parse(localStorage.getItem(tasksKey))
        renderTasks();
    } catch (e) {
        tasks = [];
        saveTasks();
    }
}

function createTask() {
    const title = document.getElementById('task-title-input');

    const newTask = {
        id: tasks.length + 1,
        title: title.value,
        pomodoros: 0,
        done: false,
    };

    tasks.push(newTask);
    title.value = '';
    renderTasks();
    saveTasks();
}

function init() {
    document.getElementById('create-task-form')
        .addEventListener('submit', e => e.preventDefault())
    loadTasks();
    updateTimerDisplay(pomodoroSeconds)
    updateStateDisplay(true)
}

function zero(val) {
    return val.toString().length === 1 ? '0' + val : val;
}

function updateTimerDisplay(value) {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value - hours * 3600) / 60);
    const seconds = value - hours * 3600 - minutes * 60;

    requestAnimationFrame(() => {
        document.querySelector('.timer').innerHTML = `${zero(hours)}:${zero(minutes)}:${zero(seconds)}`;
    })
}

function updateStateDisplay(isWork) {
    if(!isWork) {
        document.querySelector('.main').classList.remove('working')
        document.querySelector('.main').classList.add('rest')
    } else {
        document.querySelector('.main').classList.remove('rest')
        document.querySelector('.main').classList.add('working')
    }

    document.querySelector('.state').innerHTML = isWork ? 'Pomodoro' : 'Break';
}

function createTaskNode(task) {
    const { title, done, pomodoros, id } = task;

    const nodeTask = document.createElement('div');
    nodeTask.setAttribute('data-task-id', `task-${id}`);
    nodeTask.classList.add('task');

    const nodeTitle = document.createElement('div');
    const nodeStatus = document.createElement('div');
    const nodeCount = document.createElement('div');
    const nodeSelector = document.createElement('input');

    nodeCount.classList.add('task-pomodoro-count');

    nodeSelector.setAttribute('type','radio');
    nodeSelector.setAttribute('name','currentTask');
    nodeSelector.setAttribute('value', id)

    if(currentTask?.id === id) {
        nodeSelector.setAttribute('checked', 'checked')
    }

    nodeSelector.oninput = () => {
        setCurrentTask(task)
    }

    nodeTitle.innerHTML = title;
    nodeStatus.innerHTML = done ? 'Done' : 'Not Done';
    nodeCount.innerHTML = pomodoros;

    nodeTask.append(nodeTitle, nodeStatus, nodeCount, nodeSelector);
    return nodeTask;
}

function setCurrentTask(task) {
    currentTask = task;
    renderCurrentTask();
    enableButton();
}

function enableButton() {
    document.querySelector('.timer-button').removeAttribute('disabled');
}

function incrementCurrentTaskPomodoroCount() {
    currentTask.pomodoros += 1;
    document
        .querySelector(`[data-task-id="task-${currentTask.id}"]`)
        .querySelector('.task-pomodoro-count').innerHTML = currentTask.pomodoros;
    saveTasks();
}

function renderCurrentTask() {
    const currentTaskNode = document.querySelector('.current-task');
    currentTaskNode.innerHTML = 'Current task ' + currentTask?.title;
}

function renderErrors() {
    const errorsNode = document.querySelector('.errors');
}

function renderTasks() {
    const tasksNode = document.querySelector('.tasks');
    tasksNode.innerHTML = '';
    const children = tasks.map(createTaskNode);
    tasksNode.append(...children)
}

function onTimerButtonClick() {
    return timer ? togglePauseTimer() : startPomodoroTimer();
}

function startPomodoroTimer() {
    updateTimerButtonText( 'Pause');
    updateStateDisplay(true)
    startTimer(startTimeBreak, pomodoroSeconds)
}

function startTimeBreak() {
    updateStateDisplay(false)
    incrementCurrentTaskPomodoroCount();
    startTimer(startPomodoroTimer, timeBreakSeconds)
}

function startTimer(onTimerEnd, timeMinutes) {
    timeLeft = timeMinutes;
    updateTimerDisplay(timeLeft)
    timer = setInterval(() => {
        if(onPause) {
            return;
        }
        timeLeft -= 1
        updateTimerDisplay(timeLeft)
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

function togglePauseTimer() {
    onPause = !onPause;
    updateTimerButtonText( onPause ? 'Resume' : 'Pause');
    if(!onPause) {
        document.querySelector('.timer-button i')
            .classList.add('gg-play-pause-o')
    } else {
        document.querySelector('.timer-button i')
            .classList.remove('gg-play-pause-o')
    }
}

function updateTimerButtonText(text) {
    document.querySelector('.timer-button').innerHTML = text
}

init();