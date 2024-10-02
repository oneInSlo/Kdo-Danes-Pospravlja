import TaskService from "../../../service/TaskService.js";
import TaskCard from "../TaskCard.js";
import TaskDetails from "../TaskDetails.js";
import OneTimeTaskEdit from "./OneTimeTaskEdit.js";

class OneTimeTask {
  constructor(cardParent, taskModel, unitModel) {
    this.cardParent = cardParent;

    this.taskModel = taskModel
    this.unitModel = unitModel;

    this.card = new TaskCard(this.cardParent, this.taskModel);
    this.details = new TaskDetails(this.taskModel, this.unitModel);
    this.edit = new OneTimeTaskEdit(this.taskModel, this.unitModel);

    this.card.onOpenDetailsClick(() => {
      this.details.render();
    });
    this.card.onFinishClick(() => {
      TaskService.finishOneTimeTask(this.unitModel.id, this.taskModel.id);
      this.handleChange();
    });

    this.details.onEditClick(() => {
      this.details.close();
      this.edit.render();
    });

    this.edit.submit("SAVE", () => {
      const data = this.edit.getFormData();
      this.taskModel.load(data);
      TaskService.updateOneTimeTask(this.unitModel.id, this.taskModel);
      this.handleChange();
    });
  }

  load(data) {
    this.taskModel.load(data);
    return this
  }

  onChange(func) {
    this.handleChange = func
  }

  render() {
    this.card.render();
  }
}

export default OneTimeTask;
