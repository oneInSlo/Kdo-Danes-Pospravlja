class ErrorHandler {
  static handle(status, message) {
    if (status === 401) window.location.href = '/prijava-in-registracija'
    else if (status === 400 || status === 403 || status === 500) {
      this.displayModalAlert(message);
    } else if (status === 404) {
      this.displayAlert(message);
    } 
  }

  static createAlert(message, id) {
    const component = document.createElement("div");
    
    component.classList.add("alert", "alert-danger", "text-center", "alert-edit", "alert-dismissible", "fade", "show", "px-5");
    component.setAttribute("role", "alert");
    component.setAttribute("id", id);

    component.innerHTML = `
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      <h2 class="alert-heading">
          <span class="d-block">
              <lord-icon src="https://cdn.lordicon.com/usownftb.json" trigger="loop" stroke="bold" colors="primary:#692326,secondary:#692326" style="width:50px;height:50px"></lord-icon>
          </span>
          Napaka...
      </h2>
      <hr>
      <p class="mb-0 text-dark text-center">
          ${message}
      </p>
    `;

    return component;
  }

  static displayAlert(message) {
    const alertContainer = document.body;
    const alertId = `alert-${Date.now()}`;
    const alert = this.createAlert(message, alertId);
    
    alertContainer.append(alert);

    const alertDiv = document.getElementById(alertId);
    alertDiv.style.display = "block";

    setTimeout(() => {
      alertDiv.style.display = "none";
      alertDiv.remove();
    }, 4000);
  }

  static createModal(message, id) {
    const component = document.createElement("div");

    component.classList.add("modal", "fade");
    component.setAttribute("tabindex", "-1");
    component.setAttribute("aria-labelledby", "errorLabel");
    component.setAttribute("aria-hidden", "true");
    component.setAttribute("id", id);

    component.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-bright-pink d-flex align-items-center justify-content-between">
                    <h1 class="modal-title fs-5 d-flex align-items-center" id="errorLabel">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        Napaka...
                    </h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body w-100">
                    <div class="row align-items-center">
                        <div class="col-8">
                            <p class="mb-0 p-2">
                            ${message}
                            </p>
                        </div>
                        <div class="col-4 text-center">
                            <img src="./img/error.svg" alt="Error" class="img-fluid">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return component;
  }

  static displayModalAlert(message) {
    const modalContainer = document.body;
    const modalId = `modal-${Date.now()}`;
    const existingModal = document.querySelector(".modal");
    
    if (existingModal) {
      existingModal.remove();
    }

    const modal = this.createModal(message, modalId);
    modalContainer.appendChild(modal);

    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }
}

export default ErrorHandler;