import Request from "./Request.js";

class UnitService {

  static unitMap = {
    id_bivalna_enota: "id",
    naziv: "name",
    cesta: "street",
    mesto: "city",
    postna_stevilka: "postal_code",
    drzava: "country",
    slike: "pictures",
    sostanovalci: "roommates",
    prostori: "spaces",
    TK_registriran_uporabnik: "owner"
  };

  static remap(unit) {
    const [street, city, postal_code, country] = unit.naslov.split(', ');

    return {
      id: unit.id_bivalna_enota,
      name: unit.naziv,
      street: street,
      city: city,
      postal_code: postal_code,
      country: country,
      pictures: unit.slike,
      roommates: unit.sostanovalci,
      spaces: unit.prostori,
      owner: unit.TK_registriran_uporabnik
    }
  } 

  static getTokenFromLocalStorage() {
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    }
    console.log("Token ni bil najden.");
    return '';
  }
  
  static async getUnits() {

    const units = await new Request(
      window.location.origin + "/units"
    ) 
      .method("GET")
      .send();

    return units.map(unit => this.remap(unit, this.unitMap));
  }

  static async getUnitByID(unitID) { 
    const token = this.getTokenFromLocalStorage();
    if (!token) {
      throw new Error('Token ni bil najden');
    }

    const response = await fetch(`/units/${unitID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const units = await new Request(
      window.location.origin + "/units/" + unitID
    ) 
      .method("GET")
      .send();

    return this.remap(units, this.unitMap);
  }

  static async createUnit(unitData) {

    const units = await new Request(
      window.location.origin + "/units" 
    ) 
      .method("POST")
      .content("json")
      .body(JSON.stringify(unitData))
      .send(); 

    return units.data;
  }

  static async updateUnit(unitID, unitData) {

    const units = await new Request(
      window.location.origin + "/units/" + unitID
    ) 
      .method("PUT")
      .content("json")
      .body(JSON.stringify({
        naziv: unitData.name,
        naslov: unitData.street,
        mesto: unitData.city,
        posta: unitData.postal_code,
        drzava: unitData.country,
        prostori: unitData.spaces,
        deleteProstori: unitData.deletedSpaces
      }))
      .send(); 

    return units;
  }

  static async deleteUnit(unitID) {

    const units = await new Request(
      window.location.origin + "/units/" + unitID
    ) 
      .method("DELETE")
      .send();

    return units;
  }

  static async getUser(username) {

    const users = await new Request(
      window.location.origin + "/users/?username=" + username
    ) 
      .method("GET")
      .send();

    return users;
  }

  static async addUser(unitID, username, right) {

    const users = await new Request(
      window.location.origin + "/units/" + unitID + "/users/" + username
    ) 
      .method("POST")
      .content("json")
      .body(JSON.stringify({ pravice: right }))
      .send();

    return users;
  }

  static async changeUserRight(unit_id, username, right) {

    const users = await new Request(
      window.location.origin + "/users/rights?username=" + username
    ) 
      .method("PATCH")
      .content("json")
      .body(JSON.stringify({ right, unit_id }))
      .send();

    return users;
  }

  static async deleteUser(unitID, username) {

    const users = await new Request(
      window.location.origin + "/units/" + unitID + "/users/" + username
    ) 
      .method("DELETE")
      .send();

    return users;

  }
  
  static async getCurrentUser() {

    const users = await new Request(
      window.location.origin + "/user/logged"
    ) 
      .method("GET")
      .send();

    return users;
  }
}

export default UnitService;
