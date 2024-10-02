import UserService from "../../../service/UserService.js";

class RepeatingTaskEdit {
  constructor(taskModel, unitModel) {
    this.parent = document.querySelector("body");
    this.taskModel = taskModel;
    this.unitModel = unitModel;
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

  submit(type, func) {
    this.submitType = type;
    this.handleSubmit = func;
  }

  getFormData() {
    let data = {};
    const formData = new FormData(this.component.querySelector("form"));

    let key, value;
    for ([key, value] of formData.entries()) {
      console.log('key: ' + key + ' value: ' + value)
      data[key] = value;
    }

    console.log("getFormData: " + data)

    return data;
  }

  render() {
    if (!this.hasOwnProperty("component")) {
      this.component = document.createElement("div");
      this.component.classList.add("modal", "fade");
      this.component.setAttribute("tabindex", "-1");
      this.component.setAttribute("aria-hidden", "true");
    }

    this.component.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-powder">
                <h1 class="modal-title fs-4">${this.submitType === "SAVE"
        ? "Uredi ponavljajoce opravilo"
        : "Dodaj novo ponavljajoče se opravilo"
      }</h1>
                <button type="button" class="btn-close btnClose" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3">
                          <label for="title" class="form-label">Naziv opravila</label>
                          <input type="text" class="form-control" name='title' value="${this.taskModel.title
      }" required>
                        </div>
                        <div class="mb-3">
                            <label for="location" class="form-label">Prostor</label>
                            <select class="form-select" aria-label="Select space" name='location' required>
                                <option selected disabled value="">Izberite prostor</option>
                                ${this.unitModel.spaces.map(
        (space) => `<option value="${space}" ${space == this.taskModel.location ? "selected" : ""}>${space}</option>`)}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="duration" class="form-label">Trajanje opravila</label>
                            <input type="number" class="form-control" name="duration" min="1" value="${this.taskModel.duration
      }" required>
                        </div>
                        <div class="mb-3">
                            <label for="startDate" class="form-label">Datum začetka izvedbe opravila</label>
                            <input type="date" class="form-control setMinDate" name="startDate" value=${this.taskModel.startDate ? this.taskModel.startDate.toISOString().substr(0, 10) : ""
      } required>
                        </div>
                        <div class="mb-3">
                            <label for="endDate" class="form-label">Datum konca izvedbe opravila</label>
                            <input type="date" class="form-control setMinDate" name="endDate" value=${this.taskModel.endDate ? this.taskModel.endDate.toISOString().substr(0, 10) : ""
      } required>
                        </div>
                        <div class="mb-3">
                            <label for="frequency" class="form-label">Pogostost opravila</label>
                            <select class="form-select" aria-label="Select rep" name="frequency" required>
                                <option selected disabled value="">Izberite pogostost opravila</option>
                                ${["dnevno", "tedensko", "mesecno", "letno"].map(tip => {
        return `<option value="${tip}" ${tip == this.taskModel.frequency ? "selected" : ""
          }>${tip}</option>`;
      })}
                            </select>
                        </div>
                        <div class="mb-3">
                            <p class="card-text mb-0"> Odgovorne osebe
                                <div class="input-group mt-2">
                                    <select class="form-select" aria-label="Select people" id="responsibleUsers" aria-describedby="basic-addon3 basic-addon4" name="responsibleUsers">
                                        <option selected disabled value="">Izberite odgovorno osebo in dodajte na seznam</option>
                                        ${this.unitModel.roommates.map(roommate => {
        return `<option value="${roommate.username}">${roommate.name}</option>`
      })}
                                    </select>
                                    <button class="input-group-text" id="responsibleUserAdd" type="button" >
                                        <i class="bi bi-plus-circle"></i>
                                    </button>
                                </div>
                                <span class="d-inline" id="responsibleUsersList">
                                  
                                </span>
                            </p>                                                  
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="button-80 button-80-powder btnSave" id="add-repeating-btn">${this.submitType === "SAVE"
        ? "Shrani"
        : "Dodaj opravilo"
      }</button>
                        <button type="button" class="button-80 button-80-bright-pink btnClose" data-bs-dismiss="modal">Zapri</button>
                    </div>
                </form>  
            </div>
            </div>
    `;

    this.component.querySelector('#responsibleUserAdd').addEventListener('click', () => {
      this.taskModel.addResponsibleUser(this.component.querySelector('#responsibleUsers').value)
      renderUsers.call(this)
    })


    function createUserButton(username, self, renderUsers) {
      const element = document.createElement('span')
      element.classList = 'bg-powder p-2 rounded me-2 d-inline-block m-1 mt-3'
      element.innerHTML = `
        ${username}
        <button type="button" class="btn btn-close btn-close-small ms-2"></button>
      `

      element.querySelector('button').addEventListener('click', () => {
        self.taskModel.removeResponsibleUser(username)
        renderUsers()
      })

      return element
    }

    function renderUsers() {
      this.component.querySelector('#responsibleUsersList').innerHTML = ''

      this.taskModel.responsibleUsers.map(user => {
        this.component.querySelector('#responsibleUsersList').appendChild(createUserButton(user, this, renderUsers.bind(this)))
      })
    }

    renderUsers.bind(this)();

    this.component.querySelectorAll(".btnClose").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.close();
      });
    });

    this.component
      .querySelector(".btnSave")
      .addEventListener("click", this.handleSubmit);

    this.parent.appendChild(this.component);
    this.show();
  }
}

export default RepeatingTaskEdit;
