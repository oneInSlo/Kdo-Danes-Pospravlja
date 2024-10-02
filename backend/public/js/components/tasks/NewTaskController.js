import TaskTypeSelector from "./TaskTypeSelector.js";
import OneTimeTaskModel from "./OneTimeTask/OneTimeTaskModel.js";
import OneTimeTaskEdit from "./OneTimeTask/OneTimeTaskEdit.js";
import RepeatingTaskModel from "./RepeatingTask/RepeatingTaskModel.js";
import RepeatingTaskEdit from "./RepeatingTask/RepeatingTaskEdit.js";

import TaskService from "../../service/TaskService.js";
import LocalData from "../../service/LocalData.js";

class NewTaskController {
  constructor(unitModel) {
    this.taskTypeSelector = new TaskTypeSelector()
    this.unitModel = unitModel;

    this.taskTypeSelector.onSelectOnetime(() => {
      this.taskTypeSelector.close()

      const model = new OneTimeTaskModel()
      const view = new OneTimeTaskEdit(model, this.unitModel)
      view.submit('CREATE', () => {
        const data = view.getFormData();
        model.load(data);
        TaskService.createOneTimeTask(LocalData.getSelectedUnit(), model)
        view.close()
        this.handleFinish()
      })
      view.render()
    })

    this.taskTypeSelector.onSelectRepeating(() => {
      this.taskTypeSelector.close()

      const model = new RepeatingTaskModel()
      const view = new RepeatingTaskEdit(model, this.unitModel)
      view.submit('CREATE', () => {
        const data = view.getFormData();
        model.load(data);
        TaskService.createRepeatingTask(LocalData.getSelectedUnit(), model)
        view.close()
        this.handleFinish()
      })
      view.render()
    })

    this.taskTypeSelector.render()
  }

  onFinish(func) {
    this.handleFinish = func;
  }

}

export default NewTaskController