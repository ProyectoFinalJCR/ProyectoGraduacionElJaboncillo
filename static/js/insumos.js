document.addEventListener("DOMContentLoaded", function () {
  //Evento para mostrar formulario
  document.querySelector('#btn-add-insumos').addEventListener('click', function () {

    const modalAgregar = document.querySelector(".container-inputinsumos");
    modalAgregar.style.display = "block";

    document.getElementById("btn-cancel").addEventListener("click", function () {
      modalAgregar.style.display = "none";
    });
    document.getElementById("close").addEventListener("click", function () {
      modalAgregar.style.display = "none";
    });

  });

  //Buscar insumos
  let insumosData = [];
  // Cargar datos una sola vez cuando la página carga
  fetch(`/generar_json_insumos`)
    .then(response => response.json())
    .then(data => {
      insumosData = data;
      mostrarInsumos(insumosData);  // Mostrar todos los insumos inicialmente
    })
    .catch(error => console.error('Error:', error));


  //Escuchar el evento 'input' para la búsqueda
  document.getElementById("buscar_insumos").addEventListener('input', function () {
    const valorBuscar = this.value.toLowerCase();

    // Filtrar resultados cuando hay texto en el input
    const resultados = valorBuscar === "" ? insumosData :
      insumosData.filter(insumo =>
        insumo.nombre.toLowerCase().includes(valorBuscar) ||
        (insumo.subcategoria || "").toLowerCase().includes(valorBuscar) ||
        (insumo.color || "").toLowerCase().includes(valorBuscar) ||
        (insumo.unidad_medida || "").toLowerCase().includes(valorBuscar) ||
        (insumo.composicion || "").toLowerCase().includes(valorBuscar) ||
        (insumo.precauciones || "").toLowerCase().includes(valorBuscar) ||
        (insumo.fecha_vencimiento || "").toLowerCase().includes(valorBuscar)
      );

    // Mostrar resultados filtrados o todos los insumos si el input está vacío
    mostrarInsumos(resultados);
  });
  // Función para mostrar insumos en la tabla
  function mostrarInsumos(data) {
    const tableBody = document.getElementById('tabla_insumos');
    tableBody.innerHTML = '';  // Limpiar tabla


    if (data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='12' style='text-align: center;'>No hay resultados</td></tr>";
    } else {
      data.forEach(insumo => {

        let fechaFormateada = "";
        if (insumo.fecha_vencimiento) {
          const fecha = new Date(insumo.fecha_vencimiento);

          // Construir el formato "YYYY-MM-DD" requerido por <input type="date">
          const anio = fecha.getUTCFullYear();
          const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0'); // Mes comienza en 0
          const dia = fecha.getUTCDate().toString().padStart(2, '0');

          fechaFormateada = `${anio}-${mes}-${dia}`;
          insumo.fecha_vencimiento = fechaFormateada;
        }

        const row = `<tr>
         <td id="insumo-${insumo.id}">
          ${insumo.imagen_url ? `
            <div class="img-container">
              <img class="mini-imgInsumo" src="${insumo.imagen_url}" alt="Insumo">
            </div>
          ` : `
            <div class="image-upload">
              <form action="/insumos" class="form_agregarimg">
                  <input type="hidden" name="id_insumo" class="id_insumo_agregar" value="${insumo.id}">
                  <input type="file" class="file-input" accept=".png, .jpg, .jpeg" id="subir">
                  <label for="subir" class="upload-label">
                      <span class="upload-icon">📁</span> <!-- Icono de archivo -->
                      <span class="upload-text">Subir imagen</span>
                  </label>
              </form>
            </div>
          `}
        </td>
        <td style="display:none;">${insumo.id}</td>
         <td>${insumo.nombre}</td>
         <td>${insumo.aplicacion}</td>
         <td style="display:none;">${insumo.id_aplicacion}</td>
         <td style="display:none;">${insumo.descripcion}</td>
         <td>${insumo.composicion}</td>
         <td style="display:none;">${insumo.id_composicion}</td>
         <td style="display:none;">${insumo.frecuencia_aplicacion}</td>
         <td style="display:none;">${insumo.compatibilidad}</td>
         <td style="display:none;">${insumo.precauciones}</td>
         <td>${insumo.subcategoria}</td>
         <td style="display:none;">${insumo.id_subcategoria}</td>
         <td>${insumo.unidad_medida}</td>
         <td style="display: none;">${insumo.id_unidad_medida}</td>
         <td style="display: none;">${insumo.color}</td>
         <td style="display: none;">${insumo.id_color}</td>
         <td>${insumo.fecha_vencimiento}</td>
         <td>${insumo.precio_venta}</td>
         <td class="btn-acciones">
            <button class="btn-edit btn-edit-insumos" data-id="${insumo.id}">
                <i class="material-icons">edit</i>
            </button>
            <form action="/eliminarInsumo" method="post" class="form-eliminar">
                <input type="hidden" class="id_eliminar" name="id_eliminar" value="${insumo.id}">
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
  document.getElementById('tabla_insumos').addEventListener('click', function (event) {
    if (event.target.closest('.btn-edit-insumos')) {
      const button = event.target.closest('.btn-edit-insumos');
      const insumosID = button.getAttribute('data-id');
      console.log("ID de insumo a editar:", insumosID);

      // ABRIR Y OBTENER DATOS PARA EL MODAL EDITAR
      // Obtener el modal y los elementos que queremos manipular
      const modal = document.getElementById("myModal");
      const inputId_insumo = document.getElementById("id_editar_insumo");
      const inputinsumo_editar = document.getElementById("insumo_editar");
      const inputtipoInsumo_editar = document.getElementById("tipoInsumo_editar");
      const inputDescripcionInsumo_editar = document.getElementById("descripcion_insumo_editar");
      const inputSubcatInsumo_editar = document.getElementById("subcat_editar");
      const inputComposicionInsumo_editar = document.getElementById("ComposicionP_editar");
      const inputUnidadMedida_editar = document.getElementById("unidadMedida_editar");
      const inputFrecuenciaInsumo_editar = document.getElementById("frecuenciaAplicacion_insumo_editar");
      const inputColoresInsumo_editar = document.getElementById("coloresInsumo_editar");
      const inputFechaVencimientoInsumo_editar = document.getElementById("fechaVencimientoInsumo_editar");
      const inputPrecioVentaInsumo_editar = document.getElementById("precioVentaInsumo_editar");
      const inputCompatibilidadInsumo_editar = document.getElementById("compatibilidad_editar");
      const inputPrecaucionesInsumo_editar = document.getElementById("precauciones_editar");
      // const inputImagenInsumo_editar = document.getElementById("imagenInsumo");


      // Obtener la fila de la tabla donde se hizo clic
      const row = event.target.closest("tr");

      // Obtener los datos de la categoría de esa fila
      const imagenInsumo = row.cells[0].innerText;
      const insumoID = row.cells[1].innerText;
      const insumo = row.cells[2].innerText;
      const tipoInsumo = row.cells[4].innerText;
      const descripcion = row.cells[5].innerText;
      const composicionInsumo = row.cells[7].innerText;
      const frecuenciaInsumo = row.cells[8].innerText;
      const compatibilidadInsumo = row.cells[9].innerText;
      const precaucionesInsumo = row.cells[10].innerText;
      const subcategoriaInsumo = row.cells[12].innerText.split(', ');
      const UnidadMedida = row.cells[14].innerText;
      const coloresInsumo = row.cells[16].innerText.split(', ');
      const fechaVencimientoInsumo = row.cells[17].innerText;
      const precioVentaInsumo = row.cells[18].innerText;

      // Rellenar los campos del modal con los datos obtenidos
      inputId_insumo.value = insumoID;

      inputinsumo_editar.value = insumo;
      inputinsumo_editar.textContent = insumo;

      inputtipoInsumo_editar.value = tipoInsumo;

      inputDescripcionInsumo_editar.value = descripcion;
      inputDescripcionInsumo_editar.textContent = descripcion;


      inputComposicionInsumo_editar.value = composicionInsumo;

      inputFrecuenciaInsumo_editar.value = frecuenciaInsumo;
      inputFrecuenciaInsumo_editar.textContent = frecuenciaInsumo;

      inputCompatibilidadInsumo_editar.value = compatibilidadInsumo;
      inputCompatibilidadInsumo_editar.textContent = compatibilidadInsumo;

      inputPrecaucionesInsumo_editar.value = precaucionesInsumo;
      inputPrecaucionesInsumo_editar.textContent = precaucionesInsumo;

      inputSubcatInsumo_editar.value = subcategoriaInsumo;

      inputUnidadMedida_editar.value = UnidadMedida;

      inputColoresInsumo_editar.value = coloresInsumo;

      inputFechaVencimientoInsumo_editar.value = fechaVencimientoInsumo;
      inputFechaVencimientoInsumo_editar.textContent = fechaVencimientoInsumo;

      inputPrecioVentaInsumo_editar.value = precioVentaInsumo;
      inputPrecioVentaInsumo_editar.textContent = precioVentaInsumo;


      // Mostrar el modal
      
      // Asigna los valores y actualiza cada Select2
      $('#subcat_editar').val(subcategoriaInsumo).trigger('change');
      $('#coloresInsumo_editar').val(coloresInsumo).trigger('change');
      
      modal.style.display = "block";
      
      document.getElementById("btn-cancel-edit").addEventListener("click", function () {
        modal.style.display = "none";
      });
      document.getElementById("close-edit").addEventListener("click", function () {
        modal.style.display = "none";
      });
    }
  });

  // Delegar eventos para el boton de eliminar
  document.getElementById('tabla_insumos').addEventListener('click', function (event) {
    if (event.target.closest('.btn-delete')) {
      event.preventDefault(); 
      const button = event.target.closest('.btn-delete');
      const insumoId = this.querySelector('.id_eliminar').value;
      console.log("ID de insumo a eliminar:", insumoId);

      // Mostrar SweetAlert de confirmación
      Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará el insumo. ¡No podrás revertir esta acción!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Enviar formulario para eliminar
          button.closest('form').submit();
        }
      });
    }
  });

  //Select2 para seleccionar opciones
  $(document).ready(function () {
    // Inicializar Select2 en modo múltiple
    $('#colores').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,
      dropdownParent: $('.agregar-insumos') // Ajusta el selector al ID de tu modal
    });
    $('#subcat').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,
      dropdownParent: $('.agregar-insumos') // Ajusta el selector al ID de tu modal
    });
  });

  //Select2 para seleccionar opciones editar insumos
  $(document).ready(function () {
    // Inicializar Select2 en modo múltiple
    $('#subcat_editar').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,
    });
    $('#coloresInsumo_editar').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,
    });

  });

  //SOCKETS Cloudinary
  /* MODAL AGREGAR*/

  const socket = io();
  socket.on('connect', () => {
    console.log('Cliente conectado a SocketIO');
  });

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/do1rxjufw/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "rn94xkdi";

  // Delegación de eventos para inputs dinámicos
  document.addEventListener("change", async function (event) {
    // Verificar si el evento proviene de un input de archivo con la clase específica para insumos
    if (event.target && event.target.classList.contains("file-input")) {
      const fileInput = event.target;
      const file = fileInput.files[0];
      if (file) {
        // Obtener el ID relacionado con el input actual
        const id_insumo = fileInput.closest("form").querySelector(".id_insumo_agregar").value;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        // Crear el FormData para la subida a Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
          const res = await axios.post(CLOUDINARY_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });

          const url = res.data.url;
          console.log("URL de la imagen subida para insumo:", url);

          // Emitir evento a través de SocketIO
          socket.emit("addImgInsumo", { 'url': url, 'idIns': id_insumo });

          console.log("Enviado al insumo con ID:", id_insumo);
        } catch (error) {
          console.error("Error al subir imagen a Cloudinary:", error);
        }
      }

      // Enviar el formulario (opcional si es necesario)
      const formAgregarImg = fileInput.closest(".form_agregarimg");
      formAgregarImg.submit();
    }
  });

  //ALERTA EDITAR
  const form_editar = document.querySelector('.form_edit_insumo');

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

  document.getElementById("btn-cancel-edit").addEventListener("click", function () {
    const modaleditar = document.querySelector(".modal-insumos");
    modaleditar.style.display = "none";
  });
  document.getElementById("close-edit").addEventListener("click", function () {
    const modaleditar = document.querySelector(".modal-insumos");
    modaleditar.style.display = "none";
  });


  document.getElementById("form-insumos").addEventListener("submit", function (event) {
    const fecha = document.getElementById("fecha_vencimiento").value;

    // Verifica si el campo de fecha está vacío o no tiene el formato correcto
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      event.preventDefault(); // Evita que el formulario se envíe

      // Muestra la alerta con SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Fecha inválida',
        text: 'Por favor, ingrese una fecha en el formato YYYY-MM-DD.',
        confirmButtonText: 'Aceptar'
      });
    }
  });

  //



});

//SOCKETS Cloudinary
/* MDOAL AGREGAR*/

// document.addEventListener("DOMContentLoaded", function () {
//   const fileInput = document.getElementById("file_input");
//   const id_insumo = document.getElementById("id_insumo").value;
//   const formagregarimg = document.getElementById("form_agregarimg");
//   const socket = io();
//   socket.on('connect', () => {
//     console.log('Cliente conectado a SocketIO');
//     });

//   const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/do1rxjufw/image/upload";
//   const CLOUDINARY_UPLOAD_PRESET = "rn94xkdi";

//   fileInput.addEventListener("change", async function () {
//       const file = fileInput.files[0];
//       if (file) {
//           // Mostrar vista previa de la imagen
//           const reader = new FileReader();

//           reader.readAsDataURL(file);

//           // Crear el FormData y realizar la subida a Cloudinary
//           const formData = new FormData();
//           formData.append("file", file);
//           formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

//               const res = await axios.post(CLOUDINARY_URL, formData, {
//                   headers: { "Content-Type": "multipart/form-data" }
//               });

//               const url = res.data.url;
//               console.log("URL de la imagen subida:", url);


//         socket.emit("addImgInsumo", { url: url, idIns: id_insumo });

//         formagregarimg.submit(); // Enviar el formulario de agregar imagen
//       }
//   });
// });

/* MDOAL EDITAR*/
document.addEventListener("DOMContentLoaded", function () {

  const formInsumoEditar = document.querySelectorAll(".form_edit_insumo");

  formInsumoEditar.forEach(form => {
    form.addEventListener('submit', function (event) {
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
      }).then(async (result) => { // Declarar async aquí
        if (result.isConfirmed) {
          socket = io();
          const imageUploader = document.getElementById('img_uploader_insu_editar');
          const idInsumoEditar = document.getElementById('id_editar_insumo').value;
          console.log("ID de insumo a editar:", idInsumoEditar);

          const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/do1rxjufw/image/upload";
          const CLOUDINARY_UPLOAD_PRESET = "rn94xkdi";

          if (imageUploader.files.length > 0) {
            const file = imageUploader.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);


            const res = await axios.post(CLOUDINARY_URL, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });

            const url = res.data.url;
            console.log("URL de la imagen subida:", url);

            // Emitir la URL y el ID del insumo a través del socket
            socket.emit("addImgInsumo", { 'url': url, 'idIns': idInsumoEditar });
            // Aquí puedes proceder con el envío del formulario al servidor, si es necesario.

            form.submit();
          } else {
          // Si no hay imagen, enviar directamente el formulario
          form.submit();
        }
        }
      });
    });
  })
});

