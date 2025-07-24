// this script will take the info enter by the user to prepare it for hashing and to confirm the username and password is correct in the db

function logIn(event){
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    document.getElementById('signIn').reset

}

document.addEventListener('submit', logIn);