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

  constructor(timerConfig) {
    const {
      currentPhase = Timer.phases.POMODORO,
      currentState = Timer.states.STOPPED,
      breakTime = 5,
      pomodoroTime = 0.5,
      colors = {
        [Timer.phases.POMODORO]: "#ba4949",
        [Timer.phases.BREAK]: "#397097",
        [Timer.phases.LONG_BREAK]: "#333333",
      },
    } = timerConfig;
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

  onStateChange(oldState, newState) {}

  setState(newState) {
    if (!newState in Timer.states) {
      throw new UnknownState(`Unknown state ${newState}`);
    }

    this.onStateChange(this.state.currentState, newState);
    this.state.currentState = newState;
  }

  setPhase(newPhase) {
    this.state.currentPhase = newPhase;
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

const timer = new Timer({ breakTime: 10 });
console.log(timer.state.currentTime);
timer.tick();
console.log(timer.state.currentTime);
console.log(timer.formattedTime);
console.log(timer.formattedTimeWithDate);

const taskRepo = new TaskRepository();
console.log(taskRepo);
taskRepo.create(new Task({ title: "Task1", plan: 2 }));
taskRepo.create(new Task({ title: "Task2", plan: 2 }));
console.log(taskRepo);
taskRepo.getById(1);
taskRepo.update(1, { done: true });
taskRepo.getById(1);
taskRepo.delete(2);
timer.run();
