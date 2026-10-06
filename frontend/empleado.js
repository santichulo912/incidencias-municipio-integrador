document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionamos el botón y la sección del formulario
    const btnNuevaIncidencia = document.getElementById('btn-nueva-incidencia');
    const seccionFormulario = document.getElementById('seccion-crear-incidencia');

    // 2. Le agregamos la acción al hacer clic
    if (btnNuevaIncidencia && seccionFormulario) {
        btnNuevaIncidencia.addEventListener('click', () => {
            // Hacemos visible el formulario
            seccionFormulario.style.display = 'block';
            
            // Ocultamos el botón verde para que la pantalla quede más limpia
            btnNuevaIncidencia.style.display = 'none';
        });
    }
});