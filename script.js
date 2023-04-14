//Требования
/*
 1. Я как пользователь хочу добавлять, удалять, изменять задачи
 2. Хочу отслеживать estimate и фактическое время, затраченное на задачу
 3. Хочу иметь возможность запускать, останавливать таймер
 4. Хочу задавать длительность помидора, длительность перерывов
 5. Хочу чтобы цвет фона менялся в зависимости от фазы таймера
 */

function formatTimeWithLeadingZero(hours, minutes, seconds) {
  return [hours, minutes, seconds]
    .map((v) => "0".repeat(2 - v.toString().length) + v)
    .join(":");
}

class ItemNotFoundException extends Error {}
class UnknownState extends Error {}

class Timer {
  static states = Object.freeze({
    PAUSED: "PAUSED",
    STOPPED: "STOPPED",
    RUNNING: "RUNNING",
  });

  static phases = Object.freeze({
    POMODORO: "POMODORO",
    BREAK: "BREAK",
    LONG_BREAK: "LONG_BREAK",
  });

  static colors = {
    [Timer.phases.POMODORO]: "#ba4949",
    [Timer.phases.BREAK]: "#397097",
    [Timer.phases.LONG_BREAK]: "#333333",
  };

  transitions = {
    [Timer.phases.POMODORO]: {
      to: Timer.phases.BREAK,
      onTransition() {
        this.state.currentTime = this.config.breakTime * 60;
      },
    },
    [Timer.phases.BREAK]: {
      to: Timer.phases.POMODORO,
      onTransition() {
        this.state.currentTime = this.config.pomodoroTime * 60;
      },
    },
  };

  constructor(timerConfig = {}) {
    const {
      currentPhase = Timer.phases.POMODORO,
      currentState = Timer.states.STOPPED,
      eventHandlers,
      breakTime = 0.1,
      pomodoroTime = 0.25,
      colors = {
        [Timer.phases.POMODORO]: "#ba4949",
        [Timer.phases.BREAK]: "#397097",
        [Timer.phases.LONG_BREAK]: "#333333",
      },
    } = timerConfig;
    this.eventHandlers = eventHandlers;
    this.config = {
      breakTime,
      pomodoroTime,
      colors,
    };
    this.state = {
      currentPhase,
      currentState,
      currentTime: pomodoroTime * 60,
    };
  }

  onStateChange(oldState, newState) {
    if (typeof this.eventHandlers.onStateChange !== "function") {
      return;
    }

    this.eventHandlers.onStateChange(oldState, newState);
  }

  setState(newState) {
    if (!newState in Timer.states) {
      throw new UnknownState(`Unknown state ${newState}`);
    }

    this.onStateChange(this.state.currentState, newState);
    this.state.currentState = newState;
  }

  setPhase(newPhase) {
    if (typeof this.eventHandlers.onPhaseСhange === "function") {
      this.eventHandlers.onPhaseСhange(this.state.currentPhas, newPhase);
    }
    this.state.currentPhase = newPhase;
  }

  runClick() {
    if (
      [Timer.states.STOPPED, Timer.states.PAUSED].includes(
        this.state.currentState
      )
    ) {
      this.run();
    } else if (this.state.currentState === Timer.states.RUNNING) {
      this.pause();
    }
  }

  run() {
    this.interval = setInterval(() => {
      this.tick();
    }, 1000);
    this.setState(Timer.states.RUNNING);
  }

  pause() {
    this.clear();
    this.setState(Timer.states.PAUSED);
  }

  onTimerEnd() {
    const transition = this.transitions[this.state.currentPhase];
    const bindedTransition = transition.onTransition.bind(this);
    bindedTransition();
    this.setPhase(transition.to);
  }

  onTick() {
    if (this.state.currentTime <= 0) {
      this.onTimerEnd();
    }
    if (typeof this.eventHandlers.onTick !== "function") {
      return;
    }
    this.eventHandlers.onTick();
  }

  stop() {
    this.clear();
    this.setState(Timer.states.STOPPED);
  }

  clear() {
    clearInterval(this.interval);
  }

  tick() {
    this.state.currentTime -= 1;
    this.onTick();
    console.log(this.formattedTime);
  }

  get formattedTime() {
    const hours = Math.floor(this.state.currentTime / 3600);
    const minutes = Math.floor((this.state.currentTime - hours * 3600) / 60);
    const seconds = this.state.currentTime - hours * 3600 - minutes * 60;

    return Timer.formatTimeWithLeadingZero(hours, minutes, seconds);
  }

  get formattedTimeWithDate() {
    const date = new Date(this.state.currentTime * 1000);
    return Timer.formatTimeWithLeadingZero(
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );
  }

  static formatTimeWithLeadingZero(hours, minutes, seconds) {
    return [hours, minutes, seconds]
      .map((v) => "0".repeat(2 - v.toString().length) + v)
      .join(":");
  }
}

class Task {
  done = false;
  isCurrent = false;

  constructor({ title, plan }) {
    this.title = title;
    this.plan = plan;
    this.actual = 0;
  }
}

class TaskRepository {
  items = [];
  key = "tasks";

  constructor() {
    this.restorState();
  }

  persistState() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
  }

  restorState() {
    const jsonData = localStorage.getItem(this.key);

    if (!jsonData) {
      this.items = [];
      return;
    }

    try {
      const data = JSON.parse(jsonData);
      this.items = data;
    } catch (e) {
      this.items = [];
    }
  }

  create(task) {
    this.items.push({ ...task, id: this.createId() });
    this.persistState();
  }

  findIndexByIdOrThrow(id) {
    const itemIndex = this.items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      throw new ItemNotFoundException(`Item with id=${id} not found`);
    }

    return itemIndex;
  }

  update(id, data) {
    const itemIndex = this.findIndexByIdOrThrow(id);
    const updated = {
      ...this.items[itemIndex],
      ...data,
    };
    this.items.splice(itemIndex, 1, updated);
    this.persistState();
  }

  delete(id) {
    this.items.splice(this.findIndexByIdOrThrow(id), 1);
    this.persistState();
  }

  getById(id) {
    return this.items[this.findIndexByIdOrThrow(id)];
  }

  getAll() {
    return this.items;
  }

  createId() {
    return this.items.length + 1;
  }

  getSelectedTask() {
    return this.items.find((task) => task.selected);
  }

  selectTask(id) {
    this.items = this.items.map((item) => ({
      ...item,
      selected: item.id === Number.parseInt(id),
    }));
    this.persistState();
  }
}

class TaskApp {
  _selectedTaskId = null;

  constructor({ repo, id, eventHandlers }) {
    this.repo = repo;
    this.appNode = document.getElementById(id);
    this.eventHandlers = eventHandlers;
  }

  set selectedTaskId(val) {
    this._selectedTaskId = val;
    if (!this.eventHandlers.onTaskSelect) {
      return;
    }
    this.eventHandlers.onTaskSelect(val);
  }

  get selectedTaskId() {
    return this._selectedTaskId;
  }

  main() {
    const selectedTaskCandidate = this.repo.items.find((s) => s.selected);

    if (selectedTaskCandidate) {
      this.selectedTaskId = selectedTaskCandidate.id;
      this.eventHandlers.onTaskSelect(this.selectedTaskId);
    }

    this.renderTasksList();
    this.registerEventHandlers();
  }

  registerEventHandlers() {
    const form = document.getElementById("create-task-form");

    form.addEventListener("submit", (event) => {
      var formData = new FormData(form);
      const { title, plan } = Object.fromEntries(formData.entries());
      this.repo.create(
        new Task({
          title,
          plan,
        })
      );
      this.renderTasksList();
      event.preventDefault();
    });
  }

