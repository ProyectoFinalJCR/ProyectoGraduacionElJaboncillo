document.addEventListener('DOMContentLoaded', function(){
    //Evento para mostrar modal
    document.querySelector('.btn-add-compra').addEventListener('click', function(){

        const inputFecha = document.getElementById("fecha_compra");
    const hoy = new Date();

    // Obtén día, mes y año
    const dia = hoy.getDate();
    const mes = hoy.toLocaleString('default', { month: 'long' }); // Nombre completo del mes
    const anio = hoy.getFullYear();

    // Formatea la fecha
    const fechaFormateada = `${dia} de ${mes} del ${anio}`;
    inputFecha.value = fechaFormateada;
     
        const container_table_inputs = document.querySelector(".container-inputCompra");  
        container_table_inputs.style.display = "block";
        document.getElementById("btn-cancel").addEventListener("click", function(){
        const container_table_inputs = document.querySelector(".container-inputCompra");  

            container_table_inputs.style.display="none";
        });

        document.getElementsByClassName("close-modal-compra")[0].addEventListener("click", function(){
        const container_table_inputs = document.querySelector(".container-inputCompra");  

            container_table_inputs.style.display="none";
        });

        // const inputCantidad = document.getElementById("cantidad-compra");

        // inputCantidad.addEventListener("input", function () {
        //     if (this.value < 0) {
        //         this.value = 0; // Restablece a 0 si es negativo
        //     }
        //     // Verificar si el valor es un número válido
        //     if (!/^\d*\.?\d*$/.test(this.value)) {
        //         this.value = this.value.slice(0, -1); // Elimina el último carácter inválido
        //     }
        // });

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

    // Declaracion de constantes
    const productosSeleccionados = document.querySelector('#lista-productos-seleccionados tbody');
    const btnAgregar = document.querySelector('#agregar_producto-compra')
    const idInput = document.querySelector('#idProd');
    const tipoInput = document.querySelector('#tipoProducto');
    const productoInput = document.querySelector('#producto');   
    const cantidadDispoInput = document.querySelector('#cantidadDispo');
    const cantidadInput = document.querySelector('#cantidad');
    const precioInput = document.querySelector('#precio');
    const subtotalInput = document.querySelector('#subtotal');
    const totalInput = document.querySelector('#total');
    const divisaSelect = document.querySelector('#divisa-select');
    const divisaIdInput = document.getElementById("divisa-id");
    const form = document.querySelector('#form-compra');
    const productosDinamicos = document.querySelector('#productos-dinamicos')
    let articulosLista = [];


    listaEventListeners();
    function listaEventListeners(){
        btnAgregar.addEventListener('click', agregarProd);
        productosSeleccionados.addEventListener("click", eliminarProducto);
    }

    function agregarProd(e){
    e.preventDefault();

    // Leer información del producto desde los inputs
    const infoProducto = {
        id: parseFloat(idInput.value) || 0,
        tipo: tipoInput.value || '',
        nombre: productoInput.options[productoInput.selectedIndex].text,
        precio: parseFloat(precioInput.value) || 0,
        cantidad: parseInt(cantidadInput.value) || 1,
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
    if(infoProducto.cantidad > cantidadDisponible){
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

    actualizarTabla();
    }

    function actualizarTabla() {
        cantidadInput.value = '';
        precioInput.value = '';
        limpiarListaHtml();
    
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
                    <div class="btn-delete">
                        <i class="material-icons eliminar_producto" data-id=${id}>delete</i>
                    </div>
                </td>
            `;

            divisaSelect.addEventListener('change', actualizarTotales);

            function actualizarTotales() {
                const selectedOption = this.options[this.selectedIndex];
                const divisaId = selectedOption.getAttribute("data-id");
                divisaIdInput.value = divisaId;

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
    while(productosSeleccionados.firstChild){
        productosSeleccionados.removeChild(productosSeleccionados.firstChild);
        // Limpiar los campos del formulario
        cantidadInput.value = '';
        precioInput.value = '';
        subtotalInput.value = '';
        totalInput.value = '';
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
    
    });
})