//Seleccionamos los elementos del DOM usando los ids del HTML
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const mensajeError = document.getElementById('mensajeError');
    const inputUsuario = document.getElementById('usuario');

    //Al cargar página revisamos si usuario pidió ser recordado
    const checkboxRecordar = document.getElementById('recordarUsuario');

    if (!loginForm) {
        console.error("No se encontró el elemento #loginForm en el HTML");
        return;
    }

    //Si ya existe sesión activa, redirigir directo
    const token = localStorage.getItem('token');
    const usuarioInfo = localStorage.getItem('usuario');
    if (token && usuarioInfo) {
        try {
            const user = JSON.parse(usuarioInfo);
            redirigirPorRol(user.rol);
            return;
        } catch (e) {
            localStorage.clear();
        }
    }

    //Autocompletar usuario si fue recordado
    const usuarioRecordado = localStorage.getItem('usuario_recordado');
    if (usuarioRecordado && inputUsuario) {
        inputUsuario.value = usuarioRecordado;
        if (checkboxRecordar) checkboxRecordar.checked = true;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const usuarioVal = inputUsuario ? inputUsuario.value.trim() : '';
        const contraseniaVal = document.getElementById('contrasenia')?.value || '';

        if (!usuarioVal || !contraseniaVal) {
            mostrarError('Por favor complete todos los campos.');
            return;
        }

        try {
            //Petición al backend
            const response = await fetch('http://localhost:3000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: usuarioVal, contrasenia: contraseniaVal })
            });

            const data = await response.json();

            //Si servidor responde con error
            if (!response.ok || (!data.success && !data.ok)) {
                throw new Error(data.mensaje || 'Credenciales inválidas');
            }

            //Guardar credenciales en el navegador
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            if (checkboxRecordar && checkboxRecordar.checked) {
                localStorage.setItem('usuario_recordado', usuarioVal);
            } else {
                localStorage.removeItem('usuario_recordado');
            }

            //Redirección según rol
            redirigirPorRol(data.usuario.rol);

        } catch (error) {
            console.error("Error en la autenticación:", error);
            mostrarError(error.message || 'Error de conexión con el servidor.');
        }
    });

    function mostrarError(mensaje) {
        if (mensajeError) {
            mensajeError.style.color = "#dc3545";
            mensajeError.textContent = mensaje;
        } else {
            alert(mensaje);
        }
    }

    function redirigirPorRol(rol) {
        const rolNum = Number(rol);
        if (rolNum === 1) {
            window.location.href = 'director.html';
        } else if (rolNum === 2) {
            window.location.href = 'tecnico.html';
        } else if (rolNum === 3) {
            window.location.href = 'empleado.html';
        } else {
            alert('Rol de usuario no válido');
        }
    }
});
