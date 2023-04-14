//Требования
/*
 1. Я как пользователь хочу добавлять, удалять, изменять задачи
 2. Хочу отслеживать estimate и фактическое время, затраченное на задачу
 3. Хочу иметь возможность запускать, останавливать таймер
 4. Хочу задавать длительность помидора, длительность перерывов
 5. Хочу чтобы цвет фона менялся в зависимости от фазы таймера
 */

import { Timer } from "./timer.js";
import { TaskRepository } from "./repo.js";
import TasksApp from "./tasks-app.js";
import { TimerApp } from "./timer-app.js";

void (function main() {
  const repo = new TaskRepository();
  const app = new TimerApp({
    id: "timer-app-2",
    eventHandlers: {
      onPhaseСhange: (oldPhase, newPhase) => {
        if (newPhase === Timer.phases.BREAK) {
          const selectedTaskCandidate = repo.getSelectedTask();

          if (!selectedTaskCandidate) {
            return;
          }

          repo.update(selectedTaskCandidate.id, {
            actual: selectedTaskCandidate.actual + 1,
          });

          taskApp.updateTaskActual(
            selectedTaskCandidate.id,
            selectedTaskCandidate.actual + 1
          );
        }
      },
    },
  });
  app.main();
  const taskApp = new TasksApp({
    repo,
    id: "tasks-app",
    eventHandlers: {
      onTaskSelect: (selectedTaskId) => {
        app.enableButton();
      },
    },
  });
  taskApp.main();
})();
