document.addEventListener("DOMContentLoaded", function () {
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1;
    const table = document.getElementById("data-table");
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.rows);
    const totalPages = Math.ceil(rows.length / rowsPerPage);

    const renderTable = (page) => {
        tbody.innerHTML = ""; // Limpia las filas visibles
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const rowsToDisplay = rows.slice(start, end);

        rowsToDisplay.forEach((row) => tbody.appendChild(row));

        document.getElementById("page-info").textContent = `Page ${page} of ${totalPages}`;
        document.getElementById("prev-page").disabled = page === 1;
        document.getElementById("next-page").disabled = page === totalPages;
    };

    document.getElementById("prev-page").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable(currentPage);
        }
    });

    document.getElementById("next-page").addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable(currentPage);
        }
    });

    renderTable(currentPage); // Renderiza la primera página

    // buscar ventas
    let ventas = [];
    fetch("/generar_json_ventas")
        .then(response => response.json())
        .then(data => {
            ventas = data;
            console.log(ventas);
            mostrarVentas(ventas);  // Mostrar todos los ventas inicialmente
        });

        //escuchar evento para buscar ventas
    document.getElementById("buscar_ventas").addEventListener('input', function () {
        const valorBuscar = this.value.toLowerCase();
        console.log(valorBuscar);
        // Filtrar resultados cuando hay texto en el input
        const resultados = valorBuscar === "" ? ventas :
            ventas.filter(venta =>
                venta.id.toString().toLowerCase().includes(valorBuscar) ||
                venta.nombre.toLowerCase().includes(valorBuscar) ||
                venta.fecha.toLowerCase().includes(valorBuscar) ||
                venta.total.toString().toLowerCase().includes(valorBuscar) // Convertir el total a texto
            );

        // Mostrar resultados filtrados o todos los ventas si el input está vacío
        mostrarVentas(resultados);
    });

    // Función para mostrar ventas en la tabla
    function mostrarVentas(data) {
        const tableBody = document.getElementById('tabla_ventas');
        tableBody.innerHTML = '';  // Limpiar tabla

        if (data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='12' style='text-align: center;'>No hay resultados</td></tr>";
        } else {
            data.forEach(venta => {
                        let fechaFormateada = "";
                if (venta.fecha) {
                const fecha = new Date(venta.fecha);

                // Construir el formato "YYYY-MM-DD" requerido por <input type="date">
                const anio = fecha.getUTCFullYear();
                const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0'); // Mes comienza en 0
                const dia = fecha.getUTCDate().toString().padStart(2, '0');

                fechaFormateada = `${anio}-${mes}-${dia}`;
                venta.fecha = fechaFormateada;
                }
                const row = `
            <tr>
                <td>${venta.id}</td>
                <td>${venta.nombre}</td>
                <td>${venta.fecha}</td>
                <td>${venta.total}</td>
                <td class="btn-acciones"> 
                    <button class="btn-detalle-venta" data-id="${venta.id}">
                       Ver detalles
                    </button>
                    <form action="/anularVenta" method="post" class="form-anular">
                        <input type="hidden" class="id_anular" name="id_anular" value="${venta.id}">
                        <button class="btn-delete" type="submit">
                            <i class="material-icons">delete</i>
                        </button>
                    </form>
                </td>
            </tr>`;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        }
    }

    //agregar delegacion de eventos btn ver detalles
    document.getElementById('tabla_ventas').addEventListener('click', function (event) {
        if (event.target.closest('.btn-detalle-venta')) {
            const button = event.target.closest('.btn-detalle-venta');
            const ventaId = button.getAttribute('data-id');
            console.log("ID de venta a editar:", ventaId);

            // Mostrar el modal
            const modal = document.getElementById("ModalDetalleVentas");
            modal.style.display = "block";
    
            // Obtener los detalles de la venta
            fetchDetalleVentas(ventaId);
        }
    });
    // funcion para obtener los detalles de la venta
    function fetchDetalleVentas(id) {
        fetch("/obtener_venta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_venta: id }),
        })
            .then((response) => response.json())
            .then((data) => {
                const tableBody = document.getElementById("detalle-venta-body");
                console.log(data);
                // Limpiar contenido previo
                tableBody.innerHTML = "";
    
                if (data.length === 0) {
                   
                    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No se encontraron detalles para esta venta</td></tr>`;
                } else {
                     // Renderizar los detalles
                     data.forEach((item, index) => {
                        const row = `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.nombre}</td>
                            <td>${item.cantidad}</td>
                            <td>C$ ${parseFloat(item.precio).toFixed(2)}</td>
                            <td>C$ ${parseFloat(item.subtotal).toFixed(2)}</td>
                        </tr>`;
                        tableBody.insertAdjacentHTML("beforeend", row);
                    });
                }
            })
            .catch((error) => {
                console.error("Error al obtener los detalles:", error);
            });
    }
    
    // Cerrar el modal
    document.getElementById("close-modal-ventas").addEventListener("click", function () {
        const modal = document.getElementById("ModalDetalleVentas");
        modal.style.display = "none";
    });
    
    document.getElementById("btn-cancelar-ventas").addEventListener("click", function () {
        const modal = document.getElementById("ModalDetalleVentas");
        modal.style.display = "none";
    });

    //Evento para mostrar formulario
    const btneditar = document.querySelector('.btn-add-venta').addEventListener('click', function(){

        const inputFecha = document.getElementById("fecha_venta");
        const hoy = new Date();
    
        // Obtén día, mes y año
        const dia = hoy.getDate();
        const mes = hoy.toLocaleString('default', { month: 'long' }); // Nombre completo del mes
        const anio = hoy.getFullYear();
    
        // Formatea la fecha
        const fechaFormateada = `${dia} de ${mes} del ${anio}`;
        inputFecha.value = fechaFormateada;

        console.log(btneditar)
      const container_table_inputs = document.querySelector(".container-inputVenta");  
        container_table_inputs.style.display = "block";
        document.getElementById("btn-cancel").addEventListener("click", function () {
            container_table_inputs.style.display = "none";

        });
        document.getElementsByClassName("close-modal-venta")[0].addEventListener("click", function () {
            const container_table_inputs = document.querySelector(".container-inputVenta");

            container_table_inputs.style.display = "none";
        });
        const Validarinputs = document.querySelectorAll('.validar-input');

        Validarinputs.forEach(input => {
            input.addEventListener('input', function () {
                if (this.value < 0) {
                    this.value = 0; // Restablece a 0 si es negativo
                }
                // Verificar si el valor es un número válido
                if (!/^\d*\.?\d*$/.test(this.value)) {
                    this.value = this.value.slice(0, -1); // Elimina el último carácter inválido
                }
            });
        });
    });

    $(document).ready(function () {
        let productos = [];
        $('#subcategoria-select').change(function () {
            const subcategoria = $(this).val();

            $.ajax({
                url: "/get_products",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ subcategoria: subcategoria }),
                success: function (data) {
                    productos = data;
                    $('#producto').empty();

                    if (productos.length === 0) {
                        console.log("No hay productos disponibles");
                        $('#producto').append(new Option("No hay productos disponibles", ''));
                    }
                    else {
                        $('#producto').append(new Option("Seleccione un producto", ''));
                        productos.forEach(function (producto) {
                            $('#producto').append(new Option(producto.nombre, producto.id));
                        });
                    }
                }
            });
        });

        // Mostrar el precio del producto seleccionado
        $('#producto').change(function () {
            const selectedProductId = $(this).val();

            // Buscar el producto en la lista de productos obtenidos anteriormente
            const selectedProduct = productos.find(producto => producto.id == selectedProductId);

            // Si el producto existe, actualizar el campo de precio
            if (selectedProduct) {
                $('#precio').val(selectedProduct.precio);
                $('#idProd').val(selectedProduct.idProd);
                $('#cantidadDispo').val(selectedProduct.cantidad);
                $('#tipoProducto').val(selectedProduct.tipo);
            } else {
                $('#precio').val('');
                $('#idProd').val('');
                $('#cantidadDispo').val('');
                $('#tipoProducto').val('');
            }
        });
    });

    const productosSeleccionados = document.querySelector('#lista-productos-seleccionados tbody');
    const idInput = document.querySelector('#idProd');
    const tipoInput = document.querySelector('#tipoProducto');
    const productoInput = document.querySelector('#producto');
    const cantidadDispoInput = document.querySelector('#cantidadDispo');
    const cantidadInput = document.querySelector('#cantidad');
    const precioInput = document.querySelector('#precio');
    const subtotalInput = document.querySelector('#subtotal');
    const totalInput = document.querySelector('#total');
    const botonAgregar = document.querySelector('#agregar_producto');
    const form = document.querySelector('#form-venta');
    const productosDinamicos = document.querySelector('#productos-dinamicos');
    const color = document.querySelector('#color-select')
    const medida = document.querySelector('#medida-select')
    const unidad = document.querySelector('#unidad-select')
    const clienteCategoria = document.querySelector('tipoCliente-select')
    let articulosLista = [];

    listaEventListeners();

    function listaEventListeners() {
        botonAgregar.addEventListener("click", agregarProducto);
        productosSeleccionados.addEventListener("click", eliminarProducto);
    }

    function agregarProducto(e) {
        e.preventDefault();

        const unidadSeleccionada = unidad.options[unidad.selectedIndex]?.value || '';
        const colorSeleccionado = color.options[color.selectedIndex]?.text || '';
        const medidaSeleccionada = medida.options[medida.selectedIndex]?.text || '';
        let nombreCompletoProducto = '';

        // Evaluar las combinaciones posibles
        if (colorSeleccionado != 'Selecciona una caracteristica' && medidaSeleccionada != 'Selecciona una caracteristica') {
            // Si ambos están seleccionados
            nombreCompletoProducto = `${productoInput.options[productoInput.selectedIndex].text} - ${colorSeleccionado} - ${medidaSeleccionada}`;
        } else if (colorSeleccionado != 'Selecciona una caracteristica') {
            // Solo color seleccionado
            nombreCompletoProducto = `${productoInput.options[productoInput.selectedIndex].text} - ${colorSeleccionado}`;
        } else if (medidaSeleccionada != 'Selecciona una caracteristica') {
            // Solo medida seleccionada
            nombreCompletoProducto = `${productoInput.options[productoInput.selectedIndex].text} - ${medidaSeleccionada}`;
        } else {
            // Ninguno seleccionado
            nombreCompletoProducto = `${productoInput.options[productoInput.selectedIndex].text}`;
        }

        // Leer información del producto desde los inputs
        const infoProducto = {
            id: parseFloat(idInput.value) || 0,
            tipo: tipoInput.value || '',
            nombre: nombreCompletoProducto,
            precio: parseFloat(precioInput.value) || 0,
            cantidad: parseInt(cantidadInput.value) || 1,
            unidad: unidadSeleccionada || '',
        };


        if (!infoProducto.nombre || infoProducto.precio <= 0 || infoProducto.cantidad <= 0) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor, ingrese datos válidos para el producto.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }


        const cantidadDisponible = parseInt(cantidadDispoInput.value) || 0;

        if (infoProducto.cantidad > cantidadDisponible) {
            Swal.fire({
                title: 'Stock insuficiente',
                text: `Solo hay ${cantidadDisponible} unidades disponibles para este producto.`,
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Verificar si el producto ya existe en la lista
        const existeProducto = articulosLista.some(producto => producto.nombre === infoProducto.nombre);

        if (existeProducto) {
            // Si ya existe, verificar que la suma de cantidades no exceda el stock disponible
            articulosLista = articulosLista.map(producto => {
                if (producto.nombre === infoProducto.nombre) {
                    const nuevaCantidad = producto.cantidad + infoProducto.cantidad;
                
                    if (nuevaCantidad > cantidadDisponible) {
                        Swal.fire({
                            title: 'Stock insuficiente',
                            text: `No puedes agregar ${infoProducto.cantidad} unidades. Solo quedan ${cantidadDisponible - producto.cantidad} disponibles.`,
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                        return producto; // Retorna el producto sin cambios
                    }
                
                    producto.cantidad = nuevaCantidad; // Actualiza la cantidad si es válida
                }
                return producto;
            });
        } else {
            // Si no existe, agregarlo al arreglo
            articulosLista = [...articulosLista, infoProducto];
        }


        // console.log(articulosLista);
        actualizarTabla();
    }

    function actualizarTabla() {
        cantidadInput.value = '';
        precioInput.value = '';
        limpiarListaHtml();

        articulosLista.forEach(producto => {
            const { id, nombre, precio, cantidad, unidad } = producto;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="display: none;">${id}</td>
                <td> ${nombre}</td>
                <td> ${cantidad} <span>${unidad}</span></td>
                <td> ${precio}</td>
                <td> ${(cantidad * precio).toFixed(2)}</td>
                <td class="btn-acciones">
                    <div class="btn-delete">
                        <i class="material-icons eliminar_producto" data-id=${id}>delete</i>
                    </div>
                </td>
            `;

            subtotalInput.value = `${articulosLista.reduce((acum, producto) => acum + (producto.cantidad * producto.precio), 0).toFixed(2)}`;
            totalInput.value = `${articulosLista.reduce((acum, producto) => acum + (producto.cantidad * producto.precio), 0).toFixed(2)}`;


            productosSeleccionados.appendChild(row);
        });
    }

    // Funcion para eliminar un articulo del carrito
    function eliminarProducto(e) {
        if (e.target.classList.contains("eliminar_producto")) {
            const productoId = e.target.getAttribute("data-id");

            //en este nuevo arreglo es igual al los articulos excepto el que queremos eliminar
            articulosLista = articulosLista.filter(producto => producto.id !== parseInt(productoId, 10));

            // Actualizar el carrito en el DOM
            actualizarTabla();
        }
    }

    //Funcion para limpiar el html de carrito
    function limpiarListaHtml() {

        while (productosSeleccionados.firstChild) {
            productosSeleccionados.removeChild(productosSeleccionados.firstChild);
        }
    }

    form.addEventListener('submit', (e) => {
        // e.preventDefault();
        productosDinamicos.innerHTML = '';

        articulosLista.forEach((producto, index) => {
            Object.keys(producto).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = `productos[${index}][${key}]`;
                input.value = producto[key];
                productosDinamicos.appendChild(input);
            });
        });

        console.log(productosDinamicos.innerHTML);
    });

    
});