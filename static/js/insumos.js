document.addEventListener("DOMContentLoaded", function (event) {
  //Evento para mostrar formulario
  document.querySelector('#btn-add-insumos').addEventListener('click', function () {
    // const container_table_inputs = document.querySelector(".container-table-inputs");        
    // const form_insumos = document.querySelector(".container-inputinsumos");

    // //alternar clases para expandir la tabla y mostrar el formulario
    // container_table_inputs.classList.toggle("active");
    // form_insumos.classList.toggle("show");
    // console.log("este se activa")
    // //btn cancelar regresa la tabla al centro, quitandole las clases
    // document.getElementById("btn-cancel").addEventListener("click", function(){
    //     form_insumos.classList.remove("show")
    //     container_table_inputs.classList.remove("active")
    //     console.log("este se activa")
    // });

    const modalAgregar = document.querySelector(".container-inputinsumos");
    modalAgregar.style.display = "block";

    document.getElementById("btn-cancel").addEventListener("click", function () {
      modalAgregar.style.display = "none";


    });

  });


  // ABRIR Y OBTENER DATOS PARA EL MODAL EDITAR
  // Obtener el modal y los elementos que queremos manipular
  const modal = document.getElementById("myModal");
  const btnsEdit = document.querySelectorAll(".editar-insumo");
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

  // Agregar evento para abrir el modal en cada botón de edición
  btnsEdit.forEach((btn) => {
    btn.addEventListener('click', (event) => {
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
      const subcategoriaInsumo = row.cells[12].innerText;
      const UnidadMedida = row.cells[14].innerText;
      const coloresInsumo = row.cells[16].innerText;
      const fechaVencimientoInsumo = row.cells[17].innerText;
      const precioVentaInsumo = row.cells[18].innerText;

      // Rellenar los campos del modal con los datos obtenidos
      inputId_insumo.value = insumoID;
      // inputImagenInsumo_editar.value = imagenInsumo;
      // inputImagenInsumo_editar.textContent = imagenInsumo;

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
      modal.style.display = "block";

      document.getElementById("btn-cancel-edit").addEventListener("click", function () {

        modal.style.display = "none";
      });
      document.querySelector(".close-edit").addEventListener("click", function () {
        modal.style.display = "none";
      });
    });
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
    const modaleditar = document.querySelector(".container-inputinsumos");
    modaleditar.style.display = "none";
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
      dropdownParent: $('.agregar-insumos') // Ajusta el selector al ID de tu modal
    });
    $('#coloresInsumo_editar').select2({
      placeholder: "Seleccione una o más opciones",
      allowClear: true,
      multiple: true,
      dropdownParent: $('.agregar-insumos') // Ajusta el selector al ID de tu modal
    });
  });


  document.getElementById("btn-modal-subcate").addEventListener("click", function (event) {

    console.log("este se activa");
    const modalAgregarSubcategoria = document.querySelector("#myModalSub");
    modalAgregarSubcategoria.style.display = "block";

    document.getElementById("close_modal").addEventListener("click", function () {
      const modalAgregarSubcategoria = document.querySelector("#myModalSub");

      modalAgregarSubcategoria.style.display = "none";
    });
    document.querySelector(".close").addEventListener("click", function () {
      const modalAgregarSubcategoria = document.querySelector("#myModalSub");

      modalAgregarSubcategoria.style.display = "none";
    });

  });

  document.getElementById("btn-edit-sub").addEventListener("click", function (event) {
    event.preventDefault();

    // Obtén los datos del formulario
    const formData = new FormData(document.getElementById("formSubcategoria"));

    // Realiza la solicitud AJAX
    fetch('/agregarSubcategoriaInsumos', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Subcategoría agregada',
            text: 'La subcategoría se agregó exitosamente.'
          });
          cerrarModal(); // Función para cerrar el modal
          document.getElementById("formSubcategoria").reset(); // Limpia el formulario
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'No se pudo agregar la subcategoría.'
          });
        }
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: 'Hubo un problema al procesar la solicitud.'
        });
        console.error("Error en el envío:", error);
      });
  });

  // Función para cerrar el modal
  function cerrarModal() {
    document.getElementById("myModalSub").style.display = "none";
  }


  //---------

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




});

//SOCKETS Cloudinary

document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll(".form_edit_insumo").forEach(function (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

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
        form.submit(); // Descomenta si deseas enviar el formulario después de subir la imagen
      }
    });
  });
});