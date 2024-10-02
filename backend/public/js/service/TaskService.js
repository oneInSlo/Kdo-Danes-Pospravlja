import Request from "./Request.js";

class TaskService {
  static taskMap = {
    id_enkratno_opravilo: "id",
    rok: "dueDate",
    naziv: "title",
    trajanje: "duration",
    datum_dodajanja: "dateAdded",
    datum_zadnje_spremembe: "lastChanged",
    prostor_naziv: "location",
    datum_zacetka: "startDate",
    datum_konca: "endDate",
    ponavljanje: "frequency",
    potrebno_stevilo: "peopleNeeded",
    odgovorne_osebe: "responsibleUsers"
  };

  static remap(item) {
    const map = this.taskMap

    let mappedItem = {};
    const reverseMap = {};
    Object.keys(map).forEach(key => {
      reverseMap[map[key]] = key;
    });

    Object.keys(item).forEach(key => {
      if (map[key]) {
        mappedItem[map[key]] = item[key];
      } else if (reverseMap[key]) {
        mappedItem[reverseMap[key]] = item[key];
      }
    });

    return mappedItem;
  }

  static async getRepeatingTasksOfUnit(unitId) {
    const repeatingTasks = await new Request(
      window.location.origin + "/units/" + unitId + "/tasks/repeating"
    )
      .method("GET")
      .send();


    repeatingTasks.data.forEach(task => {
      task.dateAdded = new Date(task.dateAdded * 1000);
      task.dueDate = new Date(task.dueDate * 1000);
      task.endDate = new Date(task.endDate * 1000);
      task.startDate = new Date(task.startDate * 1000);
      task.lastChange = new Date(task.lastChange * 1000);
      task.location = task.room
      delete task.room
      task.responsibleUsers = task.responsibleUsers.username.map(user => user)
    })

    return repeatingTasks.data

  }

  static async getTodoRepeatingTasksOfUnit(unitid) {
    let todoRepeatingTasks = await new Request(
      window.location.origin + "/units/" + unitid + "/tasks/repeating/current"
    )
      .method("GET")
      .send()


    if (todoRepeatingTasks.data) {
      todoRepeatingTasks = todoRepeatingTasks.data.map(task => {
        task = this.remap(task)
        task.dateAdded = new Date(task.dateAdded * 1000);
        task.dueDate = new Date(task.dueDate * 1000);
        task.endDate = new Date(task.endDate * 1000);
        task.startDate = new Date(task.startDate * 1000);
        task.lastChange = new Date(task.lastChange * 1000);

        return task
      })
    }



    return todoRepeatingTasks
  }

  static async getOneTimeTasksOfUnit(unitId) {
    const oneTimeTasks = await new Request(
      window.location.origin + "/units/" + unitId + "/tasks/onetime"
    )
      .method("GET")
      .send();

    if (oneTimeTasks.data) {
      oneTimeTasks.data.forEach(task => {
        task.lastChange = new Date(task.lastChange * 1000);
        task.dateAdded = new Date(task.dateAdded * 1000);
        task.dueDate = new Date(task.dueDate * 1000);
        task.location = task.room
        delete task.room
      })

      return oneTimeTasks.data
    }

    return []


  }

  static async createOneTimeTask(unitId, taskModel) {
    const response = await new Request(window.location.origin + "/units/" + unitId + "/tasks/onetime")
      .method("POST")
      .content("json")
      .body(
        JSON.stringify({ ...this.remap(taskModel), responsibleUsers: taskModel.responsibleUsers })
      )
      .send();

  }

  static async getFinishedTasks(unitId) {
    const response = await new Request(window.location.origin + "/units/" + unitId + "/tasks/finished")
      .method("GET")
      .send();


    return response.data;
  }

  static async finishTask(unitId, taskId) {
    const response = await new Request(window.location.origin + "/units/" + unitId + "/tasks/" + taskId + "/finish")
      .method("POST")
      .send();
  }

  static async createRepeatingTask(unitId, taskModel) {
    console.log(JSON.stringify(this.remap(taskModel)))
    new Request(window.location.origin + "/units/" + unitId + "/tasks/repeating")
      .method("POST")
      .content("json")
      .body(JSON.stringify(this.remap(taskModel)))
      .send();

  }

  static async updateOneTimeTask(unitId, taskModel) {
    new Request(window.location.origin + "/units/" + unitId + "/tasks/" + taskModel.id + "/onetime")
      .method("PUT")
      .content("json")
      .body(JSON.stringify(this.remap(taskModel)))
      .send();
  }

  static async updateRepeatingTask(unitId, taskModel) {
    new Request(window.location.origin + "/units/" + unitId + "/tasks/" + taskModel.id + "/repeating")
      .method("PUT")
      .content("json")
      .body(JSON.stringify(this.remap(taskModel)))
      .send();
  }

  static async finishOneTimeTask(unitId, taskId) {
    new Request(window.location.origin + "/units/" + unitId + "/tasks/" + taskId + "/onetime/finished")
      .method("POST")
      .send();
  }

  static async finishRepeatingTask(unitId, taskId) {
    new Request(window.location.origin + "/units/" + unitId + "/tasks/" + taskId + "/repeating/finished")
      .method("POST")
      .send();
  }

  static async getFinishedTasksOfUnit(unitId) {
    const response = await new Request(window.location.origin + "/units/" + unitId + "/tasks/finished")
      .method("GET")
      .send();


    if (response.data) {
      response.data = response.data.map(task =>
        this.remap(task))
    }

    return response.data || [];
  }


}

export default TaskService;
