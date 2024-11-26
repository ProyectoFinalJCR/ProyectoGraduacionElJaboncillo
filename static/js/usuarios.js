document.addEventListener("DOMContentLoaded", function () {

  // hasta la linea 17 se aplica la divicion de la tabla y el formulario
  document.getElementById("btn-add-user").addEventListener("click", function () {

    const modal_user = document.querySelector(".container-inputsUser");
    modal_user.style.display = "block";

    document.querySelector(".btn-cancel-user").addEventListener("click", function () {
      const modal_user = document.querySelector(".container-inputsUser");
      modal_user.style.display = "none";
    });
    document.getElementById("close_agregar_user").addEventListener("click", function () {
      const modal_user = document.querySelector(".container-inputsUser");
      modal_user.style.display = "none";
    });
  });

// Obtener elementos del DOM
const abrirModal = document.getElementById('abrirModal');
const cerrarModal = document.getElementById('cerrarModal');
const modal = document.getElementById('modalCambiarContraseña');

// Abrir el modal
abrirModal.addEventListener('click', (event) => {
  modal.style.display = 'block';
  
  // Usar event.target para obtener el botón que disparó el evento
  const userId = document.querySelector('#id_editar_usuario').value
  
  console.log(userId); // Verificar el ID en la consola
  
  // Asignar el valor al input oculto
  document.querySelector('#id_usuario_contraseña').value = userId;
});

// Cerrar el modal al hacer clic en la "x"
cerrarModal.addEventListener('click', () => {
  modal.style.display = 'none';
});


  // Validacion de los campos
  const nombre_completo = document.querySelector('#nombre');
  const correo = document.querySelector('#correo');
  const contraseña = document.querySelector('#contraseña');
  const rol = document.querySelector('#rol');

 

  nombre_completo.addEventListener('input', validar);
  //correo.addEventListener('input', validar);
  correo.addEventListener('input', validarEmail);
  contraseña.addEventListener('input', validar);
  rol.addEventListener('change', validar);

  function validar(e) {
    if (e.target.value.trim() === '') {
      mostrarError(`El campo ${e.target.id} es obligatorio`, e.target.parentElement);
      return;
    }

    limpiarAlerta(e.target.parentElement);
  };

  // valida que en el input correo se ingrese un correo valido
  function validarEmail(e) {
    const selectedValue = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(selectedValue)) {
      mostrarError('Ingresa direccion de correo electronico valida.', e.target.parentElement);
      verificarEstadoBoton();
      return;
    }
    limpiarAlerta(e.target.parentElement);
    return true;
  }



  function mostrarError(mensaje, referencia) {
    //Validar si ya existe una alerta
    limpiarAlerta(referencia);

    const error = document.createElement('P');
    error.textContent = mensaje;
    error.classList.add('error');
    referencia.appendChild(error);
  };

  function limpiarAlerta(referencia) {
    const alerta = referencia.querySelector('.error');
    if (alerta) {
      alerta.remove();
    }

    //opacidad y habilitacion del boton agregar
    document.getElementById('formUser').addEventListener('input', function () {
      const inputs = document.querySelectorAll('.input-user');
      const btnSend = document.querySelector('#btn-agregar-user');
      let fields = true;
      console.log(fields)

      inputs.forEach(input => {
        if (input.value.trim() === '') {
          fields = false;
          console.log(fields)
        }
      });

      // Habilita o deshabilita el botón según el estado de los inputs
      if (fields) {
        btnSend.disabled = false;
        btnSend.classList.remove('opacity');
      } else {
        btnSend.disabled = true;
        btnSend.classList.add('opacity');
      }
    });
  }
  function limpiarAlerta(referencia) {
    const alerta = referencia.querySelector('.error');
    if (alerta) {
      alerta.remove();
    }
  }
  
  //validad campos de usuarios editar
  const nombre_completo_editar = document.querySelector('#nombreUsuario_editar');
  const correo_editar = document.querySelector('#correo_editar');
  const contraseña_editar = document.querySelector('#contraseña');
  const rol_editar = document.querySelector('#rol_editar');

 

  nombre_completo_editar.addEventListener('input', validar);
  //correo.addEventListener('input', validar);
  correo_editar.addEventListener('input', validarEmail);
  contraseña_editar.addEventListener('input', validar);
  rol_editar.addEventListener('change', validar);

  function validar(e) {
    if (e.target.value.trim() === '') {
      mostrarError(`El campo es obligatorio`, e.target.parentElement);
      return;
    }

    limpiarAlerta(e.target.parentElement);
  };

  // valida que en el input correo se ingrese un correo valido
  function validarEmail(e) {
    const selectedValue = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(selectedValue)) {
      mostrarError('Ingresa direccion de correo electronico valida.', e.target.parentElement);
      verificarEstadoBoton();
      return;
    }
    limpiarAlerta(e.target.parentElement);
    return true;
  }



  function mostrarError(mensaje, referencia) {
    //Validar si ya existe una alerta
    limpiarAlerta(referencia);

    const error = document.createElement('P');
    error.textContent = mensaje;
    error.classList.add('error');
    referencia.appendChild(error);
  };

  function limpiarAlerta(referencia) {
    const alerta = referencia.querySelector('.error');
    if (alerta) {
      alerta.remove();
    }

   }



  //Buscar usuarios
  let usuariosData = [];
  // Cargar datos una sola vez cuando la página carga
  // fetch(`/generar_json_usuarios`)
  fetch(`/usuarios_json`)
    .then(response => response.json())
    .then(data => {
      usuariosData = data;
      mostrarUsuarios(usuariosData);  // Mostrar todos los usuarios inicialmente
    })
    .catch(error => console.error('Error:', error));



  //Escuchar el evento 'input' para la búsqueda
  document.getElementById("buscar_usuarios").addEventListener('input', function () {
    const valorBuscar = this.value.toLowerCase();
    console.log(valorBuscar);
    // Filtrar resultados cuando hay texto en el input
    const resultados = valorBuscar === "" ? usuariosData :
      usuariosData.filter(usuarios =>
        usuarios.nombre_completo.toLowerCase().includes(valorBuscar) ||
        usuarios.correo.toLowerCase().includes(valorBuscar) ||
        usuarios.rol.toLowerCase().includes(valorBuscar)
      );

    // Mostrar resultados filtrados o todos los usuarios si el input está vacío
    mostrarUsuarios(resultados);
  });
  // Función para mostrar usuarios en la tabla
  function mostrarUsuarios(data) {
    const tableBody = document.getElementById('tabla_usuarios');
    tableBody.innerHTML = '';  // Limpiar tabla

    if (data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='6' style='text-align: center;'>No hay resultados</td></tr>";
    } else {
      data.forEach(usuario => {
        const row = `
      <tr>
        <td>${usuario.id}</td>
        <td>${usuario.nombre_completo}</td>
        <td>${usuario.correo}</td>
        <td>${usuario.rol}</td>
        <td style="display: none;">${usuario.rol_id}</td>
        <td class="btn-acciones"> 
          <button class="btn-edit btn-edit-usuario" data-id="${usuario.id}">
            <i class="material-icons">edit</i>
          </button>
          <form action="/eliminarUsuarios" method="post" class="form-eliminar">
            <input type="hidden" class="id_eliminar" name="id_usuario" value="${usuario.id}">
            <button class="btn-delete" type="submit">
              <i class="material-icons">delete</i>
            </button>
          </form>
        </td>
      </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
      });
    }
  }
  // Agregar event listener para delegación de eventos btn editar usuario
  document.getElementById('tabla_usuarios').addEventListener('click', function (event) {
    if (event.target.closest('.btn-edit-usuario')) {
      const button = event.target.closest('.btn-edit-usuario');
      const usuarioId = button.getAttribute('data-id');
      console.log("Usuario ID:", usuarioId);

      const modal = document.getElementById("myModal");
      const inputId_usuario = document.getElementById("id_editar_usuario");
      const inputNombreUser = document.getElementById("nombreUsuario_editar");
      const inputCorreo = document.getElementById("correo_editar");
      const inputRolSeleccionado = document.getElementById("rol_editar");

      // Obtener la fila de la tabla donde se hizo clic
      const row = event.target.closest("tr");

      // Obtener los datos de la categoría de esa fila
      const userID = row.cells[0].innerText;
      const nombreuser = row.cells[1].innerText;
      const correo = row.cells[2].innerText;
      const rol = row.cells[4].innerText;


      // Rellenar los campos del modal con los datos obtenidos
      inputId_usuario.value = userID;

      inputNombreUser.value = nombreuser;
      inputNombreUser.textContent = nombreuser;

      inputCorreo.value = correo;
      inputCorreo.textContent = correo;

      inputRolSeleccionado.value = rol;
      console.log("Valor del rol:", rol);

      inputRolSeleccionado.value = rol;

      modal.style.display = "block";

      document.querySelector(".btn-cancel-user").addEventListener("click", function () {
        modal.style.display = "none";
      });
      document.querySelector(".close-modal-editar").addEventListener("click", function () {
        modal.style.display = "none";
      });


    }
  });

  // Delegar eventos para el botón de eliminar
document.getElementById('tabla_usuarios').addEventListener('click', function (event) {
  if (event.target.closest('.btn-delete')) {
    event.preventDefault(); // Evita que se envíe el formulario automáticamente
    const form = event.target.closest('.form-eliminar'); // Encuentra el formulario
    const userId = form.querySelector('.id_eliminar').value;

    // Mostrar alerta de confirmación con SweetAlert
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esta acción!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Enviar formulario para eliminar
        form.submit();
      }
    });
  }
  });

  // Alertas

  //ALERTA EDITAR
  const form_editar_user = document.querySelector('.form_edit_user');

  form_editar_user.addEventListener('submit', function (event) {
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
    }).then((result) => {
      if (result.isConfirmed) {
        event.target.submit();
      }
    });
  });
  

  function generarContraseña() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let contraseña = '';

    for (let i = 0; i < 8; i++) {
        const random = Math.floor(Math.random() * caracteres.length);
        contraseña += caracteres[random];
    }
    return contraseña;
  }

  document.querySelector('#generarContraseña').addEventListener('click', function(event){
    const nuevaContraseña = document.querySelector('#nuevaContraseña')
    const contraseñaAleatoria = generarContraseña();
    nuevaContraseña.value = contraseñaAleatoria
    event.preventDefault(); 
  })
});   