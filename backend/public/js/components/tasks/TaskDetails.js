import UnitService from "../../service/UnitService.js";

class TaskDetails {
  constructor(model) {
    this.parent = document.querySelector("body");
    this.model = model;
    this.handleEditClick = () => { };
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

  onEditClick(func) {
    this.handleEditClick = func;
  }

  render() {
    if (this.component == null) {
      this.component = document.createElement("div");
      this.component.classList.add("modal", "fade");
      this.component.setAttribute("tabindex", "-1");
      this.component.setAttribute("aria-labelledby", "oneTimeTaskDetails");
      this.component.setAttribute("aria-hidden", "true");
      this.component.id = "oneTimeTaskDetails";
    }

    this.component.innerHTML = `
          <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-powder">
                <h1 class="modal-title fs-4" id="kosnjaTraveLabel">${this.model.title
      }</h1>
                <button type="button" class="btn-close btnClose" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p class="card-text mb-0">Prostor: <span class="fw-bold">${this.model.location
      }</span></p>
                    <p class="card-text mb-0">Trajanje: <span class="fw-bold">${this.model.duration
      } min</span></p>
      ${!isNaN(this.model.dueDate) ? `<p class="card-text mb-0">Datum izvedbe: <span class="fw-bold">${this.model.dueDate.toLocaleDateString("sl-SI")}</span></p>` : ''
    }
                    <hr>
                    <p class="card-text mb-0"> Odgovorne osebe:
                        <span class="d-inline" id='oneTimeTaskDetailsResposibleUsersParent'>
                          ${Promise.all(this.model.responsibleUsers.map(user => UnitService.getUser(user)))
        .then(users => {
          const html = users.map(user =>
            `<span class="bg-powder p-2 rounded me-2 d-inline-block m-1">${user.username}</span>`
          ).join("");
          document.getElementById('oneTimeTaskDetailsResposibleUsersParent').innerHTML = html;
        })}
                        </span>
                    </p>
                    <hr>
                    <p class="card-text m-0 text-end"><small>Datum dodajanja: <span class="fw-bold text-dark">${this.model.dateAdded.toLocaleDateString("sl-SI")
      }</span></small></p>
                    <p class="card-text m-0 text-end"><small>Datum zadnje spremembe: <span class="fw-bold text-body-tertiary">${this.model.lastChange.toLocaleDateString("sl-SI")
      }</span></small></p>
                              
                </div>
                <div class="modal-footer">
                    <button type="button" class="button-80 button-80-powder btnEdit">Uredi podrobnosti</button>
                    <button type="button" class="button-80 button-80-bright-pink btnClose">Zapri</button>
                </div>
            </div>
            </div>
      `;

    //Button Listenerji
    this.component
      .querySelector(".btnEdit")
      .addEventListener("click", this.handleEditClick);

    this.component.querySelectorAll(".btnClose").forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log("closing");
        this.close();
      });
    });

    this.parent.appendChild(this.component);

    this.show();
  }
}

export default TaskDetails;
