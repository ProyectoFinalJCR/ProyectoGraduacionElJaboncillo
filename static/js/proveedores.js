document.addEventListener('DOMContentLoaded', function(){
    //Evento para mostrar formulario
    document.querySelector('.btn-add-proveedores').addEventListener('click', function(){
        const container_table_inputs = document.querySelector(".container-table-inputs");        
        const form_Proveedores = document.querySelector(".container-inputsProveedores");
  
        //alternar clases para expandir la tabla y mostrar el formulario
        container_table_inputs.classList.toggle("active");
        form_Proveedores.classList.toggle("show");
        console.log("este se activa")
        //btn cancelar regresa la tabla al centro, quitandole las clases
        document.getElementById("btn-cancel").addEventListener("click", function(){
            form_Proveedores.classList.remove("show")
            container_table_inputs.classList.remove("active")
        });
    });

        // ABRIR Y OBTENER DATOS PARA EL MODAL
    // Obtener el modal y los elementos que queremos manipular
    const modal = document.getElementById("myModal");
    const btnsEdit = document.querySelectorAll(".btn-edit");
    const inputId = document.getElementById("id_editar");
    const inputNombre = document.getElementById("nombre_editar");
    const inputCorreo = document.getElementById("correo_editar");
    const inputTelefono = document.getElementById("telefono_editar");
    const inputDireccion = document.getElementById("direccion_editar");

    // Agregar evento para abrir el modal en cada botón de edición
    btnsEdit.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        // Obtener la fila de la tabla donde se hizo clic
        const row = event.target.closest("tr");

        // Obtener los datos de la categoría de esa fila
        const proveedorId = row.cells[0].innerText;
        const proveedorNombre = row.cells[1].innerText;
        const proveedorCorreo = row.cells[2].innerText;
        const proveedorTelefono = row.cells[3].innerText;
        const proveedorDireccion = row.cells[4].innerText;


        // Rellenar los campos del modal con los datos obtenidos
        inputId.value = proveedorId;
        inputNombre.value = proveedorNombre;
        inputNombre.textContent = proveedorNombre;
        
        inputCorreo.value = proveedorCorreo;
        inputCorreo.textContent = proveedorCorreo;
        
        inputTelefono.value = proveedorTelefono;
        inputTelefono.textContent = proveedorTelefono;
        
        inputDireccion.value = proveedorDireccion;
        inputDireccion.textContent = proveedorDireccion;

        // Mostrar el modal
        modal.style.display = "block";
      });
    });
})