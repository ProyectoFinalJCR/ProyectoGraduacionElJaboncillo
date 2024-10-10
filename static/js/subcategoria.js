document.addEventListener('DOMContentLoaded', function(){

    //Evento para mostrar formulario
    document.querySelector('.btn-add-sub').addEventListener('click', function(){
        const container_table_inputs = document.querySelector(".container-table-inputs");        
        const form_Subcat = document.querySelector(".container-inputSubcat");
  
        //alternar clases para expandir la tabla y mostrar el formulario
        container_table_inputs.classList.toggle("active");
        form_Subcat.classList.toggle("show");
        //btn cancelar regresa la tabla al centro, quitandole las clases
        document.getElementById("btn-cancel").addEventListener("click", function(){
            form_Subcat.classList.remove("show")
            container_table_inputs.classList.remove("active")
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

    // ABRIR Y OBTENER DATOS PARA EL MODAL
    // Obtener el modal y los elementos que queremos manipular
    const modal = document.getElementById("myModal");
    const btnsEdit = document.querySelectorAll(".btn-edit");
    const inputId = document.getElementById("id_editar");
    const inputNombreSub = document.getElementById("nombreSub_editar");
    const inputNombreCat = document.getElementById("idCat_editar");
    const inputDescripcion = document.getElementById("descripcion_editar");
    // Agregar evento para abrir el modal en cada botón de edición
    btnsEdit.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        // Obtener la fila de la tabla donde se hizo clic
        const row = event.target.closest("tr");

        // Obtener los datos de la categoría de esa fila
        const categoriaId = row.cells[0].innerText;
        const categoriaNombreCat = row.cells[4].innerText;
        const categoriaNombreSub = row.cells[2].innerText;
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
      });
    });



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

});