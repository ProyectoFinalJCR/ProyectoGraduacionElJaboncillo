document.addEventListener("DOMContentLoaded", function(){
    //Evento para mostrar formulario
    document.querySelector('.btn-add-venta').addEventListener('click', function(){
     
        const container_table_inputs = document.querySelector(".container-inputVenta");  
        container_table_inputs.style.display = "block";
        document.getElementById("btn-cancel").addEventListener("click", function(){
            container_table_inputs.style.display="none";
        });

        
    });

    $(document).ready(function() {
        let productos = [];
        $('#subcategoria-select').change(function() {
            const subcategoria = $(this).val();

            $.ajax({
                url: "/get_products", 
                type: "POST",         
                contentType: "application/json",
                data: JSON.stringify({ subcategoria: subcategoria }), 
                success: function(data) {
                    productos = data;
                    $('#producto').empty();
                    
                    if (productos.length === 0) {
                        console.log("No hay productos disponibles");
                        $('#producto').append(new Option("No hay productos disponibles", ''));
                    }
                    else {
                        $('#producto').append(new Option("Seleccione un producto", ''));
                        productos.forEach(function(producto) {
                            $('#producto').append(new Option(producto.nombre, producto.id));
                       }); 
                    }

                }
            });
        });

        // Mostrar el precio del producto seleccionado
        $('#producto').change(function() {
            const selectedProductId = $(this).val(); 

            // Buscar el producto en la lista de productos obtenidos anteriormente
            const selectedProduct = productos.find(producto => producto.id == selectedProductId);

            // Si el producto existe, actualizar el campo de precio
            if (selectedProduct) {
                $('#precio').val(selectedProduct.precio);
                $('#idProd').val(selectedProduct.idProd); 
            } else {
                $('#precio').val(''); 
                $('#idProd').val('');
            }
        });
    });

const productosSeleccionados = document.querySelector('#lista-productos-seleccionados tbody');
const idInput = document.querySelector('#idProd')
const productoInput = document.querySelector('#producto');
const cantidadInput = document.querySelector('#cantidad');
const precioInput = document.querySelector('#precio');
const subtotalInput = document.querySelector('#subtotal');
const totalInput = document.querySelector('#total');
const botonAgregar = document.querySelector('#agregar_producto');
const divisaSelect = document.querySelector('#divisa-select');
const form = document.querySelector('#form-venta');
const productosDinamicos = document.querySelector('#productos-dinamicos');
let articulosLista = [];

listaEventListeners();

function listaEventListeners() {
    botonAgregar.addEventListener("click", agregarProducto);
}

function agregarProducto(e) {
    e.preventDefault();

    // Leer información del producto desde los inputs
    const infoProducto = {
        id: parseFloat(idInput.value) || 0,
        nombre: productoInput.options[productoInput.selectedIndex].text,
        precio: parseFloat(precioInput.value) || 0,
        cantidad: parseInt(cantidadInput.value) || 1,
    };


    if (!infoProducto.nombre || infoProducto.precio <= 0 || infoProducto.cantidad <= 0) {
        alert("Por favor, ingrese datos válidos para el producto.");
        return;
    }

    // Verificar si el producto ya existe en la lista
    const existeProducto = articulosLista.some(producto => producto.nombre === infoProducto.nombre);
    if (existeProducto) {
        // Si ya existe, actualizar la cantidad
        articulosLista = articulosLista.map(producto => {
            if (producto.nombre === infoProducto.nombre) {
                producto.cantidad += infoProducto.cantidad;
            }
            return producto;
        });
    } else {
        // Si no existe, agregarlo al arreglo
        articulosLista = [...articulosLista, infoProducto];
    }

    console.log(articulosLista);
    actualizarTabla();
    }

    function actualizarTabla() {
        productosSeleccionados.innerHTML = '';
    
        articulosLista.forEach( producto =>{
            const {id, nombre, precio, cantidad} = producto;
    
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="display: none;">${id}</td>
                <td> ${nombre}</td>
                <td> ${cantidad}</td>
                <td> ${precio}</td>
                <td> ${(cantidad * precio).toFixed(2)}</td>
                <td class="btn-acciones">
                    <button class="btn-edit" id="openModalCat">
                        <i class="material-icons">edit</i>
                    </button>
                    <form action="#" method="post" class="form-baja">
                        <input type="hidden" id="id_anular" name="id_anular">
                        <button class="btn-delete" type="submit">
                            <i class="material-icons">delete</i>
                        </button>
                    </form>
                </td>
            `;

            divisaSelect.addEventListener('change', actualizarTotales);

            function actualizarTotales() {
                const tasaCambio = parseFloat(divisaSelect.value);
                subtotal = `${articulosLista.reduce((acum, producto) => acum + (producto.cantidad * producto.precio), 0).toFixed(2)}`;
                total = `${articulosLista.reduce((acum, producto) => acum + (producto.cantidad * producto.precio), 0).toFixed(2)}`;
                
                subtotalInput.value = (subtotal / tasaCambio).toFixed(2);
                totalInput.value = (subtotal / tasaCambio).toFixed(2);
            }
            
            subtotalInput.value = `${articulosLista.reduce((acum, producto) => acum + (producto.cantidad * producto.precio), 0).toFixed(2)}`;
            totalInput.value = `${articulosLista.reduce((acum, producto) => acum + (producto.cantidad * producto.precio), 0).toFixed(2)}`;
                
           
            productosSeleccionados.appendChild(row);
        });
    }

    form.addEventListener('submit', (e) => {
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