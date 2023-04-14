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

export { Timer };
