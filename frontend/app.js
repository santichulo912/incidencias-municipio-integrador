// 1. Selecciona los elementos del DOM usando los IDs del HTML
const loginForm = document.getElementById('loginForm');
const mensajeError = document.getElementById('mensajeError');
const inputUsuario = document.getElementById('usuario');
const checkboxRecordar = document.getElementById('recordarUsuario')

//Al cargar la página, revisamos si el usuario pidió ser recordado
document.addEventListener('DOMContentLoaded', () => {
    const usuarioRecordado = localStorage.getItem('usuario_recordado');
    if (usuarioRecordado) {
        inputUsuario.value = usuarioRecordado;
        checkboxRecordar.checked = true; // Dejamos el tilde puesto
    }
});

// 2. Registra el evento submit
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    // 3. Captura los valores ingresados de autenticación
    const usuario = document.getElementById('usuario').value;
    const contrasenia = document.getElementById('contrasenia').value;

    try {
        // 4. Envia la petición POST al backend
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, contrasenia })
        });

        const data = await response.json();

        // Si el codigo HTTP no es 200 OK, lanza el error
        if (!response.ok) {
            throw new Error(data.mensaje || 'Credenciales inválidas');
        }

        // 5. Exito: Guardamos el token y datos
        console.log("Token recibido:", data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        //Lógica de Recordar Usuario
        if (checkboxRecordar.checked) {
            localStorage.setItem('usuario_recordado', usuario);
        } else {
            localStorage.removeItem('usuario_recordado');
        }

        // --- ANIMACIÓN DE CARGA ---
        // Escondemos el botón y el texto de error, y mostramos el spinner
        document.querySelector('button[type="submit"]').style.display = 'none';
        mensajeError.textContent = '';
        document.getElementById('spinner').style.display = 'block';

        // 6. Redirección automática según el rol
        setTimeout(() => {
            if (data.usuario.rol == 1) {
                window.location.href = 'director.html';
            } else if (data.usuario.rol == 2) {
                window.location.href = 'tecnico.html';
            } else if (data.usuario.rol == 3) {
                window.location.href = 'empleado.html';
            }
        }, 800);

    } catch (error) {
        // 7. Error: Muestra el mensaje en la interfaz
        console.error(error);
        mensajeError.style.color = "#dc3545";
        mensajeError.textContent = error.message;

        // Si se equivocó de clave, ocultamos el spinner y le devolvemos el botón
        document.querySelector('button[type="submit"]').style.display = 'block';
        const spinnerInfo = document.getElementById('spinner');
        if (spinnerInfo) spinnerInfo.style.display = 'none';
    }
});