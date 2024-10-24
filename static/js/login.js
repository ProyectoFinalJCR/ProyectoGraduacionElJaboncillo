document.addEventListener("DOMContentLoaded", function (event) {

    // LOGIN
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        if (validate_inputs_login()) {

            const userEmail_login = document.getElementById("userEmail_login").value.trim()
            const userPassword_login = document.getElementById("userPassword_login").value.trim()


            fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: userEmail_login, password: userPassword_login })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        //redirige a l aURL proporcionada por el servidor app,py
                        window.location.href = data.redirect;
                    } else {
                        // mostrando alerta de error si el login falla
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message,
                            confirmButtonText: 'Entendido',
                            confirmButtonColor: '#158D46'
                        });
                    }
                })
                .catch(error => {
                    // console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ocurrió un problema al intentar iniciar sesión. Inténtalo más tarde.',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#158D46'
                    });
                
            });
        }
    });


    function validate_inputs_login() {
        const userEmail_login = document.getElementById("userEmail_login").value.trim()
        const userPassword_login = document.getElementById("userPassword_login").value.trim()

        // Expresión regular para validar un correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!userEmail_login) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El correo electrónico es requerido',
                confirmButtonText: 'Entendido'
            });
            return false;
        }
        // Validación del formato de correo electrónico
        if (!emailRegex.test(userEmail_login)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, introduce un correo electrónico válido',
                confirmButtonText: 'Entendido'
            });
            return false;
        }

        if (!userPassword_login) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La contraseña es requerida',
                confirmButtonText: 'Entendido'
            });
            return false;
        }
        return true;
    };

    //Visibilidad de la password
        // Obtener los elementos
        const passwordInput = document.getElementById('userPassword_login');
        const PasswordEyeOn = document.getElementById('eye');
        const PasswordEyeOnOff = document.getElementById('noneye');
    
        // Función para alternar la visibilidad de la contraseña
        PasswordEyeOn.addEventListener('click', function() {
            // Cambiar el tipo de input entre 'password' y 'text'
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                PasswordEyeOn.style.display = 'none';  // Ocultar icono de ojo abierto
                PasswordEyeOnOff.style.display = 'inline';  // Mostrar icono de ojo cerrado
            }
        });
    
        PasswordEyeOnOff.addEventListener('click', function() {
            // Cambiar el tipo de input entre 'text' y 'password'
            if (passwordInput.type === 'text') {
                passwordInput.type = 'password';
                PasswordEyeOnOff.style.display = 'none';  // Ocultar icono de ojo cerrado
                PasswordEyeOn.style.display = 'inline';  // Mostrar icono de ojo abierto
            }
        });
});


