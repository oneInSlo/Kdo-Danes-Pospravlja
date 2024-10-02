import ErrorHandler from "./util/ErrorHandler.js";
import Request from "./service/Request.js";

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const loginForm = event.target;

    const formData = new FormData(loginForm);
    //const email = formData.get('email');
    const email_username = document.getElementById('email-username').value
    const password = formData.get('password');

    try {
        const response = await new Request(
            window.location.origin + "/login"
        )
            .method("POST")
            .content("json")
            .body(JSON.stringify({ email_username, password }))
            .send();

        if (response) {
            localStorage.setItem('token', response.token);
            window.location.replace('./enote');
        } 
        
    } catch (error) {
        ErrorHandler.handle(error.status, error.message);
    }
});

document.getElementById("switchRegistracija").addEventListener("click", () => {
    document.querySelector(".flip-card-inner").style.transform = "rotateY(180deg)";
});

document.getElementById("switchPrijava").addEventListener("click", () => {
    document.querySelector(".flip-card-inner").style.transform = "rotateY(0deg)";
});
