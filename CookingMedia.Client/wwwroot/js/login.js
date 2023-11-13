function registerLoginValidation() {
    registerValidation('#loginForm', {
        "email": {
            required: true
        },
        "password": {
            required: true
        }
    }, onLogin)
}

function onLogin(form) {
    console.log($(form).serialize())
    $.ajax({
        url: `${HOST}/api/auth/login`,
        type: "post",
        data: $(form).serialize(),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: (response) => {
            localStorage.setItem("jwtToken", response["token"])
            localStorage.setItem("role", response["user"]["role"])
            // TODO: redirect to dashboard
        },
        error: () => {
            $("error").html("Wrong email or password");
        }
    })
}