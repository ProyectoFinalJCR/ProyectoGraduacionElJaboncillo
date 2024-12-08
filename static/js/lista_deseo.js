document.addEventListener('DOMContentLoaded', function () {
    // Añadir evento a todos los botones "Ver detalles"
    document.querySelectorAll(".modal-detalle-btn").forEach(button => {
        button.addEventListener("click", function () {
            document.querySelector(".modal-lista-deseo").style.display = "block";
            const listaDeseoId = this.getAttribute("data-id");
            fetchDetallesListaDeseo(listaDeseoId);
        });

        // Cerrar modal
        document.getElementById("close-modal-lista-deseo").addEventListener("click", function () {
            document.querySelector(".modal-lista-deseo").style.display = "none";
        });
        document.getElementById("btn-cancelar").addEventListener("click", function () {
            document.querySelector(".modal-lista-deseo").style.display = "none";
        });
    });

    // Función para ir a la venta
    document.getElementById("ir_a_venta").addEventListener("click", function () {
        const modal_lista_deseo = document.querySelector(".container-inputVenta");
        const modal_LD = document.querySelector(".modal-lista-deseo");
        modal_LD.style.display = "none";
        modal_lista_deseo.style.display = "block";


        const modal_ventas = document.querySelector(".container-inputVenta");
        // cerrar modal ventas
        document.getElementById("close-modal-ventas").addEventListener("click", function () {
            modal_ventas.style.display = "none";
        });

        document.getElementById("btn-cancel-venta").addEventListener("click", function () {
            modal_ventas.style.display = "none";
        }
        )
    });
    
    // buscar lista de deseo
    let listaData = [];
    // cargar datos una sola vez cuando se cargue la página
    fetch("/generar_json_lista_deseo")
        .then(response => response.json())
        .then(data => {
            listaData = data;
            console.log(listaData);
        })
        .catch(error => console.error("Error:", error));

    document.getElementById("search-lista").addEventListener("input", function () {
        const buscar = this.value.toLowerCase();
        console.log(buscar);

        // Filtrar lista de deseo por nombre
        const listaDeseoFiltrada = buscar === "" ? listaData :
            listaData.filter(item =>
               item.usuario_nombre.toLowerCase().includes(buscar) ||
                item.correo.toLowerCase().includes(buscar) ||
                item.fecha.toLowerCase().includes(buscar)
            );
        
            mostrarListaDeseo(listaDeseoFiltrada);  
        console.log(listaDeseoFiltrada);
    });

    // Función para mostrar los datos en la tabla
    function mostrarListaDeseo(data) {
        const tableBody = document.getElementById("lista-deseo-filtrada");
        tableBody.innerHTML = ""; // Limpiar contenido previo

        if (data.length === 0) {"<tr><td tyle='text-align: center;'>No hay resultados</td></tr>";
        }
        else {
            data.forEach(item => {
                let fechaFormateada = "";
                if (item.fecha) {
                const fecha = new Date(item.fecha);

                // Construir el formato "YYYY-MM-DD" requerido por <input type="date">
                const anio = fecha.getUTCFullYear();
                const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0'); // Mes comienza en 0
                const dia = fecha.getUTCDate().toString().padStart(2, '0');

                fechaFormateada = `${anio}-${mes}-${dia}`;
                item.fecha = fechaFormateada;
                }
                const row = `
                    <tr>
                        <td>${item.usuario_nombre}</td>
                        <td>${item.correo}</td>
                        <td>${item.fecha}</td>
                        <td class="btn-acciones">
                            <input type="hidden" id="id_anular" name="id_anular" value="${item.id}">
                            <button class="btn modal-detalle-btn" id="modal-detalle" data-id="${item.id}">
                                Ver detalles
                            </button>
                        </td>
                    </tr> `;

                tableBody.insertAdjacentHTML('beforeend', row);
            });
        }
    
    }
    // agregar delegacion de eventos btn ver detalles
    document.getElementById('lista-deseo-filtrada').addEventListener('click', function (event) {
        if (event.target.closest('.modal-detalle-btn')) {
            const button = event.target.closest('.modal-detalle-btn');
            const listaDeseoId = button.getAttribute('data-id');
            console.log("Lista de deseo ID:", listaDeseoId);

            document.querySelector(".modal-lista-deseo").style.display = "block";
            
            fetchDetallesListaDeseo(listaDeseoId);
            
            cargarDetallesListaDeseoEnVenta(listaDeseoId);
    
        }
    
    });
    // Función para obtener detalles del backend
    function fetchDetallesListaDeseo(id) {
        fetch("/verDetallesListaDeseo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_anular: id })
        })
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById("detalle-lista-deseo-body");
                tableBody.innerHTML = ""; // Limpia el contenido anterior

                // Verificar si hay un error
                if (data.error) {
                    tableBody.innerHTML = `<tr><td colspan="3">${data.error}</td></tr>`;
                } else {
                    // renderizar el nombre del cliente
                    document.querySelector('#nombre_completo').value = data[0].usuario_nombre;
                    // Renderizar cada producto
                    data.forEach((item, index) => {
                        const row = `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.producto_nombre}</td>
                            <td>${item.precio_venta}</td>	
                        </tr>
                    `;
                        tableBody.innerHTML += row;
                    });
                }
            })
            .catch(error => console.error("Error:", error));
    }
  

    // Función para cargar los detalles de la lista de deseos
    function cargarDetallesListaDeseoEnVenta(id) {
        fetch("/verDetallesListaDeseo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": "{{ csrf_token }}" // Si usas CSRF
            },
            body: JSON.stringify({ id_anular: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error); // Manejar errores
            } 
            else 
            {
                // Cargar datos en el modal de ventas
                document.getElementById("nombreCliente").value = data[0].usuario_nombre;

                // Agregar productos al listado de productos seleccionados en el modal
                const tableBody = document.querySelector("#lista-productos-seleccionados tbody");
                tableBody.innerHTML = "";

                data.forEach(item => {
                    const row = document.createElement("tr");
                
                    row.setAttribute("data-id", item.producto_id || ""); 
                    row.setAttribute("data-tipo", item.tipo_producto || "");

                    // Generar el contenido de la fila
                    row.innerHTML = `
                        <td>${item.producto_nombre}</td>
                        <td>
                            <input type="number" value="1" min="1" class="input-tabla input-cantidad">
                        </td>
                        <td>
                            <input type="number" value="${item.precio_venta}" min="0" class="input-tabla input-precio">
                        </td>
                        <td class="subtotal-producto">${item.precio_venta.toFixed(2)}</td>
                        <td>
                            <button type="button" class="btn-eliminar-producto">Eliminar</button>
                        </td>
                    `;
                
                    // Agregar la fila al cuerpo de la tabla
                    tableBody.appendChild(row);
                    actualizarTotales();
                });
                

                // Actualizar subtotales al cambiar cantidad o precio
                tableBody.querySelectorAll("tr").forEach(row => {
                const cantidadInput = row.querySelector(".input-cantidad");
                const precioInput = row.querySelector(".input-precio");
                const subtotalCell = row.querySelector(".subtotal-producto");
                const eliminarBtn = row.querySelector(".btn-eliminar-producto");

                        // Función para actualizar el subtotal
                        const actualizarSubtotal = () => {
                            const cantidad = parseFloat(cantidadInput.value) || 0;
                            const precio = parseFloat(precioInput.value) || 0;
                            const subtotal = cantidad * precio;
                            subtotalCell.textContent = subtotal.toFixed(2); // Mostrar con dos decimales
                        };

                        // Escuchar cambios en cantidad y precio
                        cantidadInput.addEventListener("input", actualizarSubtotal);
                        precioInput.addEventListener("input", actualizarSubtotal);

                // Calcular subtotal inicial
                agregarEventosActualizarTotales();
                actualizarSubtotal();

                // Función para eliminar la fila
                eliminarBtn.addEventListener("click", () => {
                    row.remove(); // Elimina la fila del DOM
                    actualizarTotales();
                });
             });

                // Mostrar el modal de ventas
                modalVenta.style.display = "block";
            }
        })
        .catch(error => console.error("Error:", error));
    }

    // Función para actualizar los totales (subtotal y total)
    function actualizarTotales() {
        const tableBody = document.querySelector("#lista-productos-seleccionados tbody");
        let subtotalGeneral = 0; 

        tableBody.querySelectorAll("tr").forEach(row => {
            const cantidadInput = row.querySelector(".input-cantidad");
            const precioInput = row.querySelector(".input-precio");

            const cantidad = parseFloat(cantidadInput.value) || 0;
            const precio = parseFloat(precioInput.value) || 0;

            // Calcular el subtotal de la fila
            const subtotalProducto = cantidad * precio;

            subtotalGeneral += subtotalProducto;
        });

        // Asignar los valores a los inputs de subtotal y total
        const subtotalInput = document.getElementById("subtotal");
        const totalInput = document.getElementById("total");

        subtotalInput.value = subtotalGeneral.toFixed(2);
        totalInput.value = subtotalGeneral.toFixed(2);
    }
    
    // Función para agregar eventos dinámicamente
    function agregarEventosActualizarTotales() {
        const tableBody = document.querySelector("#lista-productos-seleccionados tbody");
    
        tableBody.querySelectorAll("tr").forEach(row => {
            const cantidadInput = row.querySelector(".input-cantidad");
            const precioInput = row.querySelector(".input-precio");
        
            // Escuchar cambios en cantidad y precio para recalcular totales
            cantidadInput.addEventListener("input", actualizarTotales);
            precioInput.addEventListener("input", actualizarTotales);
        });
    }

    // MANDAR A LLAMAR LOS PRODUCTOS AL DROPDOWN LIST 

    $(document).ready(function () {
        let productos = [];
        $('#subcategoria-selectLista').change(function () {
            console.log('entrando en el evento de lista de deseos')
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

    document.getElementById("form-venta").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevenir el envío predeterminado del formulario
    
        const form = this;
    
        // Obtener los datos de los productos seleccionados en la tabla
        const productos = [];
        document.querySelectorAll("#lista-productos-seleccionados tbody tr").forEach((row, index) => {
            const productoId = row.getAttribute("data-id");
            const productoTipo = row.getAttribute("data-tipo");
            const productoNombre = row.querySelector("td:nth-child(1)").textContent.trim();
            const cantidad = row.querySelector(".input-cantidad").value;
            const precio = row.querySelector(".input-precio").value;
            const subtotal = row.querySelector(".subtotal-producto").textContent;
    
            productos.push({
                id: productoId,
                tipo: productoTipo,
                nombre: productoNombre,
                cantidad: cantidad,
                precio: precio,
                subtotal: subtotal
            });
        });
    
        // Validar que al menos un producto fue agregado
        if (productos.length === 0) {
            alert("Debe agregar al menos un producto.");
            return;
        }
    
        // Crear campos ocultos para cada producto
        productos.forEach((producto, index) => {
            for (const [key, value] of Object.entries(producto)) {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = `productos[${index}][${key}]`;
                input.value = value;
                form.appendChild(input);
            }
        });
    
        // Enviar el formulario
        form.submit();
    });
    
    // Cerrar el modal de ventas
    btnCloseModalVenta.addEventListener("click", function () {
        modalVenta.style.display = "none";
        
    });

    btnCancelVenta.addEventListener("click", function () {
        modalVenta.style.display = "none";
    });

})