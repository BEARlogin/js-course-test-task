import { Task } from "./models/task";

class TasksApp {
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

  async main() {
    const selectedTaskCandidate = await this.repo.getSelectedTask();

    if (selectedTaskCandidate) {
      this.selectedTaskId = selectedTaskCandidate.id;
      this.eventHandlers.onTaskSelect(this.selectedTaskId);
    }

    this.registerEventHandlers();

    this.renderTasksList();
  }

  registerEventHandlers() {
    const form = document.getElementById("create-task-form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      var formData = new FormData(form);
      const { title, plan } = Object.fromEntries(formData.entries());
      this.repo
        .create(
          new Task({
            title,
            plan,
          })
        )
        .then(() => {
          this.renderTasksList();
        });
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

  async renderTasksList() {
    const tasks = await this.repo.getAll();

    const tasksTemplates = tasks.reduce((acc, task) => {
      acc += this.createTaskTemplate(task);
      return acc;
    }, "");
    this.appNode.querySelector(".tasks").innerHTML = tasksTemplates;
    this.registerTasksEvent();
  }
}

export default TasksApp;
