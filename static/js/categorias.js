  document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.btn-add').addEventListener('click', function () {
    const form_cat = document.querySelector(".container-inputsCat");
    form_cat.style.display = "block";

    document.getElementById("btn_cancel_cat").addEventListener("click", function () {
      const modal = document.querySelector(".container-inputsCat");
      modal.style.display = "none";
    });

    document.getElementById("close_agregar_cat").addEventListener("click", function () {
      const modal = document.querySelector(".container-inputsCat");
      modal.style.display = "none";
    });
  });

  // Validacion de los campos
  const categoria = document.querySelector('#nombre');
  const categoriaDescripcion = document.querySelector('#descripcion');

  categoria.addEventListener('input', validar);
  categoriaDescripcion.addEventListener('input', validar);

  function validar(e) {
    if (e.target.value.trim() === '') {
      mostrarError(`El campo ${e.target.id} es obligatorio`, e.target.parentElement);
      return;
    }

    limpiarAlerta(e.target.parentElement);
  };

  function mostrarError(mensaje, referencia) {
    //Validar si ya existe una alerta
    limpiarAlerta(referencia);

    const error = document.createElement('P');
    error.textContent = mensaje;
    error.classList.add('error');
    referencia.appendChild(error);
  };

  function limpiarAlerta(referencia) {
    const alerta = referencia.querySelector('.error');
    if (alerta) {
      alerta.remove();
    }
  };
  //opacidad y habilitacion del boton agregar
  document.getElementById('form-cat').addEventListener('input', function () {
    const inputs = document.querySelectorAll('.input-cat[type="text"]');
    const btnSend = document.querySelector('#btn-add-categories')
    let fields = true;

    inputs.forEach(input => {
      if (input.value.trim() === '') {
        fields = false;
      }
    });

    // Habilita o deshabilita el botón según el estado de la variable fields
    if (fields) {
      btnSend.disabled = false;
      btnSend.classList.remove('opacity');
    } else {
      btnSend.disabled = true;
      btnSend.classList.add('opacity');
    }
  });

  // validacion de campos editar categoria ------------------
  const categoriaEditar = document.querySelector('#nombre_editar');
  const categoriaDescripcionEditar = document.querySelector('#descripcion_editar');

  categoriaEditar.addEventListener('input', validar);
  categoriaDescripcionEditar.addEventListener('input', validar);

  function validar(e) {
    if (e.target.value.trim() === '') {
      mostrarError(`El campo es obligatorio`, e.target.parentElement);
      return;
    }

    limpiarAlerta(e.target.parentElement);
  };

  function mostrarError(mensaje, referencia) {
    //Validar si ya existe una alerta
    limpiarAlerta(referencia);

    const error = document.createElement('P');
    error.textContent = mensaje;
    error.classList.add('error');
    referencia.appendChild(error);
  };

  function limpiarAlerta(referencia) {
    const alerta = referencia.querySelector('.error');
    if (alerta) {
      alerta.remove();
    }
  };
  //opacidad y habilitacion del boton agregar
  document.getElementById('form_cat_edit').addEventListener('input', function () {
    const inputs = document.querySelectorAll('.input-cateEditar [type="text"]');
    const btnSend = document.querySelector('#btn-edit-categories')
    let fields = true;

    inputs.forEach(input => {
      if (input.value.trim() === '') {
        fields = false;
      }
    });

    // Habilita o deshabilita el botón según el estado de la variable fields
    if (fields) {
      btnSend.disabled = false;
      btnSend.classList.remove('opacity');
    } else {
      btnSend.disabled = true;
      btnSend.classList.add('opacity');
    }
  });
  //buscar categorias -----------------------------------
  categoriasData = [];
  console.log(categoriasData);
  // Cargar datos una sola vez cuando la página carga
  fetch(`/generar_json_categorias`)
    .then(response => response.json())
    .then(data => {
      categoriasData = data;
      mostrarCategorias(categoriasData);  // Mostrar todas las categorías inicialmente
    })
    .catch(error => console.error('Error:', error));

  // Escuchar el evento 'input' para la búsqueda
  document.getElementById("search").addEventListener('input', function () {
    const valorBuscar = this.value.toLowerCase();

    // Filtrar resultados cuando hay texto en el input
    const resultados = valorBuscar === "" ? categoriasData :
      categoriasData.filter(categoria =>
        categoria.categoria.toLowerCase().includes(valorBuscar) ||
        categoria.descripcion.toLowerCase().includes(valorBuscar)
      );

    // Mostrar resultados filtrados o todas las categorías si el input está vacío
    mostrarCategorias(resultados);
  });
  // Función para mostrar categorías en la tabla
  function mostrarCategorias(data) {
    const tableBody = document.getElementById('tabla_categorias');
    tableBody.innerHTML = '';  // Limpiar tabla

    if (data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='6' style='text-align: center;'>No hay resultados</td></tr>";
    } else {
      data.forEach(categoria => {
        const row = `<tr>
        <td>${categoria.id}</td>
        <td>${categoria.categoria}</td>
        <td>${categoria.descripcion}</td>
        <td class="btn-acciones"> 
          <button class="btn-edit btn-edit-categorias" data-id="${categoria.id}">
            <i class="material-icons">edit</i>
          </button>
          <form action="/eliminarCategoria" method="post" class="form-eliminar-cat">
            <input type="hidden" class="id_eliminar" name="id_eliminar" value="${categoria.id}">
            <button class="btn-delete btn-delete-cat" type="submit">
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
  document.getElementById('tabla_categorias').addEventListener('click', function (event) {
    if (event.target.closest('.btn-edit-categorias')) {
      const button = event.target.closest('.btn-edit-categorias');
      const categoriaID = button.getAttribute('data-id');
      console.log("Categoria ID:", categoriaID);

      // Obtener el modal y los elementos que queremos manipular
      const modal = document.getElementById("myModal");
      const btnsEditar = document.querySelectorAll(".btn-edit");
      const inputId = document.getElementById("id_editar");
      const inputNombre = document.getElementById("nombre_editar");
      const inputDescripcion = document.getElementById("descripcion_editar");

      
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

          document.getElementById("close-edit").addEventListener("click", () => {
            modal.style.display = "none";
          })
    }
  });

   // Delegacion de eventos para el boton eliminar
   // Delegación de eventos para el botón eliminar categoría
document.getElementById('tabla_categorias').addEventListener('click', function (event) {
  if (event.target.closest('.btn-delete-cat')) {
    event.preventDefault(); // Evita el envío automático del formulario

    const form = event.target.closest('.form-eliminar-cat'); // Selecciona el formulario asociado
    const categoriaId = form.querySelector('.id_eliminar').value; // Obtiene el ID de la categoría

    // Mostrar SweetAlert de confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la categoría. ¡No podrás revertir esta acción!`,
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


  // ALERTAS
  // alerta btn eliminar 
  // const forms_Cat = document.querySelectorAll('.form-eliminar')

  // forms_Cat.forEach(form => {
  //   form.addEventListener('submit', function (event) {
  //     event.preventDefault(); // Detener el envío del formulario inicialmente

  //     Swal.fire({
  //       title: '¿Estás seguro?',
  //       text: "¡No podrás revertir esta acción!",
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonColor: '#3085d6',
  //       cancelButtonColor: '#d33',
  //       confirmButtonText: 'Sí, eliminarlo',
  //       cancelButtonText: 'Cancelar'
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         event.target.submit();
  //       }
  //     })
  //   });

  // });

  //ALERTA EDITAR
  const form_editar = document.querySelector('.form_edit');

  form_editar.addEventListener('submit', function (event) {
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
    }).then((result) => {
      if (result.isConfirmed) {
        event.target.submit();
      }
    });
  });

});