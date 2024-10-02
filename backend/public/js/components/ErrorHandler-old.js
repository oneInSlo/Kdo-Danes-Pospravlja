class ErrorHandler {
  handle(status, message) {
    
  }

  static displayErrorAlert(message) {

    if (!this.component) {
      this.component = document.createElement("div");
      this.component.classList.add("alert", "alert-danger", "text-center", "alert-edit", "alert-dismissible", "fade", "show", "px-5");
      this.component.setAttribute("role", "alert");
      this.component.setAttribute("id", "alertDiv");
    }

    this.component.innerHTML = `
    
    <div class="alert alert-danger text-center alert-edit alert-dismissible fade show px-5" role="alert" id="alertDiv">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
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
    </div>
    `;
  }

}

export default ErrorHandler