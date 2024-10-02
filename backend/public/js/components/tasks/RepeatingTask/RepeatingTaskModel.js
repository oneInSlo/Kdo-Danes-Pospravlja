class RepeatingTaskModel {
  constructor() {
    this.id = null;
    this.title = "";
    this.duration = 1;
    this.location = "";
    this.dateAdded = "";
    this.lastChange = "";
    this.frequency = "";
    this.responsibleUsers = [];
    this.dueDate = "";
    this.startDate = "";
    this.endDate = "";
    this.peopleNeeded = 1;
  }


  addResponsibleUser(username) {
    if (this.responsibleUsers.includes(username)) {
      return
    }
    else {
      this.responsibleUsers.push(username)
    }

  }

  removeResponsibleUser(username) {
    this.responsibleUsers = this.responsibleUsers.filter((user) => user !== username)
  }

  load(data) {
    Object.keys(data).forEach((key) => {
      if (this.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    });

    return this
  }
}

export default RepeatingTaskModel;
