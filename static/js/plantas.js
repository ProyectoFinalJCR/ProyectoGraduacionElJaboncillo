document.addEventListener("DOMContentLoaded", function(){
    //Evento para mostrar formulario
    document.querySelector('.btn-add-planta').addEventListener('click', function(){
        const container_table_inputs = document.querySelector(".container-table-inputs");        
        const form_Plantas = document.querySelector(".container-inputPlantas");
  
        //alternar clases para expandir la tabla y mostrar el formulario
        container_table_inputs.classList.toggle("active");
        form_Plantas.classList.toggle("show");
        console.log("este se activa")
        //btn cancelar regresa la tabla al centro, quitandole las clases
        document.getElementById("btn-cancel").addEventListener("click", function(){
            form_Plantas.classList.remove("show")
            container_table_inputs.classList.remove("active")
            console.log("este se activa")
        });
    });

    //Obtener datos para mostrar en el modal de editar
    const modal = document.getElementById("myModal");
    const btnsEdit = document.querySelectorAll(".plantas-btn-edit");
    const inputId  = document.getElementById("id_editar");
    const inputNombre = document.getElementById("nombrePlanta_editar")
    const inputDescripcion = document.getElementById("descripcion_editar")
    const inputColor = document.getElementById("idColor_editar")
    const inputSubcategoria =  document.getElementById("idSubcategoria_editar")
    const inputRango = document.getElementById("idRango_editar")
    const inputEntorno = document.getElementById("idEntorno_editar")
    const inputAgua = document.getElementById("idAgua_editar")
    const inputSuelo = document.getElementById("idSuelo_editar")
    const inputTemporada = document.getElementById("idTemporada_editar")

    // Agregar evento para abrir el modal en cada botón de edición
    btnsEdit.forEach((btn) => {
        btn.addEventListener('click', (event) => {
          // Obtener la fila de la tabla donde se hizo clic
          const row = event.target.closest("tr");
          console.log("esta en plantas.js")
          // console.log("esta entrando en este js");
  
          // Obtener los datos de la categoría de esa fila
          const PlantaId = row.cells[0].innerText;
          const PlantaNombre = row.cells[1].innerText;
          const PlantaDescripcion = row.cells[2].innerText;
          const PlantaColor = row.cells[3].innerText;
          const PlantaSubcategoria = row.cells[4].innerText; 
          const PlantaRango = row.cells[5].innerText;
          const PlantaEntorno = row.cells[6].innerText;
          const PlantaAgua = row.cells[7].innerText;
          const PlantaSuelo = row.cells[8].innerText;
          const PlantaTemporada = row.cells[9].innerText;

          // Rellenar los campos del modal con los datos obtenidos
          inputId.value = PlantaId;
          inputNombre.value = PlantaNombre;
          inputDescripcion.value = PlantaDescripcion;
          inputDescripcion.textContent = PlantaDescripcion;
          inputColor.value = PlantaColor;
          inputColor.textContent = PlantaColor;
          inputSubcategoria.value = PlantaSubcategoria;
          inputSubcategoria.textContent = PlantaSubcategoria;
          inputRango.value = PlantaRango;
          inputRango.textContent = PlantaRango;
          inputEntorno.value = PlantaEntorno;
          inputEntorno.textContent = PlantaEntorno;
          inputAgua.value = PlantaAgua;
          inputAgua.textContent = PlantaAgua;
          inputSuelo.value = PlantaSuelo;
          inputSuelo.textContent = PlantaSuelo;
          inputTemporada.value = PlantaTemporada;
          inputTemporada.textContent = PlantaTemporada;
  
          // Mostrar el modal
          modal.style.display = "block";
        });
      });


      $(document).ready(function() {
        // Inicializar Select2 en modo múltiple
        $('#color').select2({
            placeholder: "Seleccione una o más opciones",
            allowClear: true,
            multiple: true
        });
        $('#sub').select2({
            placeholder: "Seleccione una o más opciones",
            allowClear: true,
            multiple: true
        });
        $('#rango').select2({
            placeholder: "Seleccione una o más opciones",
            allowClear: true,
            multiple: true
        });
    });
})