class UnitModel {
  
  constructor() {
    this.id = null;
    this.name = "";
    this.street = "";
    this.city = "";
    this.postal_code = 0;
    this.country = "";
    this.pictures = [];
    this.roommates = [];
    this.spaces = [];
    this.owner = 0;
  }

  load(data) {
    Object.keys(data).forEach((key) => {
      if (this.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    });

    return this;
  }
}

export default UnitModel;