class Task {
  done = false;
  isCurrent = false;

  constructor({ title, plan }) {
    this.title = title;
    this.plan = plan;
    this.actual = 0;
  }
}

export { Task };
