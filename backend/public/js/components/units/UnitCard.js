import LocalData from "../../service/LocalData.js";
import RightsCard from "./RightsCard.js";

class UnitCard {

    constructor(parent, model, currentUser) {
        this.parent = parent;
        this.model = model;
        this.currentUser = currentUser;
        this.handleEditClick = () => {};
        this.handleDeleteClick = () => {};
    }


    dataChanged() {
        this.render();
    }

    onEditClick(func) {
        this.handleEditClick = func;
    }

    onDeleteClick(func) {
        this.handleDeleteClick = func;
    }

    render() {
        if (this.component == null) {
            this.component = document.createElement("div");
            this.component.className = "col-md-4";
        }

        const { id, name, street, postal_code, city, country, pictures, roommates, owner } = this.model;

        const isMyUnit = owner === this.currentUser;

        let carouselItems = (pictures || []).map((picture, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${picture}" class="d-block w-100 img-fluid" alt="Image" style="height: 200px; object-fit: cover;">
            </div>
        `).join('');

        let avatars = (roommates || []).map((roommate, index) => `
            <div>
                <div class="avatar btnEditRights" data-bs-toggle="tooltip" title="${roommate.name}" data-index="${index}" style="cursor: pointer;">
                    <img src="${roommate.avatar}" alt="Avatar" class="img-fluid">
                </div>
            </div>
        `).join('');

        this.component.innerHTML = `
            <div class="container-fluid rounded p-2">
                <div class="card" id="${id}">
                    <div id="carousel-${id}" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-inner">
                            ${carouselItems}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${id}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#carousel-${id}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center justify-content-center">
                            <h5 class="card-title mb-0 openUnit" style="cursor: pointer;">
                                ${name}
                            </h5>
                            ${isMyUnit ? '<span class="bg-bright-pink text-danger rounded px-2 smaller fw-bold text-uppercase text-center">Moja enota</span>' : ''}
                        </div>
                        <p class="card-text mb-0">
                            ${street}
                        </p>
                        <p class="card-text mt-0">
                            ${postal_code} ${city}, ${country}
                        </p>
                        <hr>
                        <div class="d-flex justify-content-end flex-wrap">
                            ${avatars}
                            <div class="avatar btnAddRights" data-bs-toggle="tooltip" title="Dodaj novo osebo" style="cursor: pointer;" >
                                <lord-icon
                                    src="https://cdn.lordicon.com/zrkkrrpl.json"
                                    trigger="hover"
                                    state="hover-swirl"
                                    colors="primary:#bebebe,secondary:#bebebe"
                                    style="width:50px;height:50px">
                                </lord-icon>
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-xl-6">
                                <button class="button-80 button-80-powder w-100 mt-2 btnEdit">Uredi bivalno enoto</button>
                            </div>
                            <div class="col-xl-6">
                                <button class="button-80 button-80-bright-pink w-100 mt-2 btnDelete">Izbriši bivalno enoto</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;

    this.component
        .querySelector(".btnEdit")
        .addEventListener("click", this.handleEditClick);

    this.component
        .querySelector(".btnDelete")
        .addEventListener("click", this.handleDeleteClick);
    
    this.component
        .querySelector(".openUnit")
        .addEventListener("click", () => {
            LocalData.setSelectedUnit(this.model.id);
            window.location.replace('./opravila');
        });

    this.component
        .querySelector(".btnAddRights")
        .addEventListener("click", () => {            
            const rightsCard = new RightsCard(this.model, "CREATE", this.model.roommates, this.currentUser);
            rightsCard.render();
        });

    this.component
        .querySelectorAll(".btnEditRights")
        .forEach((element) => {
            element.addEventListener("click", (e) => {
                const index = e.currentTarget.getAttribute("data-index");
                const roommate = this.model.roommates[index];
                const rightsCard = new RightsCard(this.model, "SAVE", roommate, this.currentUser);
                rightsCard.render();
            });
        });

    this.parent.append(this.component); 

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    }
}

export default UnitCard;
