document.addEventListener('DOMContentLoaded', function(){
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