function TasksUi() {
    function renderCurrentTask(currentTask) {
        const currentTaskNode = document.querySelector('.current-task');
        currentTaskNode.innerHTML = 'Current task ' + currentTask.title;
    }

    function createTaskNode(task) {
        const { title, done, actual, plan, id } = task;

        const taskTemplate = `
            <div class="task" data-task-id="task-${id}">
                <div>${title}</div>
                <div>${ done ? 'Done' : 'Not Done'}</div>
                <div class="task-pomodoro-actua">${actual}</div>
                <div class="task-pomodoro-plan">${plan}</div>
                <input oninput="setCurrentTask(${id})" name="currentTask" ${currentTask?.id === id ? 'checked' : ''} type="radio" value="${id}" />
                <button>Done</button>
            </div>
        `;
        const parser = new DOMParser();
        const dom = parser.parseFromString(taskTemplate, 'text/html');

        return dom.querySelector('.task');
    }

    function renderTasks(tasks) {
        const tasksNode = document.querySelector('.tasks');
        tasksNode.innerHTML = '';
        const children = tasks.map(createTaskNode);
        tasksNode.append(...children)
    }

    function getTaskData() {
        return {
            title: document.getElementById('task-title-input').value
        }
    }


    return {
        renderTasks,
        createTaskNode,
        renderCurrentTask,
        getTaskData,
    }
}
