class OneTimeTaskEdit {
  constructor(taskModel, unitModel) {
    this.parent = document.querySelector("body");
    this.taskModel = taskModel;
    this.unitModel = unitModel;
  }

  dataChanged() {
    this.render();
  }

  submit(type, func) {
    this.submitType = type;
    this.handleSaveClick = func;
  }

  close() {
    this.modalController.hide();
    this.component.remove();
  }

  show() {
    if (!this.hasOwnProperty("modalController")) {
      this.modalController = new bootstrap.Modal(this.component);
    }

    this.modalController.show();
  }

  getFormData() {
    let data = {};
    const formData = new FormData(this.component.querySelector("form"));

    let key, value;
    for ([key, value] of formData.entries()) {
      console.log('key: ' + key + ' value: ' + value)
      if (key === 'responsibleUsers') value = [value]
      data[key] = value;
    }


    return data;
  }

  render() {
    if (!this.hasOwnProperty("component")) {
      this.component = document.createElement("div");
      this.component.classList.add("modal", "fade");
      this.component.setAttribute("tabindex", "-1");
      this.component.setAttribute(
        "aria-labelledby",
        "urediPodrobnostiEnkratnoLabel"
      );
      this.component.setAttribute("aria-hidden", "true");
    }

    this.component.remove();

    this.component.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-powder">
                <h1 class="modal-title fs-4">${this.submitType === "SAVE"
        ? "Uredi podrobnosti"
        : "Dodaj novo enkratno opravilo"
      }</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3">
                          <label for="task-name" class="form-label">Naziv opravila</label>
                          <input type="text" class="form-control" name="title" value="${this.taskModel.title
      }" required>
                        </div>
                        <div class="mb-3">
                            <label for="location" class="form-label">Prostor</label>
                            <select class="form-select" aria-label="Select space" name="location" required>
                                <option selected disabled value="">Izberite prostor</option>
                                ${this.unitModel.spaces.map(space => {
        return `<option value="${space}" ${space == this.taskModel.location ? 'selected' : ''}>${space}</option>`;
      })} 
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="duration" class="form-label">Trajanje opravila</label>
                            <input type="number" class="form-control" name="duration" min="1" value="${this.taskModel.duration
      }" required>
                        </div>
                        <div class="mb-3">
                            <label for="startDate" class="form-label">Datum izvedbe opravila</label>
                            <input type="date" class="form-control" id="startDate" name="dueDate" value="${this.taskModel.dueDate ? this.taskModel.dueDate.toISOString().substr(0, 10) : ""
      }" required>
                        </div>
                        <div class="mb-3">
                            <label for="responsible-person" class="form-label">Odgovorna oseba</label>
                                <select class="form-select" id="responsible-person" aria-label="Select the responsible person" name='responsibleUsers' required>
                                    <option selected disabled value="">Izberite osebo</option>
                                    ${this.unitModel.roommates.map(roommate => {
        return `<option value="${roommate.username}" ${roommate.username === this.taskModel.responsibleUsers[0] ? "selected" : ""}>${roommate.name}</option>`
      })}
                                </select>                                                 
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="button-80 button-80-powder btnSave">${this.submitType === "SAVE"
        ? "Shrani spremembe"
        : "Dodaj opravilo"
      }</button>
                        <button type="button" class="button-80 button-80-bright-pink btnClose">Zapri</button>
                    </div>
                </form>  
            </div>
            </div>

    `;

    this.component.querySelector(".btnClose").addEventListener("click", () => {
      this.close();
    });

    this.component
      .querySelector(".btnSave")
      .addEventListener("click", this.handleSaveClick);

    this.parent.appendChild(this.component);
    this.show();
  }
}

export default OneTimeTaskEdit;
