import { Timer } from "./timer.js";

class TimerApp {
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

export { TimerApp };
