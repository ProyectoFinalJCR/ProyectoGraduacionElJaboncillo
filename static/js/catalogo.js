document.addEventListener("DOMContentLoaded", function () {
    $(document).ready(function() {
        let subcategorias = [];
        $('.input-categorias').change(function() {
            const categoria = $(this).val();
            console.log("Categoria seleccionada:", categoria);

            $.ajax({
                url: "/obtener_subcategorias", 
                type: "POST",         
                contentType: "application/json",
                data: JSON.stringify({ categoria: categoria }),
                success: function(data) {
                    subcategorias = data;
                    $("#none").show();
                    console.log(subcategorias);
                    $('#subcategorias').empty();
                    
                    if (subcategorias.length === 0) {
                        $('#subcategorias').append(new Option("No hay subcategorías disponibles", ''));
                    } else {
                        $("#subcategorias").append(new Option("Seleccione una subcategoría", ''));
                        subcategorias.forEach(function(subcategoria) {
                            $("#subcategorias").append(new Option(subcategoria.subcategoria, subcategoria.id));
                        });
                    }
                 },
            });
        });
    });

    // redirige a ruta de productos por subcategorias 
    $(document).ready(function() {
        let productos = [];
        $('#subcategorias').change(function() {
            const subcategoria = $(this).val();

            $.ajax({
                url: "/get_products", 
                type: "POST",         
                contentType: "application/json",
                data: JSON.stringify({ subcategoria: subcategoria }), 
                success: function(data) {
                    productos = data;
                    $('.cards-plantas').empty();
                    
                    if (productos.length === 0) {
                        console.log("No hay productos disponibles");
                        $('.cards-plantas').append('<h3>No hay productos disponibles</h3>')
                    }
                    else {
                        productos.forEach(function(producto) {
                            const cardHTML = `
                            <div class="card-plantas">
                                <div class="img-card">
                                    <img class="img-planta" src="${producto.imagen}" alt="${producto.nombre}">
                                </div>
                                <div class="card-info">
                                    <div class="nombre-planta">
                                        <p>${producto.nombre}</p>
                                    </div>
                                    <div class="btn-catalogo">
                                        <button><a href="#">Agregar lista</a></button>
                                    </div>
                                    <div class="minilogoEJ">
                                        <img src="/static/img/logoElJaboncillo.png" alt="logo del vivero El Jaboncillo">
                                    </div>
                                </div>
                            </div>`;
                            $('.cards-plantas').append(cardHTML); // Agrega la tarjeta al contenedor
                        });
                    }
                }
            });
        });

    });
});