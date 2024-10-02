import ErrorHandler from "./util/ErrorHandler.js";
import Request from "./service/Request.js";

let ime_priimek;
let datum_rojstva;
let username;
let geslo;
let email;
let avatar_naziv;

const form = document.getElementById('registrationForm');
const nadaljujBtn = document.getElementById('nadaljuj-btn');
nadaljujBtn.removeAttribute('data-bs-slide');

document.addEventListener("DOMContentLoaded", () => {
    
    nadaljujBtn.addEventListener('click', function(event) {
        event.preventDefault();

        const passwordRegister = document.getElementById('passwordRegister');
        const passwordRegisterAgain = document.getElementById('passwordRegisterAgain');
        
        if (passwordRegister.value !== passwordRegisterAgain.value) {
            ErrorHandler.displayAlert("Gesli se ne ujemata.");
        }

        ime_priimek = document.getElementById('nameSurnameRegister').value;
        datum_rojstva = document.getElementById('dateOfBirth').value;
        username = document.getElementById('usernameRegister').value;
        geslo = document.getElementById('passwordRegister').value;
        email = document.getElementById('emailRegister').value;

        if (!form.checkValidity()) {
            ErrorHandler.displayAlert("Imate napako v vnosnih poljih.");
            nadaljujBtn.removeAttribute('data-bs-slide');
        } else {
            nadaljujBtn.setAttribute('data-bs-slide', 'next');
        }
    });

    document.querySelectorAll('.btn-check').forEach(function(btn) {
        btn.addEventListener('change', function() {
            if (this.checked) {
                avatar_naziv = this.id;
            }
        });
    });

    document.getElementById('register-btn').addEventListener('click', async function(event) {
        event.preventDefault();

        try {
            const register = await new Request(
                window.location.origin + "/users"
            )
                .method("POST")
                .content("json")
                .body(JSON.stringify({ ime_priimek, datum_rojstva, username, geslo, email, avatar_naziv }))
                .send();

            if (register) {
                console.log(register.msg);

                const loginResponse = await new Request(
                    window.location.origin + "/login"
                )
                    .method("POST")
                    .content("json")
                    .body(JSON.stringify({ email_username: username, password: geslo }))
                    .send();

                if (loginResponse) {
                    localStorage.setItem('token', loginResponse.token);
                    window.location.replace('./enote');
                }
            } else {
                ErrorHandler.displayModalAlert('Registracija ni bila uspešna.');
            }
        } catch (error) {
            ErrorHandler.displayModalAlert('Med registracijo je prišlo do napake. Prosimo poskusite kasneje.');
        }
    });

    form.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            nadaljujBtn.click();
        }
    });
});
