document.addEventListener('DOMContentLoaded', () => {
    //Si el token no existe, lo devolvemos al login
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const usuarioInfo = localStorage.getItem('usuario');
    if (usuarioInfo) {
        const usuario = JSON.parse(usuarioInfo);
        const spanNombre = document.getElementById('nombre-usuario');
        //Dependiendo el rol lo redirige a su respectiva pantalla
        if (spanNombre) {
            let nombreRol = '';
            if (usuario.rol === 1) nombreRol = 'Director Sistemas';
            else if (usuario.rol === 2) nombreRol = 'Técnico Sistemas';
            else if (usuario.rol === 3) nombreRol = 'Municipal';

            spanNombre.textContent = `Usuario: ${usuario.nombres} (${nombreRol})`;
        }
    }

    //Cerrar sesión
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'login.html';
        });
    }
});