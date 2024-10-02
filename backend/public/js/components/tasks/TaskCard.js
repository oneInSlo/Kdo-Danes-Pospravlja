import { calcColor } from "../../util/colors.js";
import { datediff } from "../../util/dates.js";

class TaskCard {
  constructor(parent, model) {
    this.parent = parent;
    this.model = model;
    this.handleOpenDetailsClick = () => {};
    this.handleFinishClick = () => {};
  }
  

  onOpenDetailsClick(func) {
    this.handleOpenDetailsClick = func;
  }

  onFinishClick(func) {
    this.handleFinishClick = func;
  }

  getColor() {
    const greenColor = "BFD8D2"
    const yellowColor = "FFE4B3"
    const redColor = "DEB4A4"

    const today = new Date();

    let percentage;
    if (this.model.dueDate <= today) {
      percentage = 0
    } else if (datediff(today, this.model.dueDate) > 4) {
      percentage = 1
    }
    else {
      percentage = datediff(today, this.model.dueDate) / 4
    } 

    const calculatedColor = calcColor([redColor, yellowColor, greenColor], percentage)


    return calculatedColor !== 'NaN' ? `#${calculatedColor}` : `#${greenColor}`;

  }

  render() {
    // v primeru, da je component ze ustvarjen in prikazan, ne ustvarimo novega ampak ga updateamo
    if (this.component == null) {
      this.component = document.createElement("div");
      this.component.classList = "card border-secondary-subtle m-2";
    }

    this.component.innerHTML = `
      <div class="card-header" style="background-color:${this.getColor()}"></div>
      <div class="card-body text-dark">
          <h3 class="card-title">${this.model.title}</h3>
        <hr>
        <p class="card-text mb-0">Prostor: <span class="fw-bold">${
          this.model.location
        }</span></p>
        <p class="card-text mb-0">Trajanje: <span class="fw-bold">${
          this.model.duration
        } min</span></p>
        <hr>
        <div class="row">
          <div class="col-xl-6">
            <button class="button-80 button-80-powder w-100 mt-2 btnDetails">Podrobnosti</button>
          </div>
        <div class="col-xl-6">
          <button class="button-80 button-80-bright-pink w-100 mt-2 btnFinish">Končaj</button>
        </div>
        </div>
        </div>
      `;

    this.component
      .querySelector(".btnDetails")
      .addEventListener("click", this.handleOpenDetailsClick);

    this.component
      .querySelector(".btnFinish")
      .addEventListener("click", this.handleFinishClick);

    this.parent.prepend(this.component);
  }
}

export default TaskCard;
