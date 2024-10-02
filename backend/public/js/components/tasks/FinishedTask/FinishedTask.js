import FinishedTaskCard from './FinishedTaskCard.js';

class FinishedTask {
  constructor(cardParent, model) {
    this.parent = cardParent;
    this.model = model;

    this.card = new FinishedTaskCard(this.parent, this.model);
  }

  render() {
    this.card.render();
  }
}

export default FinishedTask