document.addEventListener('DOMContentLoaded', function(){
    // buscar gastos
    let gastosData = [];
    fetch(`/generar_json_gastos`)
        .then(response => response.json())
        .then(data => {
            gastosData = data;
            mostrarGastos(gastosData);  // Mostrar todos los gastos inicialmente
        });

        //escuchar evento para buscar gastos
    document.getElementById("buscar_gastos").addEventListener('input', function () {
        const valorBuscar = this.value.toLowerCase();
        console.log(valorBuscar);
        // Filtrar resultados cuando hay texto en el input
        const resultados = valorBuscar === "" ? gastosData :
            gastosData.filter(gasto =>
                gasto.monto.toString().toLowerCase().includes(valorBuscar) ||
                gasto.fecha.toLowerCase().includes(valorBuscar) ||
                gasto.descripcion.toLowerCase().includes(valorBuscar)
            );

        // Mostrar resultados filtrados o todos los gastos si el input está vacío
        mostrarGastos(resultados);
    });
    // Función para mostrar gastos en la tabla
    function mostrarGastos(data) {
        const tableBody = document.getElementById('tabla_gastos');
        tableBody.innerHTML = '';  // Limpiar tabla

        if (data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='3' style='text-align: center;'>No hay resultados</td></tr>";
        } else {
            data.forEach(gasto => {
                        let fechaFormateada = "";
                if (gasto.fecha) {
                const fecha = new Date(gasto.fecha);

                // Construir el formato "YYYY-MM-DD" requerido por <input type="date">
                const anio = fecha.getUTCFullYear();
                const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0'); // Mes comienza en 0
                const dia = fecha.getUTCDate().toString().padStart(2, '0');

                fechaFormateada = `${anio}-${mes}-${dia}`;
                gasto.fecha = fechaFormateada;
                }
                const row = `
            <tr>
                <td>${gasto.monto}</td>
                <td>${gasto.fecha}</td>
                <td>${gasto.descripcion}</td>
            </tr>`;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        }
    }

    document.getElementById("btn-add-gasto").addEventListener("click", function () {

        const modal_gastos = document.querySelector(".container-inputsGasto");
        modal_gastos.style.display = "block";
    
        document.querySelector(".btn-cancel-gasto").addEventListener("click", function () {
          const modal_gastos = document.querySelector(".container-inputsGasto");
          modal_gastos.style.display = "none";
        });
        document.getElementById("close_agregar_user").addEventListener("click", function () {
          const modal_gastos = document.querySelector(".container-inputsGasto");
          modal_gastos.style.display = "none";
        });
      });
})