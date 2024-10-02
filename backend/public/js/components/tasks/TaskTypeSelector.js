class TaskTypeSelector {
  constructor() {
    this.parent = document.querySelector('body')
    this.close.bind(this)
  }

  onSelectOnetime(func) {
    this.handleSelectOneTime = func
  }

  onSelectRepeating(func) {
    this.handleSelectRepeating = func
  }

  show() {
    if (!this.hasOwnProperty('bsModal')) {
      this.bsModal = new bootstrap.Modal(this.component)
    }
    this.bsModal.show()
  }
  close() {
    this.bsModal.hide()
    this.component.remove()
  }

  render() {
    this.component = document.createElement('div')
    this.component.classList.add('modal', 'fade')
    this.component.setAttribute('tabindex', '-1')
    this.component.setAttribute('aria-hidden', 'true')

    this.component.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header bg-powder">
                  <h1 class="modal-title fs-5" >Dodajanje novega opravila</h1>
                  <button type="button" class="btn-close btnClose" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <p>
                    Katero opravilo želite dodati?
                  </p>
                  <div class="row">
                    <div class="col-xl-6">
                        <button class="button-80 bg-powder w-100 mt-2 btnOnetime" data-bs-toggle="modal" >Enkratno opravilo</button>
                    </div>
                    <div class="col-xl-6">
                        <button class="button-80 bg-powder w-100 mt-2 btnRepeating" data-bs-toggle="modal" >Ponavljajoče se opravilo</button>
                    </div>
                  </div>
                </div>
              </div>
    `

    this.component.querySelector('.btnClose').addEventListener('click', this.close)
    this.component.querySelector('.btnOnetime').addEventListener('click', this.handleSelectOneTime || (() => {}))
    this.component.querySelector('.btnRepeating').addEventListener('click', this.handleSelectRepeating || (() => {}))

    this.parent.appendChild(this.component)

    this.show();

  }

}

export default TaskTypeSelector