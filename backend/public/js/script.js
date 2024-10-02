// Show Names on Avatars

document.addEventListener('DOMContentLoaded', () => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});


// Hide / Show Password

document.querySelectorAll('.eye-icon').forEach((eyeIcon) => {

        eyeIcon.addEventListener('click', () => {

        const input = eyeIcon.closest('.form-floating').querySelector('input');

        if (eyeIcon.classList.contains('bi-eye')) {
            eyeIcon.classList.remove('bi-eye');
            eyeIcon.classList.add('bi-eye-slash');
            input.type = 'text';
        } 
        else {
            eyeIcon.classList.remove('bi-eye-slash');
            eyeIcon.classList.add('bi-eye');
            input.type = 'password';
        }
    });
});


// Check Password Strength

const pass = document.getElementById('passwordRegister');
const wrap = document.getElementById('progress-bar-around');
const progress = document.getElementById('progress-bar');
const progressWidth = document.getElementById('progress-width');

if (pass) {
    
    pass.oninput = () => {
        let strength = 0;
        let value = pass.value;
        let widthProgressBar = [ '0%', '25%', '50%', '75%', '100%' ];
        let colorPower =  [ '#e44242', '#e44242', '#f99f4a', '#1493ff', '#36c565' ]; 
        let regexCheck = [ /[0-9]/, /[a-z]/, /[A-Z]/, /[^\s0-9a-zA-Z]/ ]; 
    
        if (value.length >= 8) { 
            regexCheck.forEach((regex) => { 
                if (regex.test(value)) { 
                    strength++; 
                } 
            }); 
        }
        
        progressWidth.style.width = widthProgressBar[strength]; 
        progressWidth.style.backgroundColor = colorPower[strength];
        
        switch(strength) {
            case 1:
                progressWidth.innerHTML = 'Slabo';
                break;
            case 2:
                progressWidth.innerHTML = 'V redu';
                break;
            case 3:
                progressWidth.innerHTML = 'Dobro';
                break;
            case 4:
                progressWidth.innerHTML = 'Odlično';
                break;
            default:
                progressWidth.innerHTML = '';        
        }
    };
}


// Suggest Usernames

const nameSurname = document.getElementById('nameSurnameRegister');
const dob = document.getElementById('dateOfBirth');
const suggestionsContainer = document.getElementById('suggestions');

if (nameSurname && dob) {
    nameSurname.onchange = updateSuggestions;
    dob.onchange = updateSuggestions;
    
    function updateSuggestions() {
        const nameSurnameValue = nameSurname.value;
        const dobValue = dob.value;
    
        if (nameSurnameValue && dobValue) {
    
            const nameSurnameSuggest = replaceSpec(nameSurnameValue.toLowerCase().replace(/\s+/g, '.'));
    
            const dateArray = dobValue.split('-');
            const day = dateArray[2];
            const month = dateArray[1];
            const year = dateArray[0];
    
            const suggestions = [
                `${nameSurnameSuggest}.${day}`,
                `${nameSurnameSuggest}.${month}`,
                `${nameSurnameSuggest}.${year}`,
                `${nameSurnameSuggest}.${day}${month}`,
                `${nameSurnameSuggest}.${month}${day}`
            ];
    
            createSuggestions(suggestions);
        }
    }
    
    function replaceSpec(str) {
        const replacements = {
            'č': 'c',
            'ć': 'c',
            'đ': 'd',
            'š': 's',
            'ž': 'z',
            'Č': 'C',
            'Ć': 'C',
            'Đ': 'D',
            'Š': 'S',
            'Ž': 'Z'
        };
    
        return str.replace(/[čćđšžČĆĐŠŽ]/g, function(char) {
            return replacements[char];
        });
    }
    
    function createSuggestions(suggestionsArray) {
    
        suggestionsContainer.innerHTML = '';
    
        suggestionsArray.forEach(suggestion => {
    
            const span = document.createElement('span');
    
            span.className = 'suggestion p-2 bg-light rounded';
            span.textContent = suggestion;
    
            suggestionsContainer.appendChild(span);
            suggestionsContainer.classList.add('mt-2');
    
            span.onclick = () => {
                document.getElementById('usernameRegister').value = suggestion;
                suggestionsContainer.style.display = 'none';
            }
        });
    }
}


// Set Input Min Date to Today

document.addEventListener('DOMContentLoaded', () => {

    const startDateInputs = document.getElementsByClassName('setMinDate');
    
    if (startDateInputs) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${year}-${month}-${day}`;

        for (let i = 0; i < startDateInputs.length; i++) {
            startDateInputs[i].min = todayFormatted;
        }
    }
});


// Show Users on Dropdown (Rights Card)

document.addEventListener('DOMContentLoaded', () => {
    const handleDropdownItemClick = (dropdownButtonClass, dropdownMenuClass) => {
        const dropdownMenus = document.querySelectorAll(dropdownMenuClass);

        dropdownMenus.forEach(menu => {
            const items = menu.querySelectorAll('.dropdown-item');
            items.forEach(item => {
                item.addEventListener('click', (e) => {
                    const button = menu.previousElementSibling;
                    if (button && button.classList.contains(dropdownButtonClass.substring(1))) {
                        button.textContent = e.target.textContent;
                    }
                });
            });
        });
    };

    handleDropdownItemClick('.osebe-dropdown', '.osebe-dropdown-menu');
    handleDropdownItemClick('.pravice-dropdown', '.pravice-dropdown-menu');
});


// Redirect to Tasks

const openUnitSidebar = (unitID) => {
    localStorage.setItem("selectedUnit", unitID);
    window.location.replace('./opravila');
}