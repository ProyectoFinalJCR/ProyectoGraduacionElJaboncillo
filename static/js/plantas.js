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
    const modal = document.querySelectorById("myModal");
    const btnsEdit = document.querySelectorAll(".btn-edit");
    const inputId  = document.querySelectorById("id_editar");
    const inputNombre = document.querySelectorById("nombrePlanta_editar")
    const inputDescripcion = document.querySelectorById("descripcion_editar")
    const inputColor = document.querySelectorById("idColor_editar")
    const inputSubcategoria =  document.querySelectorById("idSubcategoria_editar")
    const inputRango = document.querySelectorById("idRango_editar")
    const inputEntorno = document.querySelectorById("idEntorno_editar")
    const inputAgua = document.querySelectorById("idAgua_editar")
    const inputSuelo = document.querySelectorById("idSuelo_editar")
    const inputTemporada = document.querySelectorById("idTemporada_editar")

    // Agregar evento para abrir el modal en cada botón de edición
    btnsEdit.forEach((btn) => {
        btn.addEventListener('click', (event) => {
          // Obtener la fila de la tabla donde se hizo clic
          const row = event.target.closest("tr");
  
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
})