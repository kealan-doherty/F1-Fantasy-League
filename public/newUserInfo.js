function getUserData(event){
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
                                                                                              
    document.getElementById('createAccount').reset();
}

document.addEventListener('submit', getUserData);                                                                                                                                    