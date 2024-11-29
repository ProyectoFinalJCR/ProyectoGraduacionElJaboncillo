document.addEventListener("DOMContentLoaded", function () {
  //Evento para mostrar formulario
  const btn_produccion = document.querySelectorAll('.btn-produccion');

  btn_produccion.forEach(button => {
    button.addEventListener('click', function (event) {
      //Obtener id del producto
      const producto_id = button.getAttribute('data-id');
      console.log("este es el id del producto", producto_id);

      // Mostrar el modal de producción
      const modalproduccion = document.getElementById('ModalProduccion');
      modalproduccion.style.display = 'block';


      document.getElementById("btn-cancel-pro").addEventListener("click", function () {
        const modalproduccion = document.getElementById('ModalProduccion');
        modalproduccion.style.display = "none";
      });
      document.getElementById("close-pro").addEventListener("click", function () {
        const modalproduccion = document.getElementById('ModalProduccion');
        modalproduccion.style.display = "none";
      });

    });

  });

  // Buscar inventario
  let inventarioData = [];
  // Cargar datos una sola vez cuando la página carga
  fetch(`/generar_inventario_info`).then(response => response.json()).then(data => {
    inventarioData = data;
    mostrarInventario(inventarioData);  // Mostrar todos los inventario inicialmente
  })
    .catch(error => console.error('Error:', error));

  // Escuchar el evento 'input' para la búsqueda
  document.getElementById("buscar_inventario").addEventListener('input', function () {
    const valorBuscar = this.value.toLowerCase();

    // Filtrar resultados cuando hay texto en el input
    const resultados = valorBuscar === "" ? inventarioData :
      inventarioData.filter(inventario =>
        inventario.nombre_producto.toLowerCase().includes(valorBuscar) ||
        (inventario.precio_venta ? inventario.precio_venta.toString().toLowerCase() : "").includes(valorBuscar.toLowerCase()) || (inventario.cantidad ? inventario.cantidad.toString().toLowerCase() : "").includes(valorBuscar.toLowerCase())
      );

    // Mostrar resultados filtrados o todos los inventario si el input está vacío
    mostrarInventario(resultados);

  });
  // Función para mostrar inventario en la tabla
  function mostrarInventario(data) {
    const tableBody = document.getElementById('tabla_inventario');
    tableBody.innerHTML = '';  // Limpiar tabla

    if (data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='12' style='text-align: center;'>No hay resultados</td></tr>";
    } else {
      data.forEach(inventario => {
        const row = `<tr>
       <td style="display: none;">${inventario.producto_id}</td>
        <td> ${inventario.nombre_producto}</td>
        <td> ${inventario.precio_venta}</td>
        <td> ${inventario.cantidad}</td>
        <td style="display: none;"><img src="${inventario.imagen_url}" alt="producto" class="mini-imgInsumo"></td>
        <td style="display: none;">${inventario.produccion_id}</td>
        <td class="btn-acciones">
            <button class="btn-produccion" data-id="${inventario.producto_id}">
                <i class="material-icons">compost</i>
            </button>
            <button class="btn-darbaja" data-id="${inventario.producto_id}">
                <i class="material-icons">delete</i>
            </button>
        </td>

      </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
      });
    }
  }


  // Delegacion a modal de produccion
  // Agregar event listener para delegación de eventos
  document.getElementById('tabla_inventario').addEventListener('click', function (event) {
    if (event.target.closest('.btn-produccion')) {
      const button = event.target.closest('.btn-produccion');
      const plantasProductionID = button.getAttribute('data-id');
      console.log("Planta ID produccion:", plantasProductionID);

      // ABRIR Y OBTENER DATOS PARA EL MODAL
      //Obtener datos para mostrar en el modal de editar
      const modalproduccion = document.getElementById("ModalProduccion");
      const inputIdproduccion = document.getElementById("idProduccion");
      const inputNombreproduccion = document.getElementById("nombreProductoproduccion")
      const inputPrecio = document.getElementById("precioProducto")

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
      const Idproduccion = row.cells[0].innerText;
      const nombre_producto = row.cells[1].innerText;
      const precio_venta = row.cells[2].innerText;
      const cantidad = row.cells[3].innerText;
      const imagen = row.cells[4].innerText;

      console.log("este es el id", Idproduccion);
      // Rellenar los campos del modal con los datos obtenidos
      inputIdproduccion.value = Idproduccion;
      inputIdproduccion.textContent = Idproduccion;

      console.log("este es el id", inputIdproduccion);

      inputNombreproduccion.value = nombre_producto;
      inputNombreproduccion.textContent = nombre_producto;

      inputPrecio.value = precio_venta;
      inputPrecio.textContent = precio_venta;



      // Establecer la fecha en el <p>
      fechaElemento.textContent = fechaFormateada;
      // ABRIR MODAL Y MOSTRAR LA IMAGEN
      const modalProduccion = document.getElementById("ModalProduccion");
      const modalImg = document.querySelector(".imgProduccion");

      if (imgSrc && imgSrc.trim() !== "") {
        modalImg.src = imgSrc; // Actualizar la imagen del modal
      } else {
        modalImg.src = "/static/img/pordefecto.png";
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



  //Delegacion de eventos para el boton de dar de baja
  document.getElementById('tabla_inventario').addEventListener('click', function (event) {
    if (event.target.closest('.btn-darbaja')) {
      const button = event.target.closest('.btn-darbaja');
      const producto_id = button.getAttribute('data-id');
      console.log("Planta ID produccion:", producto_id);

      // ABRIR Y OBTENER DATOS PARA EL MODAL
      //Obtener datos para mostrar en el modal de editar
      const modalbaja = document.getElementById("ModalBaja");
      const inputIdproduccion = document.getElementById("id_producto_baja");
      const inputNombreproduccion = document.getElementById("nombreProductoBaja");
      const inputPrecio = document.getElementById("precioProductoBaja");
      const inputCantidad = document.getElementById("cantidad");


      // Obtener el elemento <p>
      const fechaElemento = document.querySelector('.fecha-cont .fecha_baja p');

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
      const Idproduccion = row.cells[0].innerText;
      const nombre_producto = row.cells[1].innerText;
      const precio_venta = row.cells[2].innerText;
      const cantidad = row.cells[3].innerText;
      const imagen = row.cells[4].innerText;

      console.log("este es el id", Idproduccion);
      // Rellenar los campos del modal con los datos obtenidos
      inputIdproduccion.value = Idproduccion;
      inputIdproduccion.textContent = Idproduccion;


      inputNombreproduccion.value = nombre_producto;
      inputNombreproduccion.textContent = nombre_producto;

      inputPrecio.value = precio_venta;
      inputPrecio.textContent = precio_venta;




      // Establecer la fecha en el <p>
      fechaElemento.textContent = fechaFormateada;
      // ABRIR MODAL Y MOSTRAR LA IMAGEN
      const modalProduccion = document.getElementById("ModalBaja");
      const modalImg = document.querySelector(".imgBaja");

      if (imgSrc) {
        modalImg.src = imgSrc; // Actualizar la imagen del modal
      }

      // Mostrar el modal
      modalbaja.style.display = "block";

      document.getElementById("btn-cancel-baja").addEventListener("click", function () {
        const modalbaja = document.getElementById("ModalBaja");
        modalbaja.style.display = "none";
      });
      document.getElementById("close-baja").addEventListener("click", function () {
        const modalbaja = document.getElementById("ModalBaja");
        console.log("esta en el btn de arriba");
        modalbaja.style.display = "none";
      });

    }
  });
});
