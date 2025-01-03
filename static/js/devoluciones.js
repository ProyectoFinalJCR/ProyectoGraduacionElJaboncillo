document.addEventListener('DOMContentLoaded', function () {

    // añadir evento para todos los botones "Ver detalles"
    document.querySelectorAll(".btn-detalle-devolucion").forEach(button => {
        button.addEventListener("click", function () {
            document.querySelector(".modal-devoluciones").style.display = "block";
            const devolucionId = this.getAttribute("data-idDev");
            fetchDetalleDevoluciones(devolucionId);
        });

        // Cerrar modal
        document.getElementById("close-modal-devoluciones").addEventListener("click", function () {
            document.querySelector(".modal-devoluciones").style.display = "none";
        });
        document.getElementById("btn-cancelar-devoluciones").addEventListener("click", function () {
            document.querySelector(".modal-devoluciones").style.display = "none";
        });
    });
    //buscar devoluciones
    let devolucionesData = [];
    // cargar datos una sola vez cuando se cargue la página
    fetch(`/generar_json_devoluciones`)
    .then(response => response.json())
    .then(data => {
        devolucionesData = data;
        console.log(devolucionesData);
        });

    //escuchar evento busqueda en el input de buscar
    document.getElementById("buscar-devoluciones").addEventListener("input", function () {
        const valorBuscar = this.value.toLowerCase();
        // Filtrar resultados cuando hay texto en el input
        const resultados = valorBuscar === "" ? devolucionesData :
        devolucionesData.filter(devolucion =>
                devolucion.venta_id.toString().toLowerCase().includes(valorBuscar) ||
                devolucion.cliente.toLowerCase().includes(valorBuscar) ||
                devolucion.vendedor.toLowerCase().includes(valorBuscar) ||
                devolucion.fecha.toLowerCase().includes(valorBuscar) ||
                devolucion.motivo.toLowerCase().includes(valorBuscar)
            );

        mostrarDevoluciones(resultados);
    });

    // Función para mostrar los datos en la tabla
    function mostrarDevoluciones(data) {
        const tableBody = document.getElementById('tabla_devoluciones');
        tableBody.innerHTML = '';  // Limpiar tabla

        if (data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='12' style='text-align: center;'>No hay resultados</td></tr>";
        } else {
            data.forEach(devolucion => {
                let fechaFormateada = "";
                if (devolucion.fecha) {
                const fecha = new Date(devolucion.fecha);

                // Construir el formato "YYYY-MM-DD" requerido por <input type="date">
                const anio = fecha.getUTCFullYear();
                const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0'); // Mes comienza en 0
                const dia = fecha.getUTCDate().toString().padStart(2, '0');

                fechaFormateada = `${anio}-${mes}-${dia}`;
                devolucion.fecha = fechaFormateada;
                }
                const row = `
                    <tr>
                        <td>${devolucion.venta_id}</td>
                        <td>${devolucion.cliente}</td>
                        <td>${devolucion.vendedor}</td>
                        <td>${devolucion.fecha}</td>
                        <td>${devolucion.motivo}</td>
                       <td>
                        <button type="button" class="btn-detalle-devolucion" data-idDev="${devolucion.venta_id}">Ver detalle</button>
                    </td>  
                `
                tableBody.insertAdjacentHTML('beforeend', row);
                
            });
        }
    }
    // agregar delegacion de eventos btn ver detalles
    document.getElementById('tabla_devoluciones').addEventListener('click', function (event) {
        if (event.target.closest('.btn-detalle-devolucion')) {
            const button = event.target.closest('.btn-detalle-devolucion');
            const devolucionId = button.getAttribute('data-idDev');
            console.log("ID de devolucion a editar:", devolucionId);
            
            fetchDetalleDevoluciones(devolucionId);
            document.querySelector(".modal-devoluciones").style.display = "block";
        }

    });

    //funcion para obtener los detalles de la devolucion
    function fetchDetalleDevoluciones(id) {
        fetch("/obtener_devolucion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ idDev: id })
        })
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById("detalle-devolucion-body");
                tableBody.innerHTML = ""; // Limpiar el contenido anterior
                // Verificar si hay un error
                if (data === 0) {
                    tableBody.innerHTML = `<tr><td colspan="3">No se encontró la devolución</td></tr>`;
                } else {
                    // Renderizar cada producto
                    data.forEach((item, index) => {
                        const row = `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.tipo_movimiento}</td>
                            <td>${item.producto}</td>
                            <td>${item.cantidad}</td>
                            <td>${item.precio}</td>
                            <td>${item.subtotal}</td>
                        </tr>
                    `;
                        tableBody.insertAdjacentHTML('beforeend', row);
                    });
                }
            })
            .catch(error => console.error("Error:", error));
    }





















    document.querySelector('.btn-add-devolucion').addEventListener('click', function () {
        const container_table_inputs = document.querySelector(".container-inputDevolucion");
        container_table_inputs.style.display = "block";

        //obtener fecha actual
        const inputFecha = document.getElementById("fecha_devolucion");
        const hoy = new Date();

        // Obtén día, mes y año
        const dia = hoy.getDate();
        const mes = hoy.toLocaleString('default', { month: 'long' }); // Nombre completo del mes
        const anio = hoy.getFullYear();

        // Formatea la fecha
        const fechaFormateada = `${dia} de ${mes} del ${anio}`;
        inputFecha.value = fechaFormateada;


        document.getElementById("btn-cancel").addEventListener("click", function () {
            container_table_inputs.style.display = "none";
        });
        document.getElementsByClassName("close-modal-venta")[0].addEventListener("click", function () {
            container_table_inputs.style.display = "none";
        });
    });

    $(document).ready(function () {
        $('#lista-productos-seleccionados').on('input', '.cantidad-input', function () {
            actualizarTotales();
        });

        let ventas = [];
        $('#idVenta').click(function () {
            const idVenta = $('input[type="number"]').val();
            console.log('entro en el evento')
            $.ajax({
                url: "/obtener_ventas",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ idVenta: idVenta }),
                success: function (data) {
                    ventas = data;
                    $('#infoPrueba').empty();
                    $('#lista-productos-seleccionados tbody').empty()
                    if (ventas.length === 0) {
                        // Si no hay productos disponibles
                        $('#lista-productos-seleccionados tbody').append('<tr><td colspan="5">No existe la venta o ya se realizo una devolucion asociada a esa venta </td></tr>');
                    } else {
                        // Limpiar la tabla antes de volver a llenarla
                        $('#lista-productos-seleccionados tbody').empty();
                        // Si hay productos, agregar una fila para cada uno
                        ventas.forEach(function (venta) {
                            // Crear una nueva fila para cada producto
                            let fila = $('<tr>');

                            // Crear las celdas para Producto, Cantidad, Precio y Subtotal
                            let productoCelda = $('<td>').text(venta.nombre || 'Producto no disponible');
                            let tipo = $('<td hidden>').text(venta.tipo);

                            let cantidadCelda = $('<td>');
                            let cantidadInput = $('<input type="number" name="cantidadDev" min="0">')
                                .val(venta.cantidad || '0')
                                .attr('max', venta.cantidad)
                                .addClass('cantidad-input'); // Clase para identificar el input
                            cantidadCelda.append(cantidadInput);

                            let idProducto = $('<td hidden>').text(venta.idProd)
                            let precioCelda = $('<td>').text(venta.precio.toFixed(2) || '0.00');
                            let subtotalCelda = $('<td>').text((venta.cantidad * venta.precio).toFixed(2) || '0.00');

                            // Crear la celda de acciones (botón eliminar)
                            let accionesCelda = $('<td>');
                            let eliminarBtn = $('<button>')
                                .text('Eliminar')
                                .addClass('btn-eliminar')
                                .click(function () {
                                    $(this).closest('tr').remove();
                                    actualizarTotales(); // Recalcular totales
                                });

                            accionesCelda.append(eliminarBtn);

                            // Agregar todas las celdas a la fila
                            fila.append(productoCelda, cantidadCelda, precioCelda, subtotalCelda, idProducto, tipo, accionesCelda);

                            // Agregar la fila al tbody de la tabla
                            $('#lista-productos-seleccionados tbody').append(fila);

                            // Agregar lógica para actualizar el subtotal al cambiar la cantidad
                            cantidadInput.change(function () {
                                let cantidad = parseFloat($(this).val()) || 0;
                                let precio = parseFloat(precioCelda.text()) || 0;
                                let subtotal = (cantidad * precio).toFixed(2);

                                let maxCantidad = parseFloat($(this).attr('max')) || 0; // Obtener el máximo permitido

                                // Validar si la cantidad excede el máximo permitido
                                if (cantidad > maxCantidad) {
                                    Swal.fire({
                                        title: 'Advertencia',
                                        text: 'La cantidad no puede exceder el máximo permitido.',
                                        icon: 'warning',
                                        confirmButtonText: 'OK'
                                    }).then(() => {
                                        $(this).val(maxCantidad); // Restablecer al valor máximo permitido
                                        cantidad = maxCantidad; // Actualizar la cantidad para el cálculo del subtotal
                                    });
                                }

                                // Actualizar el subtotal en la celda correspondiente
                                subtotalCelda.text(subtotal);
                            });
                        });
                        // Llamar a actualizacionTotales aquí
                        actualizarTotales();
                    }

                }

            });
        });

        // Escuchar cambios en el select del motivo
        $('#movimiento-select').change(function () {
            const motivo = $(this).val();
            // Modificar el encabezado de la tabla
            const thead = $('#lista-productos-seleccionados thead');
            thead.empty(); // Limpiar encabezado anterior

            // Definir el encabezado base
            let encabezado = `
                <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>`;

            // Si el motivo es "Devolución por daños", agregar la columna adicional
            if (motivo == 6) {
                encabezado += `<th>Productos Dañados</th>`;
            }

            // Agregar siempre la columna de Acciones
            encabezado += `<th>Acciones</th></tr>`;

            // Actualizar el encabezado en la tabla
            thead.append(encabezado);


            // Limpiar la tabla antes de volver a llenarla
            $('#lista-productos-seleccionados tbody').empty();

            // Verificar si el motivo es "Devolución por daños"
            if (motivo == 6) {
                // Lógica para agregar productos a la tabla con columna de productos dañados
                ventas.forEach(function (venta) {
                    // Crear una nueva fila para cada producto
                    let fila = $('<tr>');

                    // Crear las celdas para Producto, Cantidad, Precio, Subtotal y Cantidad Dañados
                    let productoCelda = $('<td>').text(venta.nombre || 'Producto no disponible');
                    let tipo = $('<td hidden>').text(venta.tipo);
                    let cantidadCelda = $('<td>');
                    let cantidadInput = $('<input type="number" style="width: 100%; height:100%; border:none;" name="cantidadDev" min="0">')
                        .val(venta.cantidad || '0')
                        .attr('max', venta.cantidad || '0')
                        .addClass('cantidad-input'); // Clase para identificar el input
                    cantidadCelda.append(cantidadInput);

                    let idProductoCelda = $('<td>').text(venta.idProd).addClass('id-producto').css('display', 'none');

                    let precioCelda = $('<td>').text(venta.precio.toFixed(2) || '0.00');

                    let subtotalCelda = $('<td>').text((venta.cantidad * venta.precio).toFixed(2) || '0.00');

                    let cantidadDañadosCelda = $('<td>');
                    let cantidadDañadosInput = $('<input type="number" min="0" class="input input-plantas" placeholder="Dañados">')
                        .val(venta.dañados || '0')
                        .addClass('dañados-input'); // Clase para identificar los productos dañados
                    cantidadDañadosCelda.append(cantidadDañadosInput);

                    // Crear la celda de acciones (botón eliminar)
                    let accionesCelda = $('<td>');
                    let eliminarBtn = $('<button>')
                        .text('Eliminar')
                        .addClass('btn-eliminar')
                        .click(function () {
                            $(this).closest('tr').remove();
                            actualizarTotales(); // Recalcular totales
                        });
                    accionesCelda.append(eliminarBtn);
                    console.log(idProductoCelda)
                    // Agregar todas las celdas a la fila
                    fila.append(productoCelda, cantidadCelda, precioCelda, subtotalCelda, idProductoCelda, tipo, cantidadDañadosCelda, accionesCelda);

                    // Agregar la fila al tbody de la tabla
                    $('#lista-productos-seleccionados tbody').append(fila);

                    // Actualizar subtotal dinámicamente cuando cambie la cantidad
                    cantidadInput.change(function () {
                        let cantidad = parseFloat($(this).val()) || 0;
                        let precio = parseFloat(precioCelda.text()) || 0;
                        let subtotal = (cantidad * precio).toFixed(2);

                        let maxCantidad = parseFloat($(this).attr('max')) || 0; // Obtener el máximo permitido

                        // Validar si la cantidad excede el máximo permitido
                        if (cantidad > maxCantidad) {
                            Swal.fire({
                                title: 'Advertencia',
                                text: 'La cantidad no puede exceder el máximo permitido.',
                                icon: 'warning',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                $(this).val(maxCantidad); // Restablecer al valor máximo permitido
                                cantidad = maxCantidad; // Actualizar la cantidad para el cálculo del subtotal
                            });
                        }

                        // Actualizar el subtotal en la celda correspondiente
                        subtotalCelda.text(subtotal);
                    });

                    // Agregar lógica para manejar cambios en los productos dañados
                    cantidadDañadosInput.change(function () {
                        let dañados = parseFloat($(this).val()) || 0;

                        // Validar que los productos dañados no excedan la cantidad total
                        if (dañados > parseFloat(cantidadInput.val())) {
                            Swal.fire({
                            title: 'Advertencia',
                            text: 'La cantidad de productos dañados no puede exceder la cantidad total.',
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        }).then(() => {
                            $(this).val(0); // Restablecer el valor a 0 después de cerrar la alerta
                        });
                        }
                    });
                });
                // Llamar a actualizacionTotales aquí
                actualizarTotales
            } else {
                // Lógica para agregar productos sin la columna de productos dañados
                ventas.forEach(function (venta) {
                    let fila = $('<tr>');

                    let productoCelda = $('<td>').text(venta.nombre || 'Producto no disponible');
                    let tipo = $('<td hidden>').text(venta.tipo);
                    let cantidadCelda = $('<td>');
                    let cantidadInput = $('<input type="number" style="width: 100%; height:100%; border:none;" name="cantidadDev" min="0">')
                        .val(venta.cantidad || '0')
                        .attr('max', venta.cantidad || '0')
                        .addClass('cantidad-input');
                    cantidadCelda.append(cantidadInput);
                    let idProducto = $('<td hidden>').text(venta.idProd);
                    let precioCelda = $('<td>').text(venta.precio.toFixed(2) || '0.00');

                    let subtotalCelda = $('<td>').text((venta.cantidad * venta.precio).toFixed(2) || '0.00');

                    let accionesCelda = $('<td>');
                    let eliminarBtn = $('<button>')
                        .text('Eliminar')
                        .addClass('btn-eliminar')
                        .click(function () {
                            $(this).closest('tr').remove();
                            actualizarTotales(); // Recalcular totales
                        });
                    accionesCelda.append(eliminarBtn);

                    fila.append(productoCelda, cantidadCelda, precioCelda, subtotalCelda, idProducto, tipo, accionesCelda);

                    $('#lista-productos-seleccionados tbody').append(fila);

                    cantidadInput.change(function () {
                        let cantidad = parseFloat($(this).val()) || 0;
                        let precio = parseFloat(precioCelda.text()) || 0;

                        let maxCantidad = parseFloat($(this).attr('max')) || 0; // Obtener el máximo permitido

                        // Validar si la cantidad excede el máximo permitido
                        if (cantidad > maxCantidad) {
                            Swal.fire({
                                title: 'Advertencia',
                                text: 'La cantidad no puede exceder el máximo permitido.',
                                icon: 'warning',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                $(this).val(maxCantidad); // Restablecer al valor máximo permitido
                                cantidad = maxCantidad; // Actualizar la cantidad para el cálculo del subtotal
                            });
                        }
                        let subtotal = (cantidad * precio).toFixed(2);
                        subtotalCelda.text(subtotal);
                    });
                });
            }
        });

        function actualizarTotales() {
            let subtotal = 0;

            // Seleccionar todas las filas en el tbody
            const filas = document.querySelectorAll('#lista-productos-seleccionados tbody tr');
        
            
            filas.forEach(fila => {
                // Obtener los valores de cantidad y precio unitario
                const cantidad = parseFloat(fila.querySelector('.cantidad-input').value) || 0;
                const precio = parseFloat(fila.querySelector('td:nth-child(3)').textContent) || 0;

                // Calcular el subtotal del producto
                const subtotalProducto = cantidad * precio;

                // Sumar el subtotal del producto al subtotal general
                subtotal += subtotalProducto;

                // Actualizar la celda de subtotal para esta fila
                const celdaSubtotal = fila.querySelector('td:nth-child(4)');
                if (celdaSubtotal) {
                    celdaSubtotal.textContent = subtotalProducto.toFixed(2);
                }
            });

            // Calcular total (puedes agregar lógica adicional como descuentos o impuestos aquí)
            const total = subtotal;

            // Actualizar los inputs de subtotal y total en el formulario
            document.getElementById('subtotalDev').value = subtotal.toFixed(2);
            document.getElementById('totalDev').value = total.toFixed(2);
        }

        const form = document.querySelector('#form-devoluciones')

        form.addEventListener('submit', (e) => {
            // Evita la recarga del formulario si deseas validar algo antes de enviarlo
            //  e.preventDefault();

            const productosDinamicos = document.getElementById('productos-dinamicos');
            productosDinamicos.innerHTML = ''; // Limpia cualquier dato previo

            // Seleccionar todas las filas del cuerpo de la tabla
            const filas = document.querySelectorAll('#lista-productos-seleccionados tbody tr');

            filas.forEach((fila, index) => {
                // Obtén los datos de cada celda o input en la fila
                const producto = fila.querySelector('td:nth-child(1)').textContent.trim(); // Producto
                const cantidad = fila.querySelector('.cantidad-input').value; // Cantidad
                const precio = fila.querySelector('td:nth-child(3)').textContent.trim(); // Precio unitario
                const subtotal = fila.querySelector('td:nth-child(4)').textContent.trim(); // Subtotal
                const idProduc = fila.querySelector('td:nth-child(5)').textContent.trim(); // id
                const tipo = fila.querySelector('td:nth-child(6)').textContent.trim();
                // Opcional: si manejas productos dañados
                const cantidadDañadosInput = fila.querySelector('.dañados-input');
                const dañados = cantidadDañadosInput ? cantidadDañadosInput.value : 0;

                // Crear inputs ocultos para enviar cada campo
                const keys = { producto, cantidad, precio, subtotal, dañados, idProduc, tipo };

                Object.keys(keys).forEach(key => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = `productos[${index}][${key}]`;
                    input.value = keys[key];
                    productosDinamicos.appendChild(input);
                });
            });

            console.log(productosDinamicos.innerHTML); // Solo para verificar los datos antes de enviarlos
        });


    });



})