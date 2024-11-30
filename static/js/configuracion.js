document.addEventListener('DOMContentLoaded', function () {
    //Evento para mostrar formulario
    // Evento para mostrar modal de editar
    document.querySelector('.btn-editar-info').addEventListener('click', function () {
        const container_table_inputs = document.querySelector(".container-editarInfo");
        container_table_inputs.style.display = "block";
        document.getElementById("btn-cancel").addEventListener("click", function () {
            container_table_inputs.style.display = "none";
        });
    });
});


/* MDOAL EDITAR*/
document.addEventListener("DOMContentLoaded", function () {
    const form_editar_planta = document.querySelectorAll("#form-editar-configuracion");
    console.log("entro a form editar");
    // Itera sobre cada formulario y agrega el evento de submit
    form_editar_planta.forEach(form => {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            Swal.fire({
                title: '¿Estás seguro?',
                text: "¡No podrás revertir esta acción!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, editar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => { // Declarar async aquí
                if (result.isConfirmed) {
                    socket = io();
                    const imageEditarUploader = document.getElementById('fileInput');

                    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/do1rxjufw/image/upload";
                    const CLOUDINARY_UPLOAD_PRESET = "rn94xkdi";

                    if (imageEditarUploader.files.length > 0) {
                        const file = imageEditarUploader.files[0];
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                        const res = await axios.post(CLOUDINARY_URL, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });

                        const url = res.data.url;
                        console.log("URL de la imagen subida:", url);

                        // Emitir la URL y el ID del insumo a través del socket
                        socket.emit("addLogoEmpresa", { 'url': url });

                        // Enviar el formulario al servidor
                        form.submit();
                    } else {
                        // Si no hay imagen, enviar directamente el formulario
                        form.submit();
                    }
                }
            });
        });
    });
});