document.addEventListener('DOMContentLoaded', function(){
    //Evento para mostrar modal
    document.querySelector('.btn-add-compra').addEventListener('click', function(){
     
        const container_table_inputs = document.querySelector(".container-inputCompra");  
        container_table_inputs.style.display = "block";
        document.getElementById("btn-cancel").addEventListener("click", function(){
            container_table_inputs.style.display="none";
        });

        
    });
})