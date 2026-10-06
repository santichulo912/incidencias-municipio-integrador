document.addEventListener('DOMContentLoaded', () => {
    // Muestra el formulario y oculta el botón de nueva incidencia
    const btnNuevaIncidencia = document.getElementById('btn-nueva-incidencia');
    const seccionFormulario = document.getElementById('seccion-crear-incidencia');

    if (btnNuevaIncidencia && seccionFormulario) {
        btnNuevaIncidencia.addEventListener('click', () => {
            seccionFormulario.style.display = 'block';
            btnNuevaIncidencia.style.display = 'none';
        });
    }

    // Carga los artículos y categorías apenas carga la pantalla
    cargarArticulos();
    cargarCategorias();

    // Programamos el botón "Consultar Incidencias" para que traiga la tabla real al hacer clic
    const btnVerIncidencias = document.getElementById('btn-ver-incidencias');
    if (btnVerIncidencias) {
        btnVerIncidencias.addEventListener('click', () => {
            cargarIncidencias();
        });
    }
});

// Función encargada de traer los artículos de la BD
async function cargarArticulos() {
    const token = localStorage.getItem('token');
    if (!token) return; 

    try {
        const response = await fetch('http://localhost:3000/api/articulos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            const selectArticulo = document.getElementById('select-articulo');
            if (selectArticulo) {
                selectArticulo.innerHTML = '<option value="">-- Seleccionar --</option>';

                result.data.forEach(articulo => {
                    const option = document.createElement('option');
                    option.value = articulo.id_articulo; 
                    option.textContent = articulo.descripcion; 
                    selectArticulo.appendChild(option);
                });
            }
        } else {
            console.error("Error del servidor al cargar artículos:", result.mensaje);
        }
    } catch (error) {
        console.error("Error de red al cargar artículos:", error);
    }
}

// Función para la carga de categorías
async function cargarCategorias() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:3000/api/categorias', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            const selectCategoria = document.getElementById('select-categoria');
            if (selectCategoria) {
                selectCategoria.innerHTML = '<option value="">-- Seleccionar --</option>';

                result.data.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.id_categoria; 
                    option.textContent = categoria.descripcion; 
                    selectCategoria.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
}

// Función encargada de traer las incidencias del usuario logueado
async function cargarIncidencias() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const tbody = document.getElementById('tabla-incidencias');
    if (!tbody) return;

    try {
        const response = await fetch('http://localhost:3000/api/incidencias', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            tbody.innerHTML = ''; 

            result.data.forEach(incidencia => {
                const fila = document.createElement('tr');
                
                const fechaFormat = new Date(incidencia.creado).toLocaleDateString('es-AR');
                
                let estadoHtml = '';
                let accionesHtml = '';

                if (incidencia.id_estado === 1) {
                    estadoHtml = `<strong style="color: orange;">Pendiente</strong>`;
                    accionesHtml = `<button type="button" class="btn-cancelar" onclick="cancelarIncidencia(${incidencia.id_incidencia})">Cancelar Incidencia</button>`;
                } else {
                    estadoHtml = `<strong style="color: green;">Finalizada/Cancelada</strong>`;
                    accionesHtml = `<span>Sin acciones</span>`;
                }

                fila.innerHTML = `
                    <td>#${incidencia.id_incidencia}</td>
                    <td>Artículo #${incidencia.id_articulo}</td>
                    <td>${incidencia.descripcion_pedido}</td>
                    <td>${fechaFormat}</td>
                    <td>${estadoHtml}</td>
                    <td>${accionesHtml}</td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            console.error("Error al cargar incidencias:", result.mensaje);
        }
    } catch (error) {
        console.error("Error de red al cargar incidencias:", error);
    }
}

// Función para cambiar el estado de la incidencia en la BD
async function cancelarIncidencia(idIncidencia) {
    if (!confirm(`¿Estás seguro de que querés cancelar la incidencia #${idIncidencia}?`)) {
        return; 
    }

    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:3000/api/incidencias/${idIncidencia}/cancelar`, {
            method: 'PUT', 
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert('Incidencia cancelada con éxito.');
            cargarIncidencias(); 
        } else {
            alert('No se pudo cancelar: ' + result.mensaje);
        }
    } catch (error) {
        console.error("Error al cancelar la incidencia:", error);
        alert('Error de conexión con el servidor.');
    }
}