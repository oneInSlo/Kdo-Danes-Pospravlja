import LocalData from "../../service/LocalData.js";
import RepeatingTaskModel from "./RepeatingTask/RepeatingTaskModel.js";

class TasksModel {
  setTasks(oneTimeTaskModels, repeatingTaskModels, finishedTaskModels) {
    this.oneTimeTaskModels = oneTimeTaskModels;
    this.repeatingTaskModels = repeatingTaskModels;
    this.finishedTaskModels = finishedTaskModels;
    this.search = "";
    this.sort = "latest";
    this.responsible = "all";
  }

  updateFilter(filter) {
    Object.keys(filter).forEach((key) => {
      this[key] = filter[key];
    });
  }

  sortTasks(taskModels) {
    switch (this.sort) {
      case "latestFirst":
        taskModels.sort((a, b) => b.dueDate - a.dueDate);
        break;
      case "oldestFirst":
        taskModels.sort((a, b) => a.dueDate - b.dueDate);
        break;
      case "alphabetical":
        taskModels.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return taskModels;
  }

  filterTasks(taskModels) {
    taskModels = taskModels.filter(
      (task) =>
        this.responsible === "all" ||
        task.responsibleUsers.includes(LocalData.getLoggedInUser().username)
    );

    taskModels = taskModels.filter((task) => {
      if (this.search === "") return true;
      const includes = task.title
        .toLowerCase()
        .includes(this.search.toLowerCase());
      return includes;
    });


    return taskModels;
  }

  getOneTimeTasks() {
    return this.sortTasks(this.filterTasks(this.oneTimeTaskModels));
  }

  getRepeatingTasks() {
    return this.sortTasks(this.filterTasks(this.repeatingTaskModels));
  }

  getFinishedTasks() {
    return this.sortTasks(this.filterTasks(this.finishedTaskModels));
  }
}

export default TasksModel;
