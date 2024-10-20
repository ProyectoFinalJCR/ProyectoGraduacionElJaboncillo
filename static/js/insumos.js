document.addEventListener("DOMContentLoaded", function(event) {



    // ABRIR Y OBTENER DATOS PARA EL MODAL
    // Obtener el modal y los elementos que queremos manipular
    const modal = document.getElementById("myModal");
    const btnsEdit = document.querySelectorAll(".btn-edit");
    const inputId_insumo = document.getElementById("id_editar_insumo");
    const inputinsumo_editar = document.getElementById("insumo_editar");
    const inputtipoInsumo_editar = document.getElementById("tipoInsumo_editar");
    const inputDescripcionInsumo_editar = document.getElementById("descripcion_insumo_editar");
    const inputSubcatInsumo_editar = document.getElementById("subcat_editar");
    const inputComposicionInsumo_editar = document.getElementById("ComposicionP_editar");
    const inputAplicacionIdeal_editar = document.getElementById("idaplicaIdeal_editar");
    const inputFrecuenciaInsumo_editar = document.getElementById("frecuenciaAplicacion_insumo_editar");
    const inputDurabilidadInsumo_editar = document.getElementById("durabilidad_editar");
    const inputCompatibilidadInsumo_editar = document.getElementById("compatibilidad_editar");
    const inputPrecaucionesInsumo_editar = document.getElementById("precauciones_editar");

    // Agregar evento para abrir el modal en cada botón de edición
    btnsEdit.forEach((btn) => {
        btn.addEventListener('click', (event) => {
          // Obtener la fila de la tabla donde se hizo clic
          const row = event.target.closest("tr");
  
          // Obtener los datos de la categoría de esa fila
          const insumoID = row.cells[0].innerText;
          const insumo = row.cells[1].innerText;
          const tipoInsumo = row.cells[2].innerText;
          const descripcion = row.cells[3].innerText;
          const composicionInsumo = row.cells[4].innerText;
          const frecuenciaInsumo = row.cells[5].innerText;
          const durabilidadInsumo = row.cells[6].innerText;
          const aplicacionIdeal = row.cells[7].innerText;
          const compatibilidadInsumo = row.cells[8].innerText;
          const precaucionesInsumo = row.cells[9].innerText;
  
  
          // Rellenar los campos del modal con los datos obtenidos
          inputId_insumo.value = insumoID;

          inputtipoInsumo_editar.value = insumoID;
  
          inputinsumo_editar.value = insumo;
          inputinsumo_editar.textContent = insumo;
        
          inputtipoInsumo_editar.value = tipoInsumo;     
          inputtipoInsumo_editar.textContent = tipoInsumo;


          inputDescripcionInsumo_editar.value = descripcion;
          inputDescripcionInsumo_editar.textContent = descripcion;

          inputComposicionInsumo_editar.value = composicionInsumo;
          inputComposicionInsumo_editar.value = composicionInsumo;

          inputAplicacionIdeal_editar.value = aplicacionIdeal;
          inputAplicacionIdeal_editar.value = aplicacionIdeal;
          
          inputFrecuenciaInsumo_editar.value = frecuenciaInsumo;
          inputFrecuenciaInsumo_editar.textContent = frecuenciaInsumo;

          inputDurabilidadInsumo_editar.value = durabilidadInsumo;
          inputDurabilidadInsumo_editar.textContent = durabilidadInsumo;

          inputCompatibilidadInsumo_editar.value = compatibilidadInsumo;
          inputCompatibilidadInsumo_editar.textContent = compatibilidadInsumo;

          inputPrecaucionesInsumo_editar.value = precaucionesInsumo;
          inputPrecaucionesInsumo_editar.textContent = precaucionesInsumo;
  
          // Mostrar el modal
          modal.style.display = "block";
        });
      });
});