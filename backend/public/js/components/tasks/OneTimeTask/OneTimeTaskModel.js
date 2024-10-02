import TaskService from "../../../service/TaskService.js"

class OneTimeTaskModel {
  constructor() {
    this.id = null;
    this.title = null;
    this.duration = null;
    this.location = null;
    this.dateAdded = null;
    this.lastChange = null;
    this.responsibleUsers = [];
    this.dueDate = null;
    this.isFinished = false;
  }


  load(data) {
    Object.keys(data).forEach((key) => {
      if (this.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    });

    return this
  }


  finishTask() {
    console.log("Task finished");
  }
}

export default OneTimeTaskModel;
