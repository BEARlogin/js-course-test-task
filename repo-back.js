import { axios } from "./api.js";

class TaskBackRepository {
  items = [];
  key = "tasks";

  async create(task) {
    const res = await axios.post(`/${this.key}`, task);
  }

  async update(id, data) {
    const res = await axios.put(`/${this.key}/${id}`, data);
  }

  async delete(id) {
    const res = await axios.delete(`/${this.key}/${id}`);
  }

  async getById(id) {
    const res = await axios.get(`/${this.key}/${id}`);
    return res.data;
  }

  async getAll() {
    const res = await axios.get(`/${this.key}`);
    return res.data;
  }

  async getSelectedTask() {
    const res = await this.getAll();

    return res.find((task) => task.selected);
  }

  async selectTask(id) {
    const tasks = await this.getAll();

    const promises = tasks.map((task) => {
      this.update(task.id, {
        ...task,
        selected: task.id === Number.parseInt(id),
      });
    });
    await Promise.all(promises);
  }
}

export { TaskBackRepository };
