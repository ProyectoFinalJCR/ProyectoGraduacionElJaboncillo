document.addEventListener("DOMContentLoaded", function () {
    $(document).ready(function () {
        let subcategorias = [];
        $('.input-categorias').change(function () {
            const categoria = $(this).val();
            console.log("Categoria seleccionada:", categoria);

            $.ajax({
                url: "/obtener_subcategorias",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ categoria: categoria }),
                success: function (data) {
                    subcategorias = data;
                    $("#none").show();
                    console.log(subcategorias);
                    $('#subcategorias').empty();

                    if (subcategorias.length === 0) {
                        $('#subcategorias').append(new Option("No hay subcategorías disponibles", ''));
                    } else {
                        $("#subcategorias").append(new Option("Seleccione una subcategoría", ''));
                        subcategorias.forEach(function (subcategoria) {
                            $("#subcategorias").append(new Option(subcategoria.subcategoria, subcategoria.id));
                        });
                    }
                },
            });
        });
    });

    // redirige a ruta de productos por subcategorias 
    $(document).ready(function () {
        let productos = [];
        $('#subcategorias').change(function () {
            const subcategoria = $(this).val();

            $.ajax({
                url: "/get_products",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ subcategoria: subcategoria }),
                success: function (data) {
                    productos = data;
                    $('.cards-plantas').empty();

                    if (productos.length === 0) {
                        console.log("No hay productos disponibles");
                        $('.cards-plantas').append('<h3>No hay productos disponibles</h3>')
                    }
                    else {
                        productos.forEach(function (producto) {
                            const cardHTML = `
                            <div class="card-plantas">
                                <form action="/listaDeseos" method="POST" class="agregar-producto">
                                    <input text hidden name="tipo" value="${producto.tipo}">
                                    <input text hidden name="productoId" value="${producto.idProd}">
                                    <div class="img-card">
                                        <img class="img-planta" src="${producto.imagen}" alt="${producto.nombre}">
                                    </div>
                                    <div class="card-info">
                                        <div class="nombre-planta">
                                            <p>${producto.nombre}</p>
                                            <p>C$  ${producto.precio}</p>
                                        </div>
                                        <div class="btn-catalogo">
                                            <button id="agregar" class="btn-agregar-lista" data-idProd="${producto.idProd}" data-nombre="${producto.nombre}" data-precio="${producto.precio}" data-tipo="${producto.tipo}">Agregar lista</button>
                                        </div>
                                        <div class="minilogoEJ">
                                            <img src="/static/img/logoElJaboncillo.png" alt="logo del vivero El Jaboncillo">
                                        </div>
                                    </div>
                                    
                            </form>
                            </div>`;
                            $('.cards-plantas').append(cardHTML); // Agrega la tarjeta al contenedor
                        });
                    }
                }
            });
        });

    });
    $(document).on('submit', '.agregar-producto', function (event) {
        event.preventDefault();
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, editar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                event.target.submit();
            }
        });
    });


    $(document).ready(function () {
        // Cargar todos los productos disponibles al inicio
        let all_productos = [];
        $.ajax({
            url: "/get_all_products", // Nueva ruta
            type: "GET",
            success: function (data) {
                all_productos = data;
                mostrarProductos(all_productos); // Mostrar todos los productos al cargar
            }
        });
    
        // Escuchar el evento de búsqueda en el input
        document.getElementById("buscar-productos").addEventListener("input", function () {
            const valorBuscar = this.value.toLowerCase();
    
            // Filtrar los productos según el texto ingresado
            const resultados = valorBuscar === "" 
                ? all_productos // Mostrar todos si no hay texto
                : all_productos.filter(producto =>
                    producto.nombre.toLowerCase().includes(valorBuscar) ||
                    producto.precio.toString().toLowerCase().includes(valorBuscar) ||
                    producto.tipo.toLowerCase().includes(valorBuscar)
                );
    
            // Mostrar los resultados filtrados
            mostrarProductos(resultados);
        });
    
        // Función para mostrar los productos en la página
        function mostrarProductos(data) {
            const container = $('.cards-plantas');
            container.empty(); // Limpiar las tarjetas existentes
    
            if (data.length === 0) {
                container.append('<h3>No hay productos disponibles</h3>');
            } else {
                data.forEach(function (producto) {
                    const cardHTML = `
                    <div class="card-plantas">
                        <form action="/listaDeseos" method="POST" class="agregar-producto">
                            <input type="hidden" name="tipo" value="${producto.tipo}">
                            <input type="hidden" name="productoId" value="${producto.idProd}">
                            <div class="img-card">
                                <img class="img-planta" src="${producto.imagen}" alt="${producto.nombre}">
                            </div>
                            <div class="card-info">
                                <div class="nombre-planta">
                                    <p>${producto.nombre}</p>
                                    <p>C$ ${producto.precio}</p>
                                </div>
                                <div class="btn-catalogo">
                                    <button class="btn-agregar-lista" data-idProd="${producto.idProd}" data-nombre="${producto.nombre}" data-precio="${producto.precio}" data-tipo="${producto.tipo}">Agregar lista</button>
                                </div>
                                <div class="minilogoEJ">
                                    <img src="/static/img/logoElJaboncillo.png" alt="logo del vivero El Jaboncillo">
                                </div>
                            </div>
                        </form>
                    </div>`;
                    container.append(cardHTML);
                });
            }
        }
    });
    

        // agregar lista de deseo
        const btnAbrirListaDeseo = document.getElementById("btn-lista-deseo");
        const dropdown = document.getElementById("lista-deseo-dropdown");
        const agregarBtns = document.querySelectorAll(".btn-agregar-lista");
        const listaDeseosBody = document.getElementById("lista-deseos");
        
        // Función para calcular el total de precios y actualizar la etiqueta `<p>`
        function calcularTotal() {
            // Usar reduce para sumar los precios
            const total = listaDeseos.reduce((sum, producto) => sum + parseFloat(producto.precio), 0);
    
            console.log("Total de la lista de deseos:", total);
            // Actualizar el contenido de la etiqueta `<p>`
            document.querySelector("#total-lista-deseo").textContent = `C$ ${total.toFixed(2)}`;
        }
    
        // Mostrar/Ocultar el desplegable al hacer clic en el botón "Lista de deseo"
        btnAbrirListaDeseo.addEventListener("click", () => {
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        });
    
        // Prevenir que el clic dentro del dropdown lo cierre
        dropdown.addEventListener("click", (event) => {
            event.stopPropagation(); // Detiene el evento para que no llegue al listener global
        });
        
        // Función para calcular el total de la columna "Precio"
    function calcularTotal() {
        const filas = document.querySelectorAll("#lista-deseos tr"); // Seleccionar todas las filas del cuerpo de la tabla
        let total = 0;

        // Recorrer las filas y sumar los precios
        filas.forEach((fila) => {
            const precioTexto = fila.querySelector("td:nth-child(2)").textContent.trim(); // Obtener el texto de la segunda columna
            const precio = parseFloat(precioTexto.replace("C$", "").trim()); // Convertir el precio a número
            if (!isNaN(precio)) {
                total += precio; // Sumar el precio si es válido
            }
        });

        // Actualizar el contenido del <p> con el total calculado
        const totalElemento = document.getElementById("total-lista-deseo");
        if (totalElemento) {
            totalElemento.textContent = `C$ ${total.toFixed(2)}`; // Mostrar con dos decimales
        }
    }

    // Calcular el total al cargar la página
    calcularTotal();

});


