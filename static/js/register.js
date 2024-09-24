
document.addEventListener("DOMContentLoaded", function (event) {
    // REGISTER
    // alertas si un input esta vacio

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

});