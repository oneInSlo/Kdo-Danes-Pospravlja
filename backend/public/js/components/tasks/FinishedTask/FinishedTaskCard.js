class FinishedTaskCard {
  constructor(cardParent, model) {
    this.parent = cardParent;
    this.model = model;
  }

  render() {
    if (!this.hasOwnProperty("component")) {
      this.component = document.createElement("div");
      this.component.classList = "card border-secondary-subtle m-2";
    }

    this.component.innerHTML = `
                <div class="card-header bg-light-gray"></div>
                  <div class="card-body text-dark">
                    <h3 class="card-title">${this.model.title}</h3>
                    <hr />
                    <p class="card-text mb-0">
                      Prostor: <span class="fw-bold">${this.model.location}</span>
                    </p>
                    <p class="card-text mb-0">
                      Trajanje: <span class="fw-bold">${this.model.duration} min</span>
                    </p>
                  </div>
    `

    this.parent.prepend(this.component);
  }
}


export default FinishedTaskCard