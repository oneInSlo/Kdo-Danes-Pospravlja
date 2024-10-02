import TaskCard from "../TaskCard.js";
import TaskDetails from "../TaskDetails.js";
import RepeatingTaskEdit from "./RepeatingTaskEdit.js";
import TaskService from "../../../service/TaskService.js";

class RepeatingTask {
  constructor(cardParent, taskModel, unitModel) {
    this.cardParent = cardParent;

    this.taskModel = taskModel;
    this.unitModel = unitModel;

    this.card = new TaskCard(this.cardParent, this.taskModel);
    this.details = new TaskDetails(this.taskModel, this.unitModel);
    this.edit = new RepeatingTaskEdit(this.taskModel, this.unitModel);

    this.card.onOpenDetailsClick(() => {
      console.log(JSON.stringify(this.taskModel))
      this.details.render();
    });

    this.card.onFinishClick(() => {
      TaskService.finishRepeatingTask(this.unitModel.id, this.taskModel.id);
      this.handleChange()
    });

    this.details.onEditClick(() => {
      this.details.close();
      this.edit.render();
    });

    this.edit.submit("SAVE", () => {
      const data = this.edit.getFormData();
      this.taskModel.load(data);
      TaskService.updateRepeatingTask(this.unitModel.id, this.taskModel)
      this.handleChange()
    });
  }

  remove() {
    this.card.remove();
  }

  onChange(func) {
    this.handleChange = func;
  }

  load(data) {
    this.taskModel.load(data);
    return this
  }

  render() {
    this.card.render();
  }
}

export default RepeatingTask;
