class InvalidEmailError extends Error {
    constructor(errorMsg) {
        super(errorMsg);
    }
}

class InvalidPasswdError extends Error {
    constructor(errorMsg) {
        super(errorMsg);
    }
}


const emailValidator = (input, msg) => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!regex.test(input)) throw new InvalidEmailError(msg);
}

const passwdValidator = (input, msg) => {
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if(!regex.test(input)) throw new InvalidPasswdError(msg);
}

module.exports = {emailValidator, passwdValidator, InvalidEmailError, InvalidPasswdError}