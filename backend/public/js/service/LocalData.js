class LocalData {
  static getSelectedUnit() {
    return this.get("selectedUnit");
  }

  static setSelectedUnit(unitID) {
    this.set("selectedUnit", unitID);
  }

  static getToken() {
    return localStorage.getItem("token") || "null";
  }

  static setToken(token) {
    this.set("token", token);
  }

  static getLoggedInUser() {
    return this.get("loggedUser");
  }

  static setLoggedInUser(user) {
    this.set("loggedUser", user);
  }

  static get(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export default LocalData;
