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

  // Agregar producto
  document.getElementById('btn-add-producto').addEventListener('click', function () {
    const modalproduccion = document.getElementById("ModalAgregarProducto");
    modalproduccion.style.display = "block";
    // Obtener el elemento <p>
    const fechaElemento = document.querySelector('.fecha-cont .fecha_agregar p');

    // Obtener la fecha actual
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Actualizar el contenido del <p> con la fecha actual
    fechaElemento.textContent = fechaFormateada;

    document.getElementById("btn-cancel-producto").addEventListener("click", function () {
      const modalproduccion = document.getElementById("ModalAgregarProducto");
      modalproduccion.style.display = "none";
    });
    document.getElementById("close-producto").addEventListener("click", function () {
      const modalproduccion = document.getElementById("ModalAgregarProducto");
      modalproduccion.style.display = "none";
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
        (inventario.precio_venta ? inventario.precio_venta.toString().toLowerCase() : "").includes(valorBuscar.toLowerCase()) || (inventario.cantidad ? inventario.cantidad.toString().toLowerCase() : "").includes(valorBuscar.toLowerCase()) ||
        (inventario.unidad_medida ? inventario.unidad_medida.toString().toLowerCase() : "").includes(valorBuscar.toLowerCase())
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
        <td style="display: none;" ><img src="${inventario.imagen_url}" alt="producto" class="mini-imgInsumo"></td>
        <td style="display: none;">${inventario.produccion_id}</td>
        <td style="display: none;" class="tipoProducto">${inventario.tipo_producto}</td>                    
        <td style="display: none;" class="unidad_medida">${inventario.unidad_medida}</td>

        <td class="btn-acciones">
            <button class="btn-produccion" data-id="${inventario.producto_id}">
                <i class="material-icons">compost</i>
            </button>
            
            <button class="btn-baja-produccion" data-id="${inventario.producto_id}">
                <i class="material-symbols-outlined">grocery</i>
            </button>

            <button class="btn-darbaja" data-id="${inventario.producto_id}">
                <i class="material-icons">delete</i>
            </button>
        </td>

      </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
      });

      const tipoProductoElements = document.querySelectorAll('.tipoProducto');
      tipoProductoElements.forEach((tipoProducto, index) => {
        if (tipoProducto.textContent.trim() === "insumo") {
          const botonesProduccion = document.querySelectorAll('.btn-produccion');
          if (botonesProduccion[index]) {
            botonesProduccion[index].style.display = "none";
          }
        }
      });
      
      const tipoProductoParaBaja = document.querySelectorAll(".tipoProducto");
      tipoProductoParaBaja.forEach((tipoProducto, index) => {
        if (tipoProducto.textContent.trim() === "planta") {
          const botonesBaja = document.querySelectorAll('.btn-baja-produccion');
          if (botonesBaja[index]) {
            botonesBaja[index].style.display = "none";
          }
        }
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
      const inputTipoProducto = document.getElementById("tipo_producto");

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
      const tipoProducto = row.cells[6].innerText;
      const unidad_medida = row.cells[7].innerText;

      console.log("este es el id", Idproduccion);
      // Rellenar los campos del modal con los datos obtenidos
      inputIdproduccion.value = Idproduccion;
      inputIdproduccion.textContent = Idproduccion;

      console.log("este es el id", inputIdproduccion);

      inputNombreproduccion.value = nombre_producto;
      inputNombreproduccion.textContent = nombre_producto;

      inputTipoProducto.value = tipoProducto;
      inputTipoProducto.textContent = tipoProducto;

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
      modalProduccion.style.display = "block";

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
      const inputTipoProducto = document.getElementById("tipo_producto_baja");
      const inputUnidadMedida = document.getElementById("unidad_medida_baja");



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
      const tipoProducto = row.cells[6].innerText;
      const unidad_medida = row.cells[7].innerText;


      console.log("este es el id", Idproduccion);
      // Rellenar los campos del modal con los datos obtenidos
      inputIdproduccion.value = Idproduccion;
      inputIdproduccion.textContent = Idproduccion;


      inputNombreproduccion.value = nombre_producto;
      inputNombreproduccion.textContent = nombre_producto;

      inputTipoProducto.value = tipoProducto;
      inputTipoProducto.textContent = tipoProducto;


      inputPrecio.value = precio_venta;
      inputPrecio.textContent = precio_venta;

      inputUnidadMedida.value = unidad_medida;
      inputUnidadMedida.textContent = unidad_medida;

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

  // Delegacion de eventos para el boton de baja a produccion
  document.getElementById('tabla_inventario').addEventListener('click', function (event) {
    if (event.target.closest('.btn-baja-produccion')) {
      const button = event.target.closest('.btn-baja-produccion');
      const producto_id = button.getAttribute('data-id');
      console.log("Planta ID produccion:", producto_id);

      // ABRIR Y OBTENER DATOS PARA EL MODAL
      //Obtener datos para mostrar en el modal de editar
      const modalbajaP = document.getElementById("ModalBajaProduccion");
      const inputIdproduccionP = document.getElementById("id_producto_bajaP");
      const inputNombreproduccionP = document.getElementById("nombreProductoBajaP");
      const inputPrecioP = document.getElementById("precioProductoBajaP");
      const inputCantidadP = document.getElementById("cantidad-bajaP");
      const inputTipoProductoP = document.getElementById("tipo_producto_bajaP");
      const inputUnidadMedidaP = document.getElementById("unidad_medida_bajaP");



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
      const IdproduccionP = row.cells[0].innerText;
      const nombre_productoP = row.cells[1].innerText;
      const precio_ventaP = row.cells[2].innerText;
      const cantidadP = row.cells[3].innerText;
      const imagenP = row.cells[4].innerText;
      const tipoProductoP = row.cells[6].innerText;
      const unidad_medidaP = row.cells[7].innerText;


      console.log("este es el id", IdproduccionP);
      // Rellenar los campos del modal con los datos obtenidos
      inputIdproduccionP.value = IdproduccionP;
      inputIdproduccionP.textContent = IdproduccionP;


      inputNombreproduccionP.value = nombre_productoP;
      inputNombreproduccionP.textContent = nombre_productoP;

      inputTipoProductoP.value = tipoProductoP;
      inputTipoProductoP.textContent = tipoProductoP;


      inputPrecioP.value = precio_ventaP;
      inputPrecioP.textContent = precio_ventaP;

      inputUnidadMedidaP.value = unidad_medidaP;
      inputUnidadMedidaP.textContent = unidad_medidaP;

      // Establecer la fecha en el <p>
      fechaElemento.textContent = fechaFormateada;
      // ABRIR MODAL Y MOSTRAR LA IMAGEN
      const modalBajaP = document.getElementById("ModalBajaProduccion");
      const modalImg = document.querySelector(".imgBajaP");

      if (imgSrc && imgSrc.trim() !== "") {
        modalImg.src = imgSrc; // Actualizar la imagen del modal
      } else {
        modalImg.src = "/static/img/pordefecto.png";
      }

      // Mostrar el modal
      modalBajaP.style.display = "block";


      document.getElementById("btn-cancel-bajaP").addEventListener("click", function () {
        const modalBajaP = document.getElementById("ModalBajaProduccion");
        modalBajaP.style.display = "none";
      });
      document.getElementById("close-bajaP").addEventListener("click", function () {
        const modalBajaP = document.getElementById("ModalBajaProduccion");
        console.log("esta en el btn de arriba");
        modalBajaP.style.display = "none";
      });

    }
  });

  document.getElementById('idProd').addEventListener('change', function () {
    const tipo = this.options[this.selectedIndex].getAttribute('data-tipo');
    document.getElementById('tipoProducto').value = tipo;
  });
});
