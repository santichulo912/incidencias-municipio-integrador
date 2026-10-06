document.addEventListener('DOMContentLoaded', () => {
    // Muestra el formulario y oculta el botón
    const btnNuevaIncidencia = document.getElementById('btn-nueva-incidencia');
    const seccionFormulario = document.getElementById('seccion-crear-incidencia');

    if (btnNuevaIncidencia && seccionFormulario) {
        btnNuevaIncidencia.addEventListener('click', () => {
            seccionFormulario.style.display = 'block';
            btnNuevaIncidencia.style.display = 'none';
        });
    }

    // Carga los artículos apenas carga la pantalla
    cargarArticulos();
});
// Función encargada de traer los artículos de la BD
async function cargarArticulos() {
    const token = localStorage.getItem('token');
    if (!token) return; // Si no hay token, el archivo sesion.js ya se encarga de redirigir al login

    try {
        // Hacemos la petición a la ruta de artículos en el backend
        const response = await fetch('/api/articulos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            // Capturamos el select del HTML
            const selectArticulo = document.getElementById('select-articulo');
            
            // Limpiamos los datos de prueba "hardcodeados" del HTML, dejando solo la opción por defecto
            selectArticulo.innerHTML = '<option value="">-- Seleccionar --</option>';

            // Recorremos el arreglo de artículos que mandó PostgreSQL
            result.data.forEach(articulo => {
                // Fabricamos una nueva opción por cada artículo
                const option = document.createElement('option');
                
                option.value = articulo.id_articulo; 
                option.textContent = articulo.descripcion; 
                
                // Inyectamos la opción en el menú desplegable
                selectArticulo.appendChild(option);
            });
        } else {
            console.error("Error del servidor al cargar artículos:", result.mensaje);
        }

    } catch (error) {
        console.error("Error de red al cargar artículos:", error);
    }
}