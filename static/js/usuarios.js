document.addEventListener("DOMContentLoaded", function (event) {
       
  // hasta la linea 17 se aplica la divicion de la tabla y el formulario
        document.getElementById("btn-add-user").addEventListener("click", function(){

                // Tabla de los usuarios centrada y crea la divicion con grid
                const container_table_inputs = document.querySelector(".container-table-inputs");
                
                const form_user = document.querySelector(".container-inputsUser");

                //alternar clases para expandir la tabla y mostrar el formulario
                container_table_inputs.classList.toggle("active");
                form_user.classList.toggle("show");
                //btn cancelar regresa la tabla al centro, quitandole las clases
                document.getElementById("btn-cancel").addEventListener("click", function(){
                        form_user.classList.remove("show")
                        container_table_inputs.classList.remove("active")
                });
                    
             // Validacion de los campos
                const nombre_completo = document.querySelector('#nombre');
                const correo = document.querySelector('#correo');
                const contraseña = document.querySelector('#contraseña');
                const rol = document.querySelector('#rol');

                nombre_completo.addEventListener('input', validar);
                //correo.addEventListener('input', validar);
                correo.addEventListener('input', validarEmail);
                contraseña.addEventListener('input', validar);
                rol.addEventListener('change', validar);
                
                function validar(e){
                if(e.target.value.trim() === ''){
                    mostrarError(`El campo ${e.target.id} es obligatorio`, e.target.parentElement); 
                    return;
                }

                limpiarAlerta(e.target.parentElement);    
                };
                
                // valida que en el input correo se ingrese un correo valido
                function validarEmail(e) {
                    const selectedValue = e.target.value;
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  
                    if (!emailRegex.test(selectedValue)) {
                      mostrarError('Ingresa direccion de correo electronico valida.', e.target.parentElement);
                      return;
                    }
                  
                    limpiarAlerta(e.target.parentElement);
                    return true;
                  }

                

                function mostrarError(mensaje, referencia){
                //Validar si ya existe una alerta
                limpiarAlerta(referencia);

                    const error = document.createElement('P');
                    error.textContent = mensaje;
                    error.classList.add('error');
                    referencia.appendChild(error);
                };

                function limpiarAlerta(referencia){
                    const alerta = referencia.querySelector('.error');
                    if(alerta){
                        alerta.remove();
                    }
                
                    //opacidad y habilitacion del boton agregar
                    document.getElementById('form_user').addEventListener('input', function() {
                      const inputs = document.querySelectorAll('.input-user');
                      const btnSend = document.querySelector('#btn-add-users')
                      let fields = true;
                      console.log(fields)
                
                      inputs.forEach(input => {
                        if(input.value.trim() === ''){
                          fields = false;
                          console.log(fields)
                        }
                      });
                
                      // Habilita o deshabilita el botón según el estado de los inputs
                    if (fields) {
                      btnSend.disabled = false;
                      btnSend.classList.remove ('opacity');
                    } else {
                      btnSend.disabled = true; 
                      btnSend.classList.add ('opacity');
                    }
                    });
                }

            }); 
            
            // alerta registro ingresado
           document.getElementById('btn-add-users').addEventListener('click', function(){
              
            const formUsers = document.getElementById('form_user')

              Swal.fire({
                icon: 'success',
                title: 'Usuario agreado con exito',
                text: '¡Usuario agregado correctamente!',
                showConfirmButton: false,
            })
            })    
            
          // alerta btn eliminar 
         const forms_users = document.querySelectorAll('.form-eliminar')

            forms_users.forEach(form => {
              form.addEventListener('submit', function(event) {
                event.preventDefault(); // Detener el envío del formulario inicialmente
              
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: "¡No podrás revertir esta acción!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, eliminarlo',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Si el usuario confirma, se envía el formulario
                        Swal.fire(
                            'Eliminado!',
                            'El registro ha sido eliminado.',
                            'success'
                        );
                        event.target.submit(); // Envía el formulario
                    }
                  })
            });

          });

   
});
