import OneTimeTask from "./components/tasks/OneTimeTask/OneTimeTask.js";
import OneTimeTaskModel from "./components/tasks/OneTimeTask/OneTimeTaskModel.js";

import RepeatingTask from "./components/tasks/RepeatingTask/RepeatingTask.js";
import RepeatingTaskModel from "./components/tasks/RepeatingTask/RepeatingTaskModel.js";

import FinishedTask from "./components/tasks/FinishedTask/FinishedTask.js";

import TasksModel from "./components/tasks/TasksModel.js";

import TaskService from "./service/TaskService.js";
import UserService from "./service/UserService.js";

import UnitModel from "./components/units/UnitModel.js";
import UnitService from "./service/UnitService.js";

import NewTaskController from "./components/tasks/NewTaskController.js";
import LocalData from "./service/LocalData.js";

let tasksModel = new TasksModel();
let unitModel;
let repeatingTasksMode = 'generic'

async function load() {
  let OTtaskModels = [];
  let RtaskModels = [];
  let FtaskModels = [];

  unitModel = new UnitModel();
  unitModel.load(await UnitService.getUnitByID(LocalData.getSelectedUnit()));

  let OTtasks = await TaskService.getOneTimeTasksOfUnit(
    LocalData.getSelectedUnit()
  );
  OTtasks.forEach((task) => {
    let taskModel = new OneTimeTaskModel().load(task);
    OTtaskModels.push(taskModel);
  });


  let Rtasks;
  if (repeatingTasksMode === 'generic') {
    Rtasks = await TaskService.getRepeatingTasksOfUnit(
      LocalData.getSelectedUnit()
    );
  }
  else {
    Rtasks = await TaskService.getTodoRepeatingTasksOfUnit(
      LocalData.getSelectedUnit()
    );
  }

  Rtasks.forEach((task) => {
    let taskModel = new RepeatingTaskModel().load(task);
    RtaskModels.push(taskModel);
  });

  let Ftasks = await TaskService.getFinishedTasksOfUnit(
    LocalData.getSelectedUnit()
  );
  Ftasks.forEach((task) => {
    let taskModel = new OneTimeTaskModel().load(task);
    FtaskModels.push(taskModel);
  });

  tasksModel.setTasks(OTtaskModels, RtaskModels, FtaskModels);
}

function render() {
  document.getElementById("oneTimeTasksContainer").innerHTML = "";
  document.getElementById("repeatingTasksContainer").innerHTML = "";
  document.getElementById("finishedTasksContainer").innerHTML = "";

  tasksModel.getOneTimeTasks().forEach((taskModel) => {
    let component;
    component = new OneTimeTask(
      document.getElementById("oneTimeTasksContainer"),
      taskModel,
      unitModel
    );
    component.onChange(async () => {
      await load();
      render();
    });

    component.render();
  });

  tasksModel.getRepeatingTasks().forEach((taskModel) => {
    let component;
    component = new RepeatingTask(
      document.getElementById("repeatingTasksContainer"),
      taskModel,
      unitModel
    );
    component.onChange(async () => {
      await load();
      render();
    });
    component.render();
  });

  tasksModel.getFinishedTasks().forEach((taskModel) => {
    let component = new FinishedTask(
      document.getElementById("finishedTasksContainer"),
      taskModel
    );
    component.render();
  });
}

async function init() {
  LocalData.setLoggedInUser(await UnitService.getCurrentUser());
  const name_surname = LocalData.getLoggedInUser().ime_priimek.split(" ");
  let greetingContent;
  
  if (name_surname.length > 1) {
    greetingContent = name_surname.splice(-1).join(" ")
  }
  else {
    greetingContent = name_surname[0]
  }

  document.getElementById("greetingNameContainer").textContent = greetingContent

  await load();
  render();
}

// MAIN
init();

// add task Hook
const selectTaskTypeModal = document.getElementById("addTaskModal");

document.getElementById("addTaskButton").addEventListener("click", () => {
  const contr = new NewTaskController(unitModel);
  contr.onFinish(init);
});

// --------- FILTERS ---------
// Search container hook
document.getElementById("searchTaskFilter").addEventListener("input", (e) => {
  tasksModel.updateFilter({ search: e.target.value });
  render();
});

// Sort hooks
document
  .getElementById("sortTasksLatestFirstFilter")
  .addEventListener("click", () => {
    tasksModel.updateFilter({ sort: "latestFirst" });
    render();
  });
document
  .getElementById("sortTasksOldestFirstFilter")
  .addEventListener("click", () => {
    tasksModel.updateFilter({ sort: "oldestFirst" });
    render();
  });
document
  .getElementById("sortTasksAlphabeticalFilter")
  .addEventListener("click", () => {
    tasksModel.updateFilter({ sort: "alphabetical" });
    render();
  });

// my tasks only filter
document.getElementById("onlyMyTasks").addEventListener("change", (e) => {
  tasksModel.updateFilter({ responsible: e.target.checked ? "me" : "all" });
  render();
});

//todo/generic repeating task filter hook
document.querySelectorAll('.todogeneric').forEach(function (radio) {
  radio.addEventListener('change', async function () {
    if (this.checked) {
      repeatingTasksMode = this.id
      await load()
      render()
    }
  });
});

export default init;
