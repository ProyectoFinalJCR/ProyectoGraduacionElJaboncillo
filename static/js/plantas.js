document.addEventListener("DOMContentLoaded", function () {
  //Evento para mostrar formulario
  document.querySelector('.btn-add-planta').addEventListener('click', function () {

    const container_table_inputs = document.querySelector(".container-inputPlantas");
    container_table_inputs.style.display = "block";
    document.getElementById("btn-cancel").addEventListener("click", function () {
      container_table_inputs.style.display = "none";
    });


  });

  //Obtener datos para mostrar en el modal de editar
  const modal = document.getElementById("myModal");
  const btnsEdit = document.querySelectorAll(".plantas-btn-edit");

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

  // Agregar evento para abrir el modal en cada botón de edición
  btnsEdit.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      // Obtener la fila de la tabla donde se hizo clic
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
      
    });
  });

  document.getElementById("btn_cancel_agregar").addEventListener("click", function () {
    const modalgregar = document.querySelector(".container-inputPlantas");
    modalgregar.style.display = "none";
  });
  document.getElementById("close_agregar").addEventListener("click", function () {
    const modalgregar = document.querySelector(".container-inputPlantas");
    modalgregar.style.display = "none";
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


  document.getElementsByClassName("btn-cancel-edit").addEventListener("click", function () {
    const modalcontentplantas = document.querySelector(".modal-plantas");
    modalcontentplantas.style.display = "none";
  });
  document.querySelector(".close-edit").addEventListener("click", function () {
    const modalcontentplantas = document.querySelector(".modal-plantas");
    modalcontentplantas.style.display = "none";
  });


  
  //buscar plantas
  document.getElementById('search_plantas').addEventListener('input', function () {
    const valorBuscar = this.value;



    fetch(`/buscar_plantas?valorBuscar=${valorBuscar}`)
      .then(response => response.json())
      .then(data => {
        const tableBody = document.getElementById('tabla_plantas');
        tableBody.innerHTML = '';  // Limpiar tabla

        if (data.length === 0) {
          tableBody.innerHTML = "<tr><td colspan='18' style='text-align: center;'>No hay resultados</td></tr>";
        } else {
          data.forEach(planta => {
            const imageCell = planta.imagen_url
              ? `<div class="img-container"><img src="${planta.imagen_url}" alt="planta" class="mini-imgInsumo"></div>`
              : `
                  <div class="image-upload">
                      <form action="/plantas" class="form_agregarimg" id="form_agregarimg">
                          <input type="hidden" name="id_planta" id="id_planta" value="${planta.id}">
                          <input type="file" id="file_input" class="file-input" accept="image/*">
                          <label for="file_input" class="upload-label">
                              <span class="upload-icon">📁</span>
                              <span class="upload-text">Subir imagen</span>
                          </label>
                      </form>
                  </div>`;

            const row = `
                  <tr>
                      <td id="planta-${planta.id}">
                          ${imageCell}
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
                          <button class="btn-edit plantas-btn-edit" id="openModalPlantas">
                              <i class="material-icons">edit</i>
                          </button>
                          <form action="/eliminarPlanta" method="post" class="form-eliminar">
                              <input type="hidden" id="id_eliminar" name="id_eliminar" value="${planta.id}">
                              <button class="btn-delete" type="submit">
                                  <i class="material-icons">delete</i>
                              </button>
                          </form>
                      </td>
                  </tr>`;
            tableBody.insertAdjacentHTML('beforeend', row);
          });
        }
      })
      .catch(error => console.error('Error:', error));


  });
});

//SOCKETS Cloudinary
/* MDOAL AGREGAR*/
document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("file_input_agregar");
  const id_planta = document.getElementById("id_planta_agregar").value;
  const formagregarimg = document.getElementById("form_agregarimgplanta");
  const socket = io();
  socket.on('connect', () => {
    console.log('Cliente conectado a SocketIO');
  });

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/do1rxjufw/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "rn94xkdi";

  fileInput.addEventListener("change", async function () {
    const file = fileInput.files[0];
    if (file) {
      // Mostrar vista previa de la imagen
      const reader = new FileReader();

      reader.readAsDataURL(file);

      // Crear el FormData y realizar la subida a Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await axios.post(CLOUDINARY_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const url = res.data.url;
      console.log("URL de la imagen subida:", url);


      socket.emit("addImgPlanta", { 'url': url, 'idPlan': id_planta });

      formagregarimg.submit(); // Enviar el formulario de agregar imagen
    }
  });
});


/* MDOAL EDITAR*/
document.addEventListener("DOMContentLoaded", function () {
  
    //ALERTA EDITAR
    const form_editar_planta = document.querySelectorAll('.form_editar_plantas');

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
      }).then((result) => {
        if (result.isConfirmed) {
          event.target.submit();
        }
      });
    });
  });

  document.querySelectorAll(".form_editar_plantas").forEach(function (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

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

        // Aquí puedes proceder con el envío del formulario al servidor, si es necesario.
        form.submit();
      }
    });
  });

});




