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

 
    //Buscar proveedores -----------------------------------
    let proveedoresData = [];
    // Cargar datos una sola vez cuando la página carga
    fetch(`/generar_json_proveedores`)
      .then(response => response.json())
      .then(data => {
        proveedoresData = data;
        mostrarProveedores(proveedoresData);  // Mostrar todos los proveedores inicialmente
      })
      .catch(error => console.error('Error:', error));

      //limpiar telefono 
      function limpiarTelefono(telefono) {
        return String(telefono).replace(/\D/g, '');
      }

      //Escuchar el evento 'input' para la búsqueda
document.getElementById("buscar_proveedores").addEventListener('input', function() { 
  const valorBuscar = this.value.toLowerCase();
  console.log(valorBuscar);
  // Filtrar resultados cuando hay texto en el input
  const resultados = valorBuscar === "" ? proveedoresData : 
    proveedoresData.filter(proveedor => 
      proveedor.nombre_proveedor.toLowerCase().includes(valorBuscar) ||
      proveedor.correo_electronico.toLowerCase().includes(valorBuscar) ||
      limpiarTelefono(proveedor.telefono).includes(valorBuscar) ||
      proveedor.direccion.toLowerCase().includes(valorBuscar)
    );

  // Mostrar resultados filtrados o todos los proveedores si el input está vacío
  mostrarProveedores(resultados);
});
// Función para mostrar proveedores en la tabla
function mostrarProveedores(data) {
  const tableBody = document.getElementById('tabla_proveedores');
  tableBody.innerHTML = '';  // Limpiar tabla

  if (data.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='6' style='text-align: center;'>No hay resultados</td></tr>";
  } else {
    data.forEach(proveedor => {
      const row = `<tr>
        <td>${proveedor.id}</td>
        <td>${proveedor.nombre_proveedor}</td>
        <td>${proveedor.correo_electronico}</td>
        <td>${proveedor.telefono}</td>
        <td>${proveedor.direccion}</td>
        <td class="btn-acciones"> 
          <button class="btn-edit btn-edit-proveedores" data-id="${proveedor.id}">
            <i class="material-icons">edit</i>
          </button>
          <form action="/eliminarProveedor" method="post" class="form-eliminar">
            <input type="hidden" class="id_eliminar" name="id_proveedor" value="${proveedor.id}">
            <button class="btn-delete" type="submit">
              <i class="material-icons">delete</i>
            </button>
          </form>
        </td>
      </tr>`;
      tableBody.insertAdjacentHTML('beforeend', row);
    });
  }
}
// Agregar event listener para delegación de eventos
document.getElementById('tabla_proveedores').addEventListener('click', function (event) {
  if (event.target.closest('.btn-edit-proveedores')) {
    const button = event.target.closest('.btn-edit-proveedores');
    const proveedorID = button.getAttribute('data-id');
    console.log("Proveedor ID:", proveedorID);

           // ABRIR Y OBTENER DATOS PARA EL MODAL
    // Obtener el modal y los elementos que queremos manipular
    const modal = document.getElementById("myModal");
    const inputId = document.getElementById("id_editar");
    const inputNombre = document.getElementById("nombre_editar");
    const inputCorreo = document.getElementById("correo_editar");
    const inputTelefono = document.getElementById("telefono_editar");
    const inputDireccion = document.getElementById("direccion_editar");

    
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
  }
  });

// ALERTAS
// alerta btn eliminar 
const forms_Proveedores = document.querySelectorAll('.form-eliminar')

forms_Proveedores.forEach(form => {
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
const form_editar = document.querySelector('.form-proveedores');

form_editar.addEventListener('submit', function(event) {
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
})