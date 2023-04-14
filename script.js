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
  }
}

class TaskRepository {
  items = [];

  create(task) {
    this.items.push({ ...task, id: this.createId() });
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
  }

  delete(id) {
    this.items.splice(this.findIndexByIdOrThrow(id), 1);
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
}

class App {
  constructor({ id }) {
    this.appNode = document.getElementById(id);
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
          this.onPhaseСhange(oldPhase, newPhase);
        },
      },
    });
    this.repo = new TaskRepository();
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

  registerHandlers() {
    this.appNode
      .querySelector(".timer-button")
      .addEventListener("click", () => {
        this.onTimerButtonClick();
      });
  }
}

void (function main() {
  const app = new App({ id: "timer-app" });
  app.main();
})();
