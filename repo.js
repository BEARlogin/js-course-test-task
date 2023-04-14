import { ItemNotFoundException } from "./exceptions.js";

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

export { TaskRepository };
