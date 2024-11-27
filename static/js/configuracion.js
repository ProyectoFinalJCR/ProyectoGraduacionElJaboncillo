document.addEventListener('DOMContentLoaded', function(){
    //Evento para mostrar formulario
   // Evento para mostrar modal de editar
   document.querySelector('.btn-editar-info').addEventListener('click', function(){
    const container_table_inputs = document.querySelector(".container-editarInfo");
    container_table_inputs.style.display = "block";
    document.getElementById("btn-cancel").addEventListener("click", function(){
        container_table_inputs.style.display="none";
        });
    });

    
});