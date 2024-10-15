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
               
        
         

           // ABRIR Y OBTENER DATOS PARA EL MODAL
    // Obtener el modal y los elementos que queremos manipular
    const modal = document.getElementById("myModal");
    const btnsEdit = document.querySelectorAll(".btn-edit");
    const inputId_usuario = document.getElementById("id_editar_usuario");
    const inputNombreUser = document.getElementById("nombreUsuario_editar");
    const inputCorreo = document.getElementById("correo_editar");
    const inputRolSeleccionado = document.getElementById("rol_editar");

    // Agregar evento para abrir el modal en cada botón de edición
    btnsEdit.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        // Obtener la fila de la tabla donde se hizo clic
        const row = event.target.closest("tr");

        // Obtener los datos de la categoría de esa fila
        const userID = row.cells[0].innerText;
        const nombreuser = row.cells[1].innerText;
        const correo = row.cells[2].innerText;
        const rol = row.cells[4].innerText;


        // Rellenar los campos del modal con los datos obtenidos
        inputId_usuario.value = userID;

        inputNombreUser.value = nombreuser;
        inputNombreUser.textContent = nombreuser;

        inputCorreo.value = correo;
        inputCorreo.textContent = correo;

        inputRolSeleccionado.value = rol;
        console.log("Valor del rol:", rol);

        inputRolSeleccionado.value = rol;

        // Mostrar el modal
        modal.style.display = "block";
      });
    });
    

    // Alertas
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
               event.target.submit(); 
           }
         })
      });
   });

     //ALERTA EDITAR
  const form_editar_user = document.querySelector('.form_edit_user');

  form_editar_user.addEventListener('submit', function(event) {
    event.preventDefault();
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, editar',
        cancelButtonText: 'Cancelar'
    }).then((result) =>{
        if (result.isConfirmed) {
            event.target.submit();  
          }
        });
    });

    
});
