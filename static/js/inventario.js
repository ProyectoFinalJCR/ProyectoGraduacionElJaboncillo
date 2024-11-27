document.addEventListener("DOMContentLoaded", function () {
  //Evento para mostrar formulario
  document.querySelector('.btn-produccion').addEventListener('click', function () {

    const modalProduccion = document.querySelector(".modal-produccion");
    modalProduccion.style.display = "block";


    document.getElementById("btn-cancel-pro").addEventListener("click", function () {
        const modalProduccion = document.querySelector(".modal-produccion");
        modalProduccion.style.display = "none";
    });
    document.getElementById("close-pro").addEventListener("click", function () {
        const modalProduccion = document.querySelector(".modal-produccion");
        modalProduccion.style.display = "none";
    
    });

  });

  


// Delegacion a modal de produccion
  // Agregar event listener para delegación de eventos
  document.getElementById('tabla_inventario').addEventListener('click', function (event) {
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
 });
 