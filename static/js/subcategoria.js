document.addEventListener('DOMContentLoaded', function(){

    //Evento para mostrar formulario
    document.querySelector('.btn-add-sub').addEventListener('click', function(){
       const container_table_inputs = document.querySelector(".container-inputSubcat");
       container_table_inputs.style.display = "block";

       document.getElementById("btn_cancel_agregar").addEventListener("click", function () {
         const modalgregar = document.querySelector(".container-inputSubcat");
         modalgregar.style.display = "none";
       });
       document.getElementById("close_agregar").addEventListener("click", function () {
         const modalgregar = document.querySelector(".container-inputSubcat");
         modalgregar.style.display = "none";
       });
      });

    //Validacion de los campos del formulario
    const nombreSub = document.querySelector('#nombreSub');
    const nombreCat = document.querySelector('#cat');
    const descripcionSub = document.querySelector('#descripcion');

    nombreSub.addEventListener('input', validar);
    nombreCat.addEventListener('change', validar);
    descripcionSub.addEventListener('input', validar);

    function validar(e){
        if(e.target.value.trim() === ''){
            mostrarMensaje(`El campo ${e.target.id} es obligatorio`, e.target.parentElement);
            return;
        }
        limpiarAlerta(e.target.parentElement);
    };

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

    //Opacidad y activacion del boton agregar
    document.getElementById('form-subcat').addEventListener('input', function(){
        const inputs = document.querySelectorAll('.input-subcategories[type="text"]');
        const btnSend = document.querySelector('#btn-add-subcategories');
        let fields = true;

        inputs.forEach(input =>{
            if(input.value.trim() === ''){
                fields = false;
            }
        });

        //Habilita o deshabilita el boton segun el estado de la variable fields
        if(fields){
            btnSend.disabled = false;
            btnSend.classList.remove('opacity');
        }
        else{
            btnSend.disabled = true;
            btnSend.classList.add('opacity');
        }
    });

    //validar campos editar subcategoria ------------------
    //Validacion de los campos del formulario
    const nombreSubEditar = document.querySelector('#nombreSub_editar');
    const nombreCatEditar = document.querySelector('#idCat_editar');
    const descripcionSubEditar = document.querySelector('#descripcion_editar');

    nombreSubEditar.addEventListener('input', validar);
    nombreCatEditar.addEventListener('change', validar);
    descripcionSubEditar.addEventListener('input', validar);

    function validar(e){
        if(e.target.value.trim() === ''){
            mostrarMensaje(`El campo es obligatorio`, e.target.parentElement);
            return;
        }
        limpiarAlerta(e.target.parentElement);
    };

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


    // ALERTAS
    // alerta btn eliminar 
    const forms_Subcat = document.querySelectorAll('.form-eliminar')

    forms_Subcat.forEach(form => {
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

  //buscar subcategorias -----------------------------------
  let subcategoriasData = [];
  // Cargar datos una sola vez cuando la página carga
  fetch(`/generar_json_subcategorias`)
    .then(response => response.json())
    .then(data => {
      subcategoriasData = data;
      mostrarSubcategorias(subcategoriasData);  // Mostrar todas las subcategorias inicialmente
    })
    .catch(error => console.error('Error:', error));

  // Escuchar el evento 'input' para la búsqueda
document.getElementById("search").addEventListener('input', function() { 
    const valorBuscar = this.value.toLowerCase();

    // Filtrar resultados cuando hay texto en el input
    const resultados = valorBuscar === "" ? subcategoriasData : 
      subcategoriasData.filter(subcategoria => 
        subcategoria.subcategoria.toLowerCase().includes(valorBuscar) ||
        subcategoria.descripcion.toLowerCase().includes(valorBuscar) ||
        subcategoria.categoria.toLowerCase().includes(valorBuscar)
      );

    // Mostrar resultados filtrados o todas las subcategorias si el input está vacío
    mostrarSubcategorias(resultados);
  });
  // Función para mostrar subcategorias en la tabla
  function mostrarSubcategorias(data) {
    const tableBody = document.getElementById('tabla_subcategorias');
    tableBody.innerHTML = '';  // Limpiar tabla

    if (data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='6' style='text-align: center;'>No hay resultados</td></tr>";
    } else {
      data.forEach(subcategoria => {
        const row = `<tr>
          <td>${subcategoria.id}</td>
          <td>${subcategoria.subcategoria}</td>
          <td>${subcategoria.categoria}</td>
          <td>${subcategoria.descripcion}</td>
          <td style="display: none;">${subcategoria.id_categoria}</td>
          <td class="btn-acciones"> 
            <button class="btn-edit btn-edit-subcategorias" data-id="${subcategoria.id}">
              <i class="material-icons">edit</i>
            </button>
            <form action="/eliminarSubcategoria" method="post" class="form-eliminar">
              <input type="hidden" class="id_eliminar" name="id_eliminar" value="${subcategoria.id}">
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
  document.getElementById('tabla_subcategorias').addEventListener('click', function (event) {
      if (event.target.closest('.btn-edit-subcategorias')) {
        const button = event.target.closest('.btn-edit-subcategorias');
        const subcategoriaID = button.getAttribute('data-id');
        console.log("Subcategoria ID:", subcategoriaID);
        
        // ABRIR Y OBTENER DATOS PARA EL MODAL
    // Obtener el modal y los elementos que queremos manipular
    const modal = document.getElementById("myModal");
    const btnsEdit = document.querySelectorAll(".btn-edit");
    const inputId = document.getElementById("id_editar");
    const inputNombreSub = document.getElementById("nombreSub_editar");
    const inputNombreCat = document.getElementById("idCat_editar");
    const inputDescripcion = document.getElementById("descripcion_editar");
    
        // Obtener la fila de la tabla donde se hizo clic
        const row = event.target.closest("tr");

        // Obtener los datos de la categoría de esa fila
        const categoriaId = row.cells[0].innerText;
        const categoriaNombreSub = row.cells[1].innerText;
        const categoriaNombreCat = row.cells[4].innerText;
        const categoriaDescripcion = row.cells[3].innerText;


        // Rellenar los campos del modal con los datos obtenidos
        inputId.value = categoriaId;
        inputNombreCat.value = categoriaNombreCat;
        inputNombreSub.value = categoriaNombreSub;
        inputNombreSub.textContent = categoriaNombreSub;
        inputDescripcion.value = categoriaDescripcion;
        inputDescripcion.textContent = categoriaDescripcion;

        // Mostrar el modal
        modal.style.display = "block";
    
      }
 });

 // Delegacion de eventos para el boton eliminar
 document.getElementById('tabla_subcategorias').addEventListener('click', function (event) {
        if (event.target.closest('.btn-delete')) {
            event.preventDefault(); // Evita el envío automático del formulario
    
            const form = event.target.closest('.form-eliminar'); // Selecciona el formulario asociado
            const subcategoriaId = form.querySelector('.id_eliminar').value; // Obtiene el ID de la subcategoría
    
            // Mostrar SweetAlert de confirmación
            Swal.fire({
                title: '¿Estás seguro?',
                text: `Se eliminará la subcategoría. ¡No podrás revertir esta acción!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Si se confirma, envía el formulario
                    form.submit();
                }
            });
        }
    }); 


  //ALERTA EDITAR
  const form_editar = document.querySelector('.form_subt');

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

});