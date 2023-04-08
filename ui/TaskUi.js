function TasksUi() {
    function renderCurrentTask(currentTask) {
        const currentTaskNode = document.querySelector('.current-task');
        currentTaskNode.innerHTML = 'Current task ' + currentTask.title;
    }

    function createTaskNode(task) {
        const { title, done, actual, plan, id } = task;

        const nodeTask = document.createElement('div');
        nodeTask.setAttribute('data-task-id', `task-${id}`);
        nodeTask.classList.add('task');

        const nodeTitle = document.createElement('div');
        nodeTitle.innerHTML = title;

        const nodeStatus = document.createElement('div');
        nodeStatus.innerHTML = done ? 'Done' : 'Not Done';

        const nodeActual = document.createElement('div');
        nodeActual.innerHTML = actual;

        const nodePlan = document.createElement('div');
        nodePlan.innerHTML = plan;

        const nodeSelector = document.createElement('input');

        nodeActual.classList.add('task-pomodoro-actual');
        nodePlan.classList.add('task-pomodoro-plan');

        const buttonDone = document.createElement('button');

        nodeSelector.setAttribute('type','radio');
        nodeSelector.setAttribute('name','currentTask');
        nodeSelector.setAttribute('value', id)

        if(currentTask?.id === id) {
            nodeSelector.setAttribute('checked', 'checked')
        }

        nodeSelector.oninput = () => {
            setCurrentTask(task)
        }

        nodeTask.append(nodeTitle, nodeStatus, nodeActual, nodePlan, nodeSelector);
        return nodeTask;
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
