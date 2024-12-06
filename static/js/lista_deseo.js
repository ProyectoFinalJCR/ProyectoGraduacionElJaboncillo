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

    // Evento para cargar detalles de lista de deseos en el modal de ventas
    document.querySelectorAll(".modal-detalle-btn").forEach(button => {
        button.addEventListener("click", function () {
            const listaDeseoId = this.getAttribute("data-id");
            cargarDetallesListaDeseoEnVenta(listaDeseoId);
        });
    });

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
            } else {
                // Cargar datos en el modal de ventas
                document.getElementById("nombreCliente").value = data[0].usuario_nombre;

                // Agregar productos al listado de productos seleccionados en el modal
                const tableBody = document.querySelector("#lista-productos-seleccionados tbody");
                tableBody.innerHTML = ""; // Limpiar contenido previo

                data.forEach(item => {
                    const row = `
                        <tr>
                            <td>${item.producto_nombre}</td>
                            <td>
                                <input type="number" value="1" min="1" class="input-tabla input-cantidad">
                            </td>
                            <td>
                                <input type="number" value="${item.precio_venta}" min="0" class="input-tabla input-precio">
                            </td>
                            <td class="subtotal-producto"></td>
                            <td>
                                <button type="button" class="btn-eliminar-producto">Eliminar</button>
                            </td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
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
                actualizarSubtotal();

                // Función para eliminar la fila
                eliminarBtn.addEventListener("click", () => {
                    row.remove(); // Elimina la fila del DOM
                });
             });

                // Mostrar el modal de ventas
                modalVenta.style.display = "block";
            }
        })
        .catch(error => console.error("Error:", error));
    }

    // Cerrar el modal de ventas
    btnCloseModalVenta.addEventListener("click", function () {
        modalVenta.style.display = "none";
        
    });

    btnCancelVenta.addEventListener("click", function () {
        modalVenta.style.display = "none";
    });


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
})