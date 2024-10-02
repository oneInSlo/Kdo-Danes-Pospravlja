class UnitDelete {

    constructor(model) {
        this.parent = document.querySelector("body");
        this.model = model;
    }

    submit(func) {
        this.handleSaveClick = func;
    }

    close() {
        this.modalController.hide();
        this.component.remove();
    }

    show() {
        if (!this.modalController) {
            this.modalController = new bootstrap.Modal(this.component);
        }
        this.modalController.show();
    }

    render() {

        if (!this.component) {
            this.component = document.createElement("div");
            this.component.classList.add("modal", "fade");
            this.component.setAttribute("tabindex", "-1");
            this.component.setAttribute("aria-labelledby", "izbrisienotoLabel");
            this.component.setAttribute("aria-hidden", "true");
        }
        
        this.component.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-bright-pink">
                        <h1 class="modal-title fs-5" id="izbrisienotoLabel">Brisanje bivalne enote</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>
                        Ali ste prepričani, da želite izbrisati bivalno enoto?
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="button-80 button-80-powder btnConfirm">Potrdi</button>
                        <button type="button" class="button-80 button-80-bright-pink btnCancel">Prekliči</button>
                    </div>
                </div>
            </div>
        `;

        this.component
            .querySelector(".btnCancel")
            .addEventListener("click", () => {
                this.close();
            });

        this.component
            .querySelector(".btnConfirm")
            .addEventListener("click", this.handleSaveClick);
        
        this.parent.appendChild(this.component);

        this.show();
    }
}

export default UnitDelete;