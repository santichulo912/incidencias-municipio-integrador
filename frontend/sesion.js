document.addEventListener('DOMContentLoaded', () => {
    //Si el token no existe, lo devolvemos al login
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const usuarioInfo = localStorage.getItem('usuario');
    if (usuarioInfo) {
        const usuario = JSON.parse(usuarioInfo);
        const spanNombre = document.getElementById('nombre-usuario');

        if (spanNombre) {
            spanNombre.textContent = `Usuario: ${usuario.nombres} (${usuario.rol === 1 ? 'Director' : 'Empleado'})`;
        }
    }

    // Cierre de sesión para todos los usuarios
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'index.html';
        });
    }
});