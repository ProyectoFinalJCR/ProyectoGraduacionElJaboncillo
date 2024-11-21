document.addEventListener('DOMContentLoaded', function(){
    //Evento para mostrar formulario
    document.querySelector('.btn-add-proveedores').addEventListener('click', function(){
            const container_proveedores = document.querySelector(".container-inputsProveedores");
            container_proveedores.style.display = "block";
            document.getElementById("btn_cancel_proveedor").addEventListener("click", function(){
            const container_proveedores = document.querySelector(".container-inputsProveedores");

                container_proveedores.style.display = "none";
            });
            document.getElementById("close_agregar_proveedor").addEventListener("click", function(){
            const container_proveedores = document.querySelector(".container-inputsProveedores");

                container_proveedores.style.display = "none";
            });
        
    });

    //Validacion de los campos del formulario
    const nombre = document.querySelector('#nombreprov');
    const correo = document.querySelector('#correoProveedor');
    const telefono = document.querySelector('#numeroTelefono');
    const direccion = document.querySelector('#direccionprov');

    nombre.addEventListener('input', validar);
    correo.addEventListener('input', validarEmail);
    telefono.addEventListener('input', validar);
    direccion.addEventListener('input', validar);

    function validar(e){
        if(e.target.value.trim() === ''){
            mostrarMensaje(`El campo ${e.target.id} es obligatorio`, e.target.parentElement);
            return;
        }
        limpiarAlerta(e.target.parentElement);
    };

    //valida que el correo electronico sea valido
    function validarEmail(e){
        const selectedValue = e.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(selectedValue)){
            mostrarMensaje('Ingresa direccion de correo electronico valida.', e.target.parentElement);
            return;
        }
        limpiarAlerta(e.target.parentElement);
        return true;
    }

    function mostrarMensaje(mensaje, referencia){
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
    };

    //Opacidad y habilitacion del boton agregar
    document.getElementById('form-proveedores').addEventListener('input', function(){
        const inputs = document.querySelectorAll('.input-proveedor');
        const btnSend = document.querySelector('#btn-add-proveedores');
        let fields = true;

        inputs.forEach(input =>{
            if(input.value.trim() === ''){
                fields = false;
            }
        });

        //Habilita o deshabilita el boton segun el estado de los campos
        if(fields){
            btnSend.disabled = false;
            btnSend.classList.remove('opacity');
        }
        else{
            btnSend.disabled = true;
            btnSend.classList.add('opacity');
        }
    });

    // validar inputs de proveedores ------------------
    const nombre_proveedor = document.querySelector('#nombre_editar');
    const correo_proveedor = document.querySelector('#correo_editar');
    const telefono_proveedor = document.querySelector('#telefono_editar');
    const direccion_proveedor = document.querySelector('#direccion_editar');

    nombre_proveedor.addEventListener('input', validar);
    correo_proveedor.addEventListener('input', validarEmail);
    telefono_proveedor.addEventListener('input', validar);
    direccion_proveedor.addEventListener('input', validar);

    function validar(e){
        if(e.target.value.trim() === ''){
            mostrarMensaje(`El campo es obligatorio`, e.target.parentElement);
            return;
        }
        limpiarAlerta(e.target.parentElement);
    };

    //valida que el correo electronico sea valido
    function validarEmail(e){
        const selectedValue = e.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(selectedValue)){
            mostrarMensaje('Ingresa direccion de correo electronico valida.', e.target.parentElement);
            return;
        }
        limpiarAlerta(e.target.parentElement);
        return true;
    }

    function mostrarMensaje(mensaje, referencia){
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
    };
 
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
const form_editar = document.querySelector('.form_edit');

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