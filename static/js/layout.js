function obtenerDiaSemana(diaNumero) {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return diasSemana[diaNumero];
}

function obtenerMes(mesNumero) {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return meses[mesNumero];
}

function mostrarFechaHora() {
    const fecha = new Date(); // Obteniendo la fecha y hora actual

    const diaSemana = obtenerDiaSemana(fecha.getDay());
    const diaMes = fecha.getDate();
    const mes = obtenerMes(fecha.getMonth());
    const año = fecha.getFullYear();

    const horaFormateada = fecha.toLocaleTimeString('es-ES', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    const fechaFormateada = `${diaSemana}, ${diaMes} de ${mes} del ${año}`;
    
    document.getElementById("fechaHora").innerHTML = `${fechaFormateada} ${horaFormateada}`;
}

setInterval(mostrarFechaHora, 1000);
window.onload = mostrarFechaHora;