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
    
    document.getElementById("fecha").innerHTML = `${fechaFormateada}`;
    document.getElementById("hora").innerHTML = `${horaFormateada}`
}

    setInterval(mostrarFechaHora, 1000);
    window.onload = mostrarFechaHora;

document.addEventListener('DOMContentLoaded', function(){
    const botones = document.querySelectorAll('.btn-items');
    const icons = document.querySelectorAll('.key');

    botones.forEach((btnItem, index) => {
        const opciones = btnItem.nextElementSibling;
        const icon = icons[index];
    
        btnItem.addEventListener('click', function() {
            if (opciones.classList.contains('options')) {
                opciones.classList.remove('options');
                icon.textContent = 'keyboard_arrow_down';
            } else {
                opciones.classList.add('options');
                icon.textContent = 'keyboard_arrow_right';
            }
        });
    });
    
    // Ocultar el sidebar
    const menuToggle = document.querySelector(".menu-toggle"); // Menú hamburguesa
    const allScreen = document.querySelector(".all-screen"); // Contenedor principal
    const sidebar = document.querySelector(".sidebar"); // Sidebar

    menuToggle.addEventListener("click", () => {
        allScreen.classList.toggle("hidden-sidebar"); // Cambia la estructura del grid
        sidebar.classList.toggle("hidden"); // Oculta o muestra el sidebar
    });
})

// Saludo de la página
const saludo = document.getElementById("saludo");
const hora = new Date().getHours();

if (hora >= 6 && hora < 12) {
    saludo.textContent = "Buenos días";
} else if (hora >= 12 && hora < 18) {
    saludo.textContent = "Buenas tardes";
} else {
    saludo.textContent = "Buenas noches";
}
// Modal
// Cerrar el modal cuando se hace clic en la "X"

const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    modal.style.display = "none";
  }
  
  const closeModal = document.querySelector('.close-modal');
  closeModal.addEventListener('click', function(){
    modal.style.display = "none";
  })
  
  // Cerrar el modal si se hace clic fuera de él
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "show";
    }
  }
