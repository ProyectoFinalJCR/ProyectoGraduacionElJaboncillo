 
 document.addEventListener("DOMContentLoaded", function(event) {
   
 // Captura el parámetro "error_msg" desde la URL
 const params = new URLSearchParams(window.location.search);
 const errorMsg = params.get('error_msg');

 // Si hay un mensaje de error, muestra SweetAlert
 if (errorMsg) {
     Swal.fire({
         icon: 'error',
         title: 'Error en el registro',
         text: errorMsg,
         confirmButtonText: 'Entendido'
     });
 }
 });