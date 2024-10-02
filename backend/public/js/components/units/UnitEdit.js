class UnitEdit {

    constructor(model, submitType = "SAVE") {
        this.parent = document.querySelector("body");
        this.model = model;
        this.submitType = submitType;
        this.deletedSpaces = [];
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
        if (!this.modalController) {
            this.modalController = new bootstrap.Modal(this.component);
        }
        this.modalController.show();
    }

    getFormData() {
        let data = {};
        const formData = new FormData(this.component.querySelector("form"));

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        data.spaces = this.model.spaces;
        data.deletedSpaces = this.deletedSpaces;

        return data;
    }

    renderSpaces() {
        const spacesContainer = this.component.querySelector("#spaces-container");
        const { spaces } = this.model;

        let spacesElements = (spaces || []).map((space, index) => `
            <span class="bg-pinkie p-2 rounded me-2 d-inline-block m-1 mt-3">
                ${space}
                <button type="button" class="btn btn-close btn-close-small ms-2" data-index="${index}" data-type="space"></button>
            </span>
        `).join('');

        spacesContainer.innerHTML = spacesElements;

        spacesContainer
            .querySelectorAll(".btn-close")
            .forEach(button => {
                button.addEventListener("click", (e) => {
                    const index = parseInt(e.target.dataset.index, 10);
                    const deletedSpace = this.model.spaces.splice(index, 1);
                    
                    this.deletedSpaces.push(deletedSpace[0]);
                    this.renderSpaces();
                });
            });
    }
    
    render() {

        if (!this.component) {
            this.component = document.createElement("div");
            this.component.classList.add("modal", "fade");
            this.component.setAttribute("tabindex", "-1");
            this.component.setAttribute("aria-labelledby", "bivalnaEnotaModal");
            this.component.setAttribute("aria-hidden", "true");
        }
        
        const isEditMode = this.submitType === "SAVE";

        const { name, street, city, postal_code, country } = this.model;

        this.component.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <form>
                    <div class="modal-header bg-powder">
                        <h1 class="modal-title fs-4" id="bivalnaEnotaModal">
                            ${
                                isEditMode 
                                ? name 
                                : "Nova bivalna enota"}
                        </h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                        <label for="name" class="form-label">Naziv bivalne enote</label>
                            <input type="text" class="form-control" name="name" placeholder="Naziv" id="name" value="${
                                name || ''
                            }" required>
                        </div>
                        <div class="mb-3">
                        <label for="location" class="form-label">Lokacija bivalne enote</label>
                            <input type="text" class="form-control" name="street" placeholder="Naslov" id="location" value="${
                                street || ''
                            }" required>
                        </div>
                        <div class="row d-flex justify-content-between px-2">
                        <div class="col-md-6 mb-3">
                            <input type="text" class="form-control" name="city" placeholder="Mesto" id="place" value="${
                                city || ''
                            }" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <input type="text" class="form-control" name="postal_code" placeholder="Pošta" id="postal" value="${
                                postal_code || ''
                            }" required>
                        </div>
                        </div>
                        <div class="mb-3">
                            <input type="text" class="form-control" name="country" placeholder="Država" id="country" value="${
                                country || ''
                            }" required>
                        </div>
                        <hr>
                        <div class="mb-3">
                            <p class="card-text mb-0"> Dodajte prostore:
                                <div class="input-group mt-2">
                                    <span class="input-group-text">
                                        <lord-icon src="https://cdn.lordicon.com/unukghxb.json" trigger="hover" colors="primary:#121331,secondary:#000" style="width:20px;height:20px"></lord-icon>
                                    </span>
                                    <input type="text" class="form-control" id="search-spaces" aria-describedby="basic-addon3 basic-addon4">
                                </div>
                                <span id="spaces-container" class="d-inline"></span>
                            </p>
                        </div>
                        ${
                            !isEditMode 
                            ? `
                                <hr>
                                <div>
                                <label for="formFileMultiple" class="form-label">Dodajte slike</label>
                                <input class="form-control" type="file" id="formFileMultiple" multiple>
                                </div>` 
                            : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="button-80 button-80-powder btnSave">${isEditMode ? "Shrani spremembe" : "Ustvari enoto"}</button>
                        <button type="button" class="button-80 button-80-bright-pink btnClose">Zapri</button>
                    </div>
                    </form>
                </div>
            </div>
        `;

        this.component
            .querySelector("form")
            .addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleSaveClick();
                this.close();
            });

        this.component
            .querySelector(".btnClose")
            .addEventListener("click", () => {
                this.close();
            });

        this.component
            .querySelector("#search-spaces")
            .addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    
                    const spaceInput = e.target;
                    const newSpace = spaceInput.value.trim();
                    
                    if (newSpace) {
                        this.model.spaces.push(newSpace);
                        spaceInput.value = ""; 
                        this.renderSpaces();
                    }
                }
            });

        this.parent.appendChild(this.component);

        this.show();
        this.renderSpaces();
    }
}

export default UnitEdit;