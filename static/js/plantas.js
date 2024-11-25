document.addEventListener("DOMContentLoaded", function () {
  //Evento para mostrar formulario
  document.querySelector('.btn-add-planta').addEventListener('click', function () {

    const container_table_inputs = document.querySelector(".container-inputPlantas");
    container_table_inputs.style.display = "block";


    document.getElementById("btn_cancel_agregar").addEventListener("click", function () {
      const modalgregar = document.querySelector(".container-inputPlantas");
      modalgregar.style.display = "none";
    });
    document.getElementById("close_agregar").addEventListener("click", function () {
      const modalgregar = document.querySelector(".container-inputPlantas");
      modalgregar.style.display = "none";
    });

  });


  //buscar plantas
  let plantasData = [];
  // Cargar datos una sola vez cuando la página carga
  fetch(`/generar_json_plantas`)
    .then(response => response.json())
    .then(data => {
      plantasData = data;
      mostrarPlantas(plantasData);  // Mostrar todos los plantas inicialmente
    })
    .catch(error => console.error('Error:', error));



  //Escuchar el evento 'input' para la búsqueda
  document.getElementById("buscar_plantas").addEventListener('input', function () {
    const valorBuscar = this.value.toLowerCase();

    // Filtrar resultados cuando hay texto en el input
    const resultados = valorBuscar === "" ? plantasData :
      plantasData.filter(planta =>
        planta.nombre.toLowerCase().includes(valorBuscar) ||
        (planta.subcategoria || "").toLowerCase().includes(valorBuscar) ||
        (planta.color || "").toLowerCase().includes(valorBuscar) ||
        (planta.rango || "").toLowerCase().includes(valorBuscar) ||
        (planta.precio ? planta.precio.toString().toLowerCase() : "").includes(valorBuscar.toLowerCase()) ||
        (planta.entorno || "").toLowerCase().includes(valorBuscar) ||
        (planta.agua || "").toLowerCase().includes(valorBuscar) ||
        (planta.suelo || "").toLowerCase().includes(valorBuscar) ||
        (planta.temporada || "").toLowerCase().includes(valorBuscar)
      );

    // Mostrar resultados filtrados o todos los plantas si el input está vacío
    mostrarPlantas(resultados);
  });
  // Función para mostrar plantas en la tabla
  function mostrarPlantas(data) {
    const tableBody = document.getElementById('tabla_plantas');
    tableBody.innerHTML = '';  // Limpiar tabla

    if (data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='12' style='text-align: center;'>No hay resultados</td></tr>";
    } else {
      data.forEach(planta => {
        const row = `<tr>
       <td id="planta-${planta.id}">
        ${planta.imagen_url ? `
          <div class="img-container">
            <img class="mini-imgInsumo" src="${planta.imagen_url}" alt="planta" id="imagen-planta">
          </div>
        ` : `
          <div class="image-upload">
            <form action="/plantas" class="form_agregarimgplanta" id="form_agregarimgplanta">
              <input type="hidden" class="id_planta_agregar" name="id_planta" id="id_planta_agregar" value="${planta.id}">
              <input type="file" id="file_input_agregar" class="file-input" accept=".png, .jpg, .jpeg">
              <label for="file_input_agregar" class="upload-label">
                <span class="upload-icon">📁</span> <!-- Icono de archivo -->
                <span class="upload-text">Subir imagen</span>
              </label>
            </form>
          </div>
        `}
      </td>
      <td style="display: none;">${planta.id}</td>
       <td>${planta.nombre}</td>
       <td style="display: none;">${planta.descripcion}</td>
       <td>${planta.subcategoria}</td>
       <td>${planta.color}</td>
       <td>${planta.rango}</td>
       <td style="display: none;">${planta.entorno}</td>
       <td style="display: none;">${planta.agua}</td>
       <td style="display: none;">${planta.suelo}</td>
       <td style="display: none;">${planta.temporada}</td>
       <td>${planta.precio_venta}</td>
       <td style="display: none;">${planta.id_subcategoria}</td>
       <td style="display: none;">${planta.id_color}</td>
       <td style="display: none;">${planta.id_rango}</td>
       <td style="display: none;">${planta.id_entorno}</td>
       <td style="display: none;">${planta.id_agua}</td>
       <td style="display: none;">${planta.id_suelo}</td>
       <td style="display: none;">${planta.id_temporada}</td>
       <td class="btn-acciones">
          <button class="btn-edit btn-edit-plantas" data-id="${planta.id}">
              <i class="material-icons">edit</i>
          </button>
          <button class="btn-produccion btn-produccion-plantas" data-id="${planta.id}">
              <i class="material-icons">compost</i>
          </button>
          <form action="/eliminarPlanta" method="post" class="form-eliminar">
              <input type="hidden"  class="id_eliminar" name="id_eliminar" value="${planta.id}">
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
  document.getElementById('tabla_plantas').addEventListener('click', function (event) {
    if (event.target.closest('.btn-edit-plantas')) {
      const button = event.target.closest('.btn-edit-plantas');
      const plantasID = button.getAttribute('data-id');
      console.log("Planta ID:", plantasID);

      // ABRIR Y OBTENER DATOS PARA EL MODAL
      //Obtener datos para mostrar en el modal de editar
      const modal = document.getElementById("myModal");
      const inputId = document.getElementById("id_editar_planta");
      const inputNombre = document.getElementById("nombrePlanta_editar")
      const inputDescripcion = document.getElementById("descripcion_editar")
      const inputColor = document.getElementById("idColor_editar")
      const inputSubcategoria = document.getElementById("idSubcategoria_editar")
      const inputRango = document.getElementById("idRango_editar")
      const inputEntorno = document.getElementById("idEntorno_editar")
      const inputAgua = document.getElementById("idAgua_editar")
      const inputSuelo = document.getElementById("idSuelo_editar")
      const inputTemporada = document.getElementById("idTemporada_editar")
      const inputPrecio = document.getElementById("precio_editar")


      const row = event.target.closest("tr");
      console.log("esta en plantas.js")
      // console.log("esta entrando en este js");

      // Obtener los datos de la categoría de esa fila
      const PlantaId = row.cells[1].innerText;
      const PlantaNombre = row.cells[2].innerText;
      const PlantaDescripcion = row.cells[3].innerText;
      const PlantaColor = row.cells[13].innerText.split(', ');
      const PlantaSubcategoria = row.cells[12].innerText.split(', ');
      const PlantaRango = row.cells[14].innerText.split(', ');
      const PlantaEntorno = row.cells[15].innerText;
      const PlantaAgua = row.cells[16].innerText;
      const PlantaSuelo = row.cells[17].innerText;
      const PlantaTemporada = row.cells[18].innerText;
      const PlantaPrecio = row.cells[11].innerText;

      // Rellenar los campos del modal con los datos obtenidos
      inputId.value = PlantaId;

      inputNombre.value = PlantaNombre;
      inputNombre.textContent = PlantaNombre;

      inputDescripcion.value = PlantaDescripcion;
      inputDescripcion.textContent = PlantaDescripcion;

      inputColor.value = PlantaColor;

      inputSubcategoria.value = PlantaSubcategoria;

      inputRango.value = PlantaRango;

      inputEntorno.value = PlantaEntorno;

      inputAgua.value = PlantaAgua;

      inputSuelo.value = PlantaSuelo;

      inputTemporada.value = PlantaTemporada;

      inputPrecio.value = PlantaPrecio;
      inputPrecio.textContent = PlantaPrecio;

      // Asigna los valores y actualiza cada Select2
      $('#idColor_editar').val(PlantaColor).trigger('change');
      $('#idSubcategoria_editar').val(PlantaSubcategoria).trigger('change');
      $('#idRango_editar').val(PlantaRango).trigger('change');




      // Mostrar el modal
      modal.style.display = "block";

      document.getElementById("btn-cancel-edit").addEventListener("click", function () {
        modal.style.display = "none";
      });
      document.getElementById("close-edit").addEventListener("click", function () {
        modal.style.display = "none";
      });

    }
  });

  // Delegacion a modal de produccion
  // Agregar event listener para delegación de eventos
  document.getElementById('tabla_plantas').addEventListener('click', function (event) {
    if (event.target.closest('.btn-produccion-plantas')) {
      const button = event.target.closest('.btn-produccion-plantas');
      const plantasProductionID = button.getAttribute('data-id');
      console.log("Planta ID produccion:", plantasProductionID);

      // ABRIR Y OBTENER DATOS PARA EL MODAL
      //Obtener datos para mostrar en el modal de editar
      const modalproduccion = document.getElementById("ModalProduccion");
      const inputIdproduccion = document.getElementById("planta-idProduccion");
      const inputNombreproduccion = document.getElementById("nombrePlantaproduccion")
      const inputDescripcion = document.getElementById("descripcionPlanta")
      const inputPrecio = document.getElementById("precioPlanta")

      // Obtener el elemento <p>
      const fechaElemento = document.querySelector('.fecha-cont .fecha p');

      // Obtener la fecha actual
      const fechaActual = new Date();
      const fechaFormateada = fechaActual.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });


      const row = event.target.closest("tr");
      // console.log("esta entrando en este js");
      console.log("esta en plantas.js")

      // Obtener el src de la imagen dentro de la fila
      const imgElement = row.querySelector(".mini-imgInsumo");
      const imgSrc = imgElement ? imgElement.src : null;
      console.log("Imagen src:", imgSrc);
      // Obtener los datos de la categoría de esa fila
      const PlantaIdproduccion = row.cells[1].innerText;
      const PlantaNombre = row.cells[2].innerText;
      const PlantaDescripcion = row.cells[3].innerText;
      const PlantaSubcategoria = row.cells[12].innerText.split(', ');
      const PlantaPrecio = row.cells[11].innerText;

      console.log("este es el id", PlantaIdproduccion);
      // Rellenar los campos del modal con los datos obtenidos
      inputIdproduccion.value = PlantaIdproduccion;


      inputNombreproduccion.value = PlantaNombre;
      inputNombreproduccion.textContent = PlantaNombre;

      inputDescripcion.value = PlantaDescripcion;
      inputDescripcion.textContent = PlantaDescripcion;

      inputPrecio.value = PlantaPrecio;
      inputPrecio.textContent = PlantaPrecio;

      // Establecer la fecha en el <p>
      fechaElemento.textContent = fechaFormateada;





      // Asigna los valores y actualiza cada Select2
      // $('#idColor_editar').val(PlantaColor).trigger('change');
      $('#idSubcategoria_editar').val(PlantaSubcategoria).trigger('change');
      // $('#idRango_editar').val(PlantaRango).trigger('change');

      // ABRIR MODAL Y MOSTRAR LA IMAGEN
      const modalProduccion = document.getElementById("ModalProduccion");
      const modalImg = modalProduccion.querySelector(".imgProduccion");

      if (imgSrc) {
        modalImg.src = imgSrc; // Actualizar la imagen del modal
      }



      // Mostrar el modal
      modalproduccion.style.display = "block";

      document.getElementById("btn-cancel-pro").addEventListener("click", function () {
        const modalproduccion = document.getElementById("ModalProduccion");
        modalproduccion.style.display = "none";
      });
      document.getElementById("close-pro").addEventListener("click", function () {
        const modalproduccion = document.getElementById("ModalProduccion");
        modalproduccion.style.display = "none";
      });

    }
  });

  // Delegacion de eventos para el boton eliminar
  // Delegar eventos para el botón de eliminar
  document.getElementById('tabla_plantas').addEventListener('click', function (event) {
    if (event.target.closest('.btn-delete')) {
      event.preventDefault(); // Evita que se envíe el formulario automáticamente
      const form = event.target.closest('.form-eliminar'); // Encuentra el formulario
      const userId = form.querySelector('.id_eliminar').value;

      // Mostrar alerta de confirmación con SweetAlert
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¡No podrás revertir esta acción!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Enviar formulario para eliminar
          form.submit();
        }
      });
    }
  });

  //Select2 para seleccionar opciones
  $(document).ready(function () {
    // Inicializar Select2 en modo múltiple
    $('#color').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,
      dropdownParent: $('.agregar-plantas') // Ajusta el selector al ID de tu modal

    });
    $('#sub').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,
      dropdownParent: $('.agregar-plantas') // Ajusta el selector al ID de tu modal

    });
    $('#rango').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,
      dropdownParent: $('.agregar-plantas') // Ajusta el selector al ID de tu modal
    });
  });

  //Select2 para seleccionar opciones editar plantas
  $(document).ready(function () {
    // Inicializar Select2 en modo múltiple
    $('#idColor_editar').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,

    });
    $('#idSubcategoria_editar').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,

    });
    $('#idRango_editar').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,
    });
  });



  //SOCKETS Cloudinary
  /* MDOAL AGREGAR*/
  const socket = io();
  socket.on('connect', () => {
    console.log('Cliente conectado a SocketIO');
  });

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/do1rxjufw/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "rn94xkdi";

  // Usar delegación de eventos para inputs dinámicos
  document.addEventListener("change", async function (event) {
    // Verificar si el evento proviene de un input de archivo con la clase específica
    if (event.target && event.target.classList.contains("file-input")) {
      const fileInput = event.target;
      const file = fileInput.files[0];
      if (file) {
        // Obtener el ID relacionado con el input actual
        const id_planta = fileInput.closest("form").querySelector(".id_planta_agregar").value;

        const reader = new FileReader();

        reader.readAsDataURL(file);

        // Crear el FormData para la subida a Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const res = await axios.post(CLOUDINARY_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        const url = res.data.url;
        console.log("URL de la imagen subida:", url);


        socket.emit("addImgPlanta", { 'url': url, 'idPlan': id_planta });
        console.log("Enviado a la planta en agregarplanta: ", id_planta);
      }

      // Enviar el formulario (opcional si es necesario)
      const formagregarimg = fileInput.closest(".form_agregarimgplanta");
      formagregarimg.submit();
    }
  });

});

/* MDOAL EDITAR*/
document.addEventListener("DOMContentLoaded", function () {
  const form_editar_planta = document.querySelectorAll(".form_editar_plantas");

  // Itera sobre cada formulario y agrega el evento de submit
  form_editar_planta.forEach(form => {
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
          const imageEditarUploader = document.getElementById('img_uploader_plantas_editar');
          const idPlantaEditar = document.getElementById('id_editar_planta').value;
          console.log("ID de planta a editar:", idPlantaEditar);

          const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/do1rxjufw/image/upload";
          const CLOUDINARY_UPLOAD_PRESET = "rn94xkdi";

          if (imageEditarUploader.files.length > 0) {
            const file = imageEditarUploader.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const res = await axios.post(CLOUDINARY_URL, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });

            const url = res.data.url;
            console.log("URL de la imagen subida:", url);

            // Emitir la URL y el ID del insumo a través del socket
            socket.emit("addImgPlanta", { 'url': url, 'idPlan': idPlantaEditar });

            // Enviar el formulario al servidor
            form.submit();
          } else {
            // Si no hay imagen, enviar directamente el formulario
            form.submit();
          }
        }
      });
    });
  });
});



