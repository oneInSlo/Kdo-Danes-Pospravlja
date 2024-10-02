import ErrorHandler from "./util/ErrorHandler.js";

var map = L.map('map').setView([46.15386, 14.98614], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function updateMapWithUnits(units) {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    let addresses = units.map(unit => `${unit.street} ${unit.city}`);
    let addressString = addresses.join(',');

    fetch(`/api/search?addresses=${encodeURIComponent(addressString)}`)
        .then(async response => {
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.msg);
            }
            return response.json();
        })
        .then(coordinates => {
            if (!Array.isArray(coordinates)) {
                ErrorHandler.displayModalAlert('Neveljavna oblika odgovora.');
            }

            const latLngs = [];
            const notFound = [];

            coordinates.forEach(coord => {
                if (coord.found) {
                    latLngs.push([coord.lat, coord.lon]);

                    const unit = units.find(unit => `${unit.street} ${unit.city}` === coord.address);
                    L.marker([coord.lat, coord.lon]).addTo(map)
                        .bindPopup(`<div class="custom-popup"><h5 class="my-2">${unit.name}</h5><img src="${unit.pictures[0]}" alt="Image"><p class="my-2">${unit.street}, ${unit.city}</p></div>`);
                } else {
                    notFound.push(coord.address);
                }
            });

            if (latLngs.length > 0) {
                const bounds = L.latLngBounds(latLngs);
                map.fitBounds(bounds);
            }

            if (notFound.length > 0) {
                ErrorHandler.displayAlert(`Naslovi, ki niso bili najdeni: ${notFound.join(', ')}`);
            }
            
        })
        .catch(error => {
            ErrorHandler.displayAlert(error.message);
            console.error(error);
        });
}

export { updateMapWithUnits };