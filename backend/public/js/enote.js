import Unit from "./components/units/Unit.js";
import UnitEdit from "./components/units/UnitEdit.js";
import UnitService from "./service/UnitService.js";
import UnitModel from "./components/units/UnitModel.js";
import Request from "./service/Request.js";
import ErrorHandler from "./util/ErrorHandler.js";

import { updateMapWithUnits } from "./mapping.js";

const createUnitButton = document.getElementById('createUnitButton');
const unitsContainer = document.getElementById('unitsContainer');
const searchInput = document.getElementById('search-input');
const myUnitsList = document.getElementById('my-units-list');
const addedUnitsList = document.getElementById('added-units-list');
const logout = document.getElementById("logout");

let units = [];
let currentUser = null;

const fetchCurrentUser = async () => {

  const response = await new Request(
    window.location.origin + "/user/logged"
  )
    .method("GET")
    .send();
  
  return response;
};

const loadUnits = async () => {
  if (!currentUser) {
    currentUser = await fetchCurrentUser();
  }

  if (currentUser) {
    units = await UnitService.getUnits();
    renderUnits(units, currentUser.id_registriran_uporabnik);
    updateMapWithUnits(units);
    renderSidebarUnits(units, currentUser.id_registriran_uporabnik);
  }
};

const refreshUnits = async () => {
  await loadUnits();
}

const renderUnits = (units, currentUserId) => {
  unitsContainer.innerHTML = '';

  units.forEach(unitData => {
    const unitModel = new UnitModel().load(unitData);
    const unit = new Unit(unitsContainer, unitModel, units, refreshUnits, currentUserId);
    
    unit.onChange(updateMap);
    unit.render();
  });
};

const updateMap = () => {
  updateMapWithUnits(units);
};

const renderSidebarUnits = (units, currentUserId) => {
  const myUnits = units.filter(unit => unit.owner === currentUserId);
  const addedUnits = units.filter(unit => unit.owner !== currentUserId);

  myUnitsList.innerHTML = myUnits.map(unit => `
    <li>
        <button class="nav-link px-3 text-dark" onclick="openUnitSidebar(${unit.id})">
            <span class="me-2"><i class="bi bi-house"></i></span>
            <span>${unit.name}</span>
        </button>
    </li>
  `).join('');

  addedUnitsList.innerHTML = addedUnits.map(unit => `
    <li>
        <button class="nav-link px-3 text-dark" onclick="openUnitSidebar(${unit.id})">
            <span class="me-2"><i class="bi bi-house"></i></span>
            <span>${unit.name}</span>
        </button>
    </li>
  `).join('');
};

createUnitButton.addEventListener('click', async () => {
  try {
      const newUnitModel = new UnitModel();
      const unitEdit = new UnitEdit(newUnitModel, "CREATE");

      await new Promise((resolve, reject) => {
          unitEdit.submit("CREATE", async () => {
              const data = unitEdit.getFormData();

              var spacesContainer = document.getElementById('spaces-container');
              var spaceSpans = spacesContainer.querySelectorAll('span');
              var prostori = [];

              spaceSpans.forEach(span => {
                prostori.push(span.textContent.trim());
              });

              const naziv = data.name;
              const naslov = data.street;
              const mesto = data.city;
              const posta = data.postal_code;
              const drzava = data.country;
              const filesInput = document.getElementById('formFileMultiple');
              const files = filesInput.files;

              if (files.length === 0) {
                ErrorHandler.displayModalAlert(`Nobena slika ni bila izbrana za enoto ${naziv}`);
              }

              const formData = new FormData();

              for (let i = 0; i < files.length; i++) {
                  formData.append('images', files[i]);
              }

              try {
                const uploadResponse = await fetch('/units/images/upload', {
                  method: 'POST',
                  body: formData,
                  headers: {
                    'Authorization': `Bearer ${UnitService.getTokenFromLocalStorage()}`
                  }
                });

                if (!uploadResponse.ok) {
                  const errorText = await uploadResponse.text();
                  throw new Error(`Failed to upload images: ${errorText}`);
                }

                const uploadData = await uploadResponse.json();

                const newUnit = await UnitService.createUnit({
                    naziv: naziv,
                    naslov: naslov,
                    mesto: mesto,
                    posta: posta,
                    drzava: drzava,
                    prostori: prostori,
                    slike: uploadData.data
                });

                const newUnitModel = new UnitModel().load(newUnit);
                units.push(newUnitModel);
                
                const unit = new Unit(unitsContainer, newUnitModel);
                unit.render();

                updateMap();
                resolve();

              } catch (error) {
                reject(error);
              }
            });
      unitEdit.render();
    });
    await refreshUnits();
  } catch (error) {
    console.error('Error:', error);
  }
});

logout.addEventListener('click', async () => {

    const logout = await new Request(
      window.location.origin + "/logout"
    )
      .method("POST")
      .content("json")
      .body()
      .send();

    localStorage.removeItem("token");
    window.location.replace("/index");
});

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  
  const filteredUnits = units.filter(unit => 
    unit.name.toLowerCase().includes(query) ||
    unit.street.toLowerCase().includes(query) ||
    unit.city.toLowerCase().includes(query)
  );

  renderUnits(filteredUnits, currentUser.id_registriran_uporabnik);
  updateMapWithUnits(filteredUnits);
});

const displayNameOnPage = async () => {
  const nameDisplay = document.getElementById("nameDisplay");

  const name = await new Request(
    window.location.origin + "/user/logged"
  )
    .method("GET")
    .send();
  

  console.log(nameDisplay);
  
  if ((name.ime_priimek).includes(" "))
    nameDisplay.innerHTML = name.ime_priimek.split(" ").slice(0, -1).join(" ");
  else
    nameDisplay.innerHTML = name.ime_priimek;
  
}

document.addEventListener('DOMContentLoaded', () => {
  loadUnits();
  displayNameOnPage();
});



export { refreshUnits };
