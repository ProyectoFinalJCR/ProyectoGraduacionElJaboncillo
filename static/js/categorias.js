document.addEventListener('DOMContentLoaded', function(){
    document.querySelector('.btn-add').addEventListener('click', function(){
      const container_table_inputs = document.querySelector(".container-table-inputs");        
      const form_cat = document.querySelector(".container-inputsCat");

      //alternar clases para expandir la tabla y mostrar el formulario
      container_table_inputs.classList.toggle("active");
      form_cat.classList.toggle("show");
      //btn cancelar regresa la tabla al centro, quitandole las clases
      document.getElementById("btn-cancel").addEventListener("click", function(){
          form_cat.classList.remove("show")
          container_table_inputs.classList.remove("active")
      });
    });


    // Obtener el modal y los elementos que queremos manipular
    const modal = document.getElementById("myModal");
    const btnsEdit = document.querySelectorAll(".btn-edit");
    const inputId = document.getElementById("id_editar");
    const inputNombre = document.getElementById("nombre_editar");
    const inputDescripcion = document.getElementById("descripcion_editar");

    // Agregar evento para abrir el modal en cada botón de edición
    btnsEdit.forEach((btn, index) => {
      btn.addEventListener('click', (event) => {
        // Obtener la fila de la tabla donde se hizo clic
        const row = event.target.closest("tr");

        // Obtener los datos de la categoría de esa fila
        const categoriaId = row.cells[0].innerText;
        const categoriaNombre = row.cells[1].innerText;
        const categoriaDescripcion = row.cells[2].innerText;


        // Rellenar los campos del modal con los datos obtenidos
        inputId.value = categoriaId;
        inputNombre.value = categoriaNombre;
        inputNombre.textContent = categoriaNombre;
        inputDescripcion.value = categoriaDescripcion;
        inputDescripcion.textContent = categoriaDescripcion;

        // Mostrar el modal
        modal.style.display = "block";
      });
    });

    // Validacion de los campos
    const categoria = document.querySelector('#nombre');
    const categoriaDescripcion = document.querySelector('#descripcion');

    categoria.addEventListener('input', validar);
    categoriaDescripcion.addEventListener('input', validar);

    function validar(e){
      if(e.target.value.trim() === ''){
          mostrarError(`El campo ${e.target.id} es obligatorio`, e.target.parentElement); 
          return;
      }

      limpiarAlerta(e.target.parentElement);    
  };

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
    document.getElementById('form-cat').addEventListener('input', function() {
      const inputs = document.querySelectorAll('.input-categories');
      const btnSend = document.querySelector('#btn-add-categories')
      let fields = true;

      inputs.forEach(input => {
        if(input.value.trim() === ''){
          fields = false;
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

   // alerta registro ingresado
   document.getElementById('btn-add-categories').addEventListener('click', function(){

      Swal.fire({
        icon: 'success',
        title: 'Categoria agregada con exito',
        text: '¡Categoria agregada correctamente!',
        showConfirmButton: false,
    })
    });


    // alerta btn eliminar 
    const forms_Cat = document.querySelectorAll('.form-eliminar')

    forms_Cat.forEach(form => {
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