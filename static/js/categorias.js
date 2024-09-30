document.addEventListener('DOMContentLoaded', function(){

    const btnAdd = document.querySelector('.btn');
    const btnCancel = document.querySelector('#btn-cancel');
    const table = document.querySelector('.table-container');
    const form = document.querySelector('.form-categories');

    btnAdd.addEventListener('click', function(){
        table.classList.remove('table-container');
        table.classList.add('table-container-add');
        form.classList.remove('hidden');
    });

    btnCancel.addEventListener('click', function(){
        table.classList.add('table-container');
        table.classList.remove('table-container-add');
        form.classList.add('hidden');
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
    document.getElementById('form').addEventListener('input', function() {
      const inputs = document.querySelectorAll('.input-check');
      const btnSend = document.querySelector('#btn-add-categories')
      let fields = true;
      // console.log(fields)

      inputs.forEach(input => {
        if(input.value.trim() === ''){
          fields = false;
       //   console.log(fields)
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