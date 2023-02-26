function Tasks(tasksKey = 'tasks') {

    let taskItems = [];
    let currentTask = null;

    function loadTasks() {
        if(!localStorage.getItem(tasksKey)) {
            return [];
        }

        try {
            return JSON.parse(localStorage.getItem(tasksKey))
        } catch (e) {
            saveTasks([]);
            return []
        }
    }

    function saveTasks(tasks) {
        localStorage.setItem(tasksKey, JSON.stringify(tasks))
    }

    function createTask(title, plan = 1) {
        const newTask = {
            id: taskItems.length + 1,
            title,
            plan,
            actual: 0,
            done: false,
        };

        taskItems.push(newTask);
        saveTasks(taskItems);
    }

    function deleteTask(id) {
        taskItems = taskItems.filter(t => t.id !== id);
    }

    function updateTask(id, data) {
        console.log(data)
        const taskIndex = taskItems.findIndex(t => t.id === id);
        taskItems[taskIndex] = {
            ...taskItems[taskIndex],
            ...data
        };
        saveTasks(taskItems);

        return taskItems[taskIndex];
    }

    function setCurrentTask(task) {
        currentTask = task;
    }

    taskItems = loadTasks();

    return {
        createTask,
        deleteTask,
        updateTask,
        setCurrentTask,
        tasks: taskItems,
        currentTask,
    }
}