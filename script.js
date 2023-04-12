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

class Timer {
  static states = Object.freeze({
    PAUSED: "PAUSED",
    STOPPED: "STOPPED",
    RUNNING: "RUNNING",
  });

  static phases = Object.freeze({
    STOPPED: "STOPPED",
  });

  constructor(timerConfig) {
    const {
      currentPhase = Timer.phases.STOPPED,
      breakTime = 5,
      pomodoroTime = 25,
      colors = {
        POMODORO: "#ba4949",
        BREAK: "#397097",
        LONG_BREAK: "#333333",
      },
    } = timerConfig;
    this.config = {
      breakTime,
      pomodoroTime,
      colors,
    };
    this.state = {
      currentPhase,
      currentTime: pomodoroTime * 60,
    };
  }

  tick() {
    this.state.currentTime -= 1;
  }

  get formattedTime() {
    const hours = Math.floor(this.state.currentTime / 3600);
    const minutes = Math.floor((this.state.currentTime - hours * 3600) / 60);
    const seconds = this.state.currentTime - hours * 3600 - minutes * 60;

    Timer.formatTimeWithLeadingZero(hours, minutes, seconds);
  }

  get formattedTimeWithDate() {
    const date = new Date(this.state.currentTime * 1000);
    Timer.formatTimeWithLeadingZero(
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
debugger;