  registerTasksEvent() {
    const nodes = this.appNode.querySelectorAll(".task input");

    nodes.forEach((node) => {
      node.addEventListener("input", (event) => {
        this.selectedTaskId = event.target.value;
        this.repo.selectTask(this.selectedTaskId);
      });
    });
  }

  createTaskTemplate(task) {
    return `
      <div class="task" data-task-id="task-${task.id}">
          <div>${task.title}</div>
          <div>${task.done ? "Done" : "Not done"}</div>
          <div class="task-pomodoro-actual">${task.actual}</div>
          <div class="task-pomodoro-plan">${task.plan}</div>
          <input ${
            task.selected ? "checked" : ""
          } name="currentTask" type="radio" value="${task.id}">
          <button>Done</button>
      </div>
    `;
  }

  updateTaskActual(taskId, actual) {
    const taskElement = this.appNode.querySelector(
      `[data-task-id="task-${taskId}"]`
    );
    taskElement.querySelector(".task-pomodoro-actual").textContent = actual;
  }

  renderTasksList() {
    const tasks = this.repo.getAll();
    const tasksTemplates = tasks.reduce((acc, task) => {
      acc += this.createTaskTemplate(task);
      return acc;
    }, "");
    this.appNode.querySelector(".tasks").innerHTML = tasksTemplates;
    this.registerTasksEvent();
  }
}

class App {
  constructor({ id, eventHandlers }) {
    this.appNode = document.getElementById(id);
    this.eventHandlers = eventHandlers;
  }

  main() {
    this.timer = new Timer({
      eventHandlers: {
        onTick: () => {
          this.updateTimer(this.timer.formattedTime);
        },
        onStateChange: (oldState, newState) => {
          this.onStateChange(oldState, newState);
        },
        onPhaseСhange: (oldPhase, newPhase) => {
          this.eventHandlers?.onPhaseСhange(oldPhase, newPhase);
          this.onPhaseСhange(oldPhase, newPhase);
        },
      },
    });
    this.updateTimer(this.timer.formattedTime);
    this.registerHandlers();
  }

  onStateChange(oldState, newState) {
    let buttonText = "";
    if (newState === Timer.states.RUNNING) {
      buttonText = "Pause timer";
    } else {
      buttonText = "Resume timer";
    }
    this.appNode.querySelector(".timer-button-text").textContent = buttonText;
  }

  onPhaseСhange(oldPhase, newPhase) {
    let phaseText = "";
    if (newPhase === Timer.phases.BREAK) {
      phaseText = "Break";
    } else {
      phaseText = "Pomodoro";
    }
    this.appNode.querySelector(".state").textContent = phaseText;
    document.querySelector(".main").style.backgroundColor =
      Timer.colors[newPhase];
  }

  updateTimer(value) {
    this.appNode.querySelector(".timer").textContent = value;
  }

  onTimerButtonClick() {
    this.timer.runClick();
  }

  get timerButton() {
    return this.appNode.querySelector(".timer-button");
  }

  registerHandlers() {
    this.timerButton.addEventListener("click", () => {
      this.onTimerButtonClick();
    });
  }

  enableButton() {
    this.timerButton.removeAttribute("disabled");
  }
}

void (function main() {
  const repo = new TaskRepository();
  const app = new App({
    id: "timer-app",
    eventHandlers: {
      onPhaseСhange: (oldPhase, newPhase) => {
        if (newPhase === Timer.phases.BREAK) {
          const selectedTaskCandidate = repo.getSelectedTask();

          if (!selectedTaskCandidate) {
            return;
          }

          repo.update(selectedTaskCandidate.id, {
            actual: selectedTaskCandidate.actual + 1,
          });

          taskApp.updateTaskActual(
            selectedTaskCandidate.id,
            selectedTaskCandidate.actual + 1
          );
        }
      },
    },
  });
  app.main();
  const taskApp = new TaskApp({
    repo,
    id: "tasks-app",
    eventHandlers: {
      onTaskSelect: (selectedTaskId) => {
        app.enableButton();
      },
    },
  });
  taskApp.main();
})();
