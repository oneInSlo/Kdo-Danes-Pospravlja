import { refreshUnits } from "../../enote.js";
import UnitService from "../../service/UnitService.js";
import ErrorHandler from "../../util/ErrorHandler.js";

class RightsCard {

    constructor(model, submitType = "SAVE", roommate, currentUser) {
        this.parent = document.querySelector("body");
        this.model = model;
        this.submitType = submitType;
        this.roommate = roommate;
        this.currentUser = currentUser;
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

    render() {
        if (!this.component) {
            this.component = document.createElement("div");
            this.component.classList.add("modal", "fade");
            this.component.setAttribute("tabindex", "-1");
            this.component.setAttribute("aria-labelledby", "dodajNovegaUporabnikaLabel");
            this.component.setAttribute("aria-hidden", "true");
        }
        
        const isEditMode = this.submitType === "SAVE";

        const { id } = this.model;
        
        const ownerRights = this.currentUser === this.roommate.id;

        if (ownerRights) {
            ErrorHandler.displayModalAlert("Svojih pravic ne morete spremeniti!");
        } else if (!ownerRights || isEditMode){
            this.component.innerHTML = `
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <form>
                            <div class="modal-header bg-powder">
                                <h1 class="modal-title fs-4" id="dodajNovegaUporabnikaLabel">
                                ${
                                    isEditMode
                                    ? this.roommate.username
                                    : "Dodaj novega uporabnika"
                                }
                                </h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            ${!isEditMode
                            ? `
                            <div class="m-3">
                                <p class="card-text mb-0">
                                    <div class="input-group mt-2">
                                        <span class="input-group-text">
                                            <lord-icon src="https://cdn.lordicon.com/unukghxb.json" trigger="hover" colors="primary:#121331,secondary:#000" style="width:20px;height:20px"></lord-icon>
                                        </span>
                                        <input type="text" class="form-control" id="search-users" aria-describedby="basic-addon3 basic-addon4" placeholder="Vpiši uporabniško ime sostanovalca">
                                    </div>
                                    <span id="roommates-container" class="d-inline"></span>
                                </p>
                            </div> 
                            
                            <div class="m-3">
                                <span class="d-inline h-100">
                                    <span>Dodana oseba: </span>
                                    <span class="bg-powder p-2 rounded me-2 d-inline-block m-1 mt-3">
                                        <span id="roommate-${id}">Nobena oseba še ni bila dodana</span>
                                    </span>
                                </span>
                            </div>
                            ` : ''}
    
                            <div class="btn-group m-3 d-flex align-items-center" role="group" aria-label="Radio toggle button group">
                                <input type="radio" class="btn-check btnRadioChange form-control" name="btnradio-${id}" id="delne-pravice-${id}" autocomplete="off" ${isEditMode && this.roommate.right === 'delne' ? 'checked' : ''} required>
                                <label class="btn btn-outline-primary" for="delne-pravice-${id}">Delne pravice</label>
    
                                <input type="radio" class="btn-check btnRadioChange form-control" name="btnradio-${id}" id="popolne-pravice-${id}" autocomplete="off" ${isEditMode && this.roommate.right === 'popolne' ? 'checked' : ''} required>
                                <label class="btn btn-outline-primary" for="popolne-pravice-${id}">Popolne pravice</label>
                            </div>
    
                            ${isEditMode  
                            ?
                                `
                                <hr class="mx-4">
                                <div class="mx-4 my-3">
                                    <button type="button" class="button-80 button-80-bright-pink w-100 btnDeleteUser">Odstrani uporabnika iz enote</button>
                                </div>`
                            : ""
                            }
    
                            <div class="modal-footer">
                                <button type="submit" class="button-80 button-80-powder btnSave">
                                ${isEditMode  
                                ? "Shrani spremembe"
                                : "Dodaj uporabnika"
                                }
                                </button>
                                <button type="button" class="button-80 button-80-bright-pink btnClose">Zapri</button>
                            </div>
                        </form> 
                    </div>
                </div>
            `;
        }

        this.component
            .querySelector(".btnClose")
            .addEventListener("click", () => {
                this.close();
            });

        if (!ownerRights) {
            this.component
                .querySelector(".btnSave")
                .addEventListener("click", async (e) => {
                    e.preventDefault();
                
                    let selectedRight = null;

                    if (document.getElementById(`delne-pravice-${id}`).checked) {
                        selectedRight = "delne";
                    } else if (document.getElementById(`popolne-pravice-${id}`).checked) {
                        selectedRight = "popolne";
                    }
        
                    if (selectedRight != null) {
                        if (isEditMode) {
                            try {
                                await UnitService.changeUserRight(this.model.id, this.roommate.username, selectedRight);
                                await this.refreshUnitData();
                                this.close();
                            } catch (error) {
                                console.error("Napaka pri spreminjanju pravice: ", error);
                            }
                        } else {
                            try {
                                await UnitService.addUser(id, document.getElementById(`roommate-${id}`).textContent, selectedRight);
                                await this.refreshUnitData();
                                this.close();
                            } catch (error) {
                                console.error("Napaka pri dodajanju uporabnika: ", error);
                            }
                        }
                    } else {
                        ErrorHandler.displayAlert("Izberite pravico!");
                    }
                });
                
            if (isEditMode) {
                this.component
                    .querySelector(".btnDeleteUser")
                    .addEventListener("click", async (e) => {
                        e.preventDefault();

                        await UnitService.deleteUser(`${id}`, this.roommate.username);
                        await this.refreshUnitData();
                        this.close();
                    });
            }

            if (!isEditMode) {
                this.component
                    .querySelector("#search-users")
                    .addEventListener("keydown", async (e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();    
                                            
                            const roommateInput = e.target;
                            const newRoommate = roommateInput.value.trim();
                            const roommateShow = document.getElementById(`roommate-${id}`);
                        
                            try {
                                const user = await UnitService.getUser(newRoommate);
                                roommateShow.innerHTML = user.username;
                                roommateInput.innerHTML = '';
                            } catch (error) {
                                console.error("Napaka pri pridobitvi uporabnika: ", error);
                            }
                        }
                    });
            }
        }

        this.parent.appendChild(this.component);
        this.show();
    }

    async refreshUnitData() {
        try {
            const updatedUnit = await UnitService.getUnitByID(this.model.id);
            this.model.load(updatedUnit);
            await refreshUnits();
        } catch (error) {
            console.error("Napaka pri refreshu ", error);
        }
    }
}

export default RightsCard;
