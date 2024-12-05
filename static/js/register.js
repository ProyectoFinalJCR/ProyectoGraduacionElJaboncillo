
document.addEventListener("DOMContentLoaded", function (event) {
    // REGISTER
    // alertas si un input esta vacio

    document.getElementById("registerForm").addEventListener("submit", function (event) {
        // Evitar que el formulario se envíe automáticamente
        event.preventDefault();

        if (validate_inputs()) {
            // Si las validaciones son correctas, mostrar mensaje de éxito y NO recargar
            document.getElementById("registerForm").addEventListener("submit", function (event) {
                // Evitar que el formulario se envíe automáticamente
                event.preventDefault();
        
                if (validate_inputs()) {
                    // Si las validaciones son correctas, mostrar mensaje de éxito y NO recargar
                    Swal.fire({
                        icon: 'success',
                        title: 'Creación de cuenta exitosa',
                        text: '¡Tu cuenta ha sido creada, disfruta de nuestro catálogo!',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        // Puedes enviar los datos aquí manualmente, sin recargar la página
                        // Si necesitas enviar el formulario, usa fetch o AJAX
                        // Por ejemplo:
                        // document.getElementById("registerForm").submit(); (solo si realmente quieres enviarlo)
                        document.getElementById("registerForm").submit();
                    });
                }
            });
        }
    });

     // validar contraseña length
  document.getElementById("password").addEventListener("input", function () {
    const clave = this.value;

    // Expresión regular para validar caracteres especiales y longitud mínima
    const regex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

    if (clave.length < 8) {
      this.setCustomValidity("La contraseña debe tener al menos 8 caracteres.");
      this.reportValidity();
    } else if (!regex.test(clave)) {
      this.setCustomValidity("La contraseña debe contener al menos un carácter especial.");
      this.reportValidity();
    } else {
      this.setCustomValidity(""); // Limpia el mensaje de validación
      this.reportValidity();
    }
  });

    // funcion donde se validan los campos
    function validate_inputs() {
        const userName_input = document.getElementById("userName").value.trim();
        const userEmail_input = document.getElementById("email").value.trim();
        const userPassword_input = document.getElementById("password").value.trim();
        const confirmPassword_input = document.getElementById("confirm_password").value.trim();

        // Expresión regular para validar un correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Validaciones de campos vacíos
        if (!userName_input) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El nombre de usuario es requerido',
                confirmButtonText: 'Entendido'
            });
            return false;
        }

        if (!userEmail_input) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El correo electrónico es requerido',
                confirmButtonText: 'Entendido'
            });
            return false;
        }
        // Validación del formato de correo electrónico
        if (!emailRegex.test(userEmail_input)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, introduce un correo electrónico válido',
                confirmButtonText: 'Entendido'
            });
            return false;
        }

        if (!userPassword_input) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La contraseña es requerida',
                confirmButtonText: 'Entendido'
            });
            return false;
        }

        if (!confirmPassword_input) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Confirmar la contraseña es requerido',
                confirmButtonText: 'Entendido'
            });
            return false;
        }

        // Validación de contraseñas que no coinciden
        if (userPassword_input !== confirmPassword_input) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden',
                confirmButtonText: 'Entendido'
            });
            return false;
        }
        return true;
    };

    //Visibilidad de la password
        // Obtener los elementos
        const passwordInput = document.getElementById('password');
        const confirmpasswordInput = document.getElementById('confirm_password');
        const PasswordEyeOn = document.getElementById('eye');
        const PasswordEyeOn2 = document.getElementById('eye2');
        const PasswordEyeOnOff = document.getElementById('noneye');
        const PasswordEyeOnOff2 = document.getElementById('noneye2');

    
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

        // Función para alternar la visibilidad de la contraseña
        PasswordEyeOn2.addEventListener('click', function() {
            // Cambiar el tipo de input entre 'password' y 'text'
            if (confirmpasswordInput.type === 'password') {
                confirmpasswordInput.type = 'text';
                PasswordEyeOn2.style.display = 'none';  // Ocultar icono de ojo abierto
                PasswordEyeOnOff2.style.display = 'inline';  // Mostrar icono de ojo cerrado
            }
        });
    
        PasswordEyeOnOff2.addEventListener('click', function() {
            // Cambiar el tipo de input entre 'text' y 'password'
            if (confirmpasswordInput.type === 'text') {
                confirmpasswordInput.type = 'password';
                PasswordEyeOnOff2.style.display = 'none';  // Ocultar icono de ojo cerrado
                PasswordEyeOn2.style.display = 'inline';  // Mostrar icono de ojo abierto
            }
        });

        
        
});