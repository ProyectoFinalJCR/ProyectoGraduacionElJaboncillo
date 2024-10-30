document.addEventListener("DOMContentLoaded", function(event) {
    //Evento para mostrar formulario
    document.querySelector('#btn-add-insumos').addEventListener('click', function(){
      const container_table_inputs = document.querySelector(".container-table-inputs");        
      const form_insumos = document.querySelector(".container-inputinsumos");

      //alternar clases para expandir la tabla y mostrar el formulario
      container_table_inputs.classList.toggle("active");
      form_insumos.classList.toggle("show");
      console.log("este se activa")
      //btn cancelar regresa la tabla al centro, quitandole las clases
      document.getElementById("btn-cancel").addEventListener("click", function(){
          form_insumos.classList.remove("show")
          container_table_inputs.classList.remove("active")
          console.log("este se activa")
      });
    });


    // ABRIR Y OBTENER DATOS PARA EL MODAL
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
          const compatibilidadInsumo = row.cells[6].innerText;
          const precaucionesInsumo = row.cells[7].innerText;
          const subcategoriaInsumo = row.cells[8].innerText;
          const UnidadMedida = row.cells[9].innerText;
          const coloresInsumo = row.cells[10].innerText;
          const fechaVencimientoInsumo = row.cells[11].innerText;
          const precioVentaInsumo = row.cells[12].innerText;
          const imagenInsumo = row.cells[13].innerText;
  
  
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
          
          inputFrecuenciaInsumo_editar.value = frecuenciaInsumo;
          inputFrecuenciaInsumo_editar.textContent = frecuenciaInsumo;
          
          inputCompatibilidadInsumo_editar.value = compatibilidadInsumo;
          inputCompatibilidadInsumo_editar.textContent = compatibilidadInsumo;
          
          inputPrecaucionesInsumo_editar.value = precaucionesInsumo;
          inputPrecaucionesInsumo_editar.textContent = precaucionesInsumo;

          inputSubcatInsumo_editar.value = subcategoriaInsumo;
          inputSubcatInsumo_editar.textContent = subcategoriaInsumo;

          inputUnidadMedida_editar.value = UnidadMedida;
          inputUnidadMedida_editar.value = UnidadMedida;

          inputColoresInsumo_editar.value = coloresInsumo;
          inputColoresInsumo_editar.value = coloresInsumo;

          inputFechaVencimientoInsumo_editar.value = fechaVencimientoInsumo;
          inputFechaVencimientoInsumo_editar.textContent = fechaVencimientoInsumo;

          inputPrecioVentaInsumo_editar.value = precioVentaInsumo;
          inputPrecioVentaInsumo_editar.textContent = precioVentaInsumo;
        
  
          // Mostrar el modal
          modal.style.display = "block";
        });
      });
});