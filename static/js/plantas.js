document.addEventListener("DOMContentLoaded", function(){
    //Evento para mostrar formulario
    document.querySelector('.btn-add-planta').addEventListener('click', function(){
     
        const container_table_inputs = document.querySelector(".container-inputPlantas");  
        container_table_inputs.style.display = "block";
        document.getElementById("btn-cancel").addEventListener("click", function(){
            container_table_inputs.style.display="none";
        });

        
    });

    //Obtener datos para mostrar en el modal de editar
    const modal = document.getElementById("myModal");
    const btnsEdit = document.querySelectorAll(".plantas-btn-edit");

    const inputId  = document.getElementById("id_editar_planta");
    const inputNombre = document.getElementById("nombrePlanta_editar")
    const inputDescripcion = document.getElementById("descripcion_editar")
    const inputColor = document.getElementById("idColor_editar")
    const inputSubcategoria =  document.getElementById("idSubcategoria_editar")
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
          const PlantaColor = row.cells[13].innerText;
          const PlantaSubcategoria = row.cells[12].innerText; 
          const PlantaRango = row.cells[14].innerText;
          const PlantaEntorno = row.cells[15].innerText;
          const PlantaAgua = row.cells[16].innerText;
          const PlantaSuelo = row.cells[17].innerText;
          const PlantaTemporada = row.cells[18].innerText;
          const PlantaPrecio = row.cells[11].innerText;

          // Rellenar los campos del modal con los datos obtenidos
          inputId.value = PlantaId;
          
          inputNombre.value = PlantaNombre;
          inputNombre.value = PlantaNombre;

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

            

  
          // Mostrar el modal
          modal.style.display = "block";
        });
      });

      //Select2 para seleccionar opciones
      $(document).ready(function() {
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

      //Select2 para seleccionar opciones editar insumos
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

    document.getElementById("btn-cancel-edit").addEventListener("click", function(){
        const modalcontentplantas = document.querySelector(".modal-plantas");
        modalcontentplantas.style.display="none";
    });

})



//SOCKETS Cloudinary

document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll(".form_edit_plantas").forEach(function (form) {
      form.addEventListener("submit", async function (event) {
        event.preventDefault();
  
        socket = io();
        const imageUploader = document.getElementById('img_uploader_plantas_editar');
        const idInsumoEditar = document.getElementById('id_editar_planta').value;
        console.log("ID de planta a editar:", idInsumoEditar);
  
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
          socket.emit("addImgPlanta", { 'url': url, 'idPlan': idInsumoEditar });
  
          // Aquí puedes proceder con el envío del formulario al servidor, si es necesario.
          form.submit(); // Descomenta si deseas enviar el formulario después de subir la imagen
        }
      });
    });
  });