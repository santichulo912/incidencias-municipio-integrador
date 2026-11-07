document.addEventListener('DOMContentLoaded', () => {
    const btnNuevaIncidencia = document.getElementById('btn-nueva-incidencia');
    const seccionFormulario = document.getElementById('seccion-crear-incidencia');

    if (btnNuevaIncidencia && seccionFormulario) {
        btnNuevaIncidencia.addEventListener('click', () => {
            seccionFormulario.style.display = 'block';
            btnNuevaIncidencia.style.display = 'none';
        });
    }

    // 2. Recuperamos los datos del usuario para mostrar en la barra superior
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado) {
        try {
            const usuario = JSON.parse(usuarioGuardado);
            const spanUsuario = document.getElementById('nombre-usuario');

            let nombreRol = "";
            if (usuario.rol === 1) nombreRol = "Directora";
            else if (usuario.rol === 2) nombreRol = "Técnico";
            else if (usuario.rol === 3) nombreRol = "Empleado";
            else nombreRol = "Usuario";

            if (spanUsuario) {
                spanUsuario.textContent = `Usuario: ${usuario.nombres} ${usuario.apellidos} (${nombreRol})`;
            }
        } catch (e) {
            console.error("Error al leer los datos del usuario:", e);
        }
    }

    cargarArticulos();
    cargarCategorias();
    cargarIncidencias();

    const btnVerIncidencias = document.getElementById('btn-ver-incidencias');
    if (btnVerIncidencias) {
        btnVerIncidencias.addEventListener('click', () => {
            cargarIncidencias();
        });
    }
});

// Carga segura de Artículos en el SELECT
async function cargarArticulos() {
    const selectArticulo = document.getElementById('select-articulo');
    const token = localStorage.getItem('token');

    if (!token || !selectArticulo) return;

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
            selectArticulo.replaceChildren(); // Vacía las opciones previas

            const optionDefault = document.createElement('option');
            optionDefault.value = '';
            optionDefault.textContent = '-- Seleccionar --';
            selectArticulo.appendChild(optionDefault);

            result.data.forEach(articulo => {
                const option = document.createElement('option');
                option.value = articulo.id_articulo;
                option.textContent = articulo.descripcion;
                selectArticulo.appendChild(option);
            });
        } else {
            console.error("Error del servidor al cargar artículos:", result.mensaje);
        }
    } catch (error) {
        console.error("Error de red al cargar artículos:", error);
    }
}

// Carga segura de Categorías en el SELECT
async function cargarCategorias() {
    const selectCategoria = document.getElementById('select-categoria');
    const token = localStorage.getItem('token');
    if (!token || !selectCategoria) return;

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
            selectCategoria.replaceChildren();

            const optionDefault = document.createElement('option');
            optionDefault.value = '';
            optionDefault.textContent = '-- Seleccionar --';
            selectCategoria.appendChild(optionDefault);

            result.data.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id_categoria;
                option.textContent = categoria.descripcion;
                selectCategoria.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
}

// Carga segura de Incidencias en la TABLA sin innerHTML
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
            tbody.replaceChildren();

            result.data.forEach(incidencia => {
                const fila = document.createElement('tr');

                const fechaFormat = new Date(incidencia.creado).toLocaleDateString('es-AR');

                // ID
                const tdId = document.createElement('td');
                tdId.textContent = `#${incidencia.id_incidencia}`;

                // Articulo
                const tdArticulo = document.createElement('td');
                tdArticulo.textContent = incidencia.Articulo ? incidencia.Articulo.descripcion : 'N/A';

                // Descripción
                const tdDesc = document.createElement('td');
                tdDesc.textContent = incidencia.descripcion_pedido;

                // Fecha
                const tdFecha = document.createElement('td');
                tdFecha.textContent = fechaFormat;

                // Estado
                const tdEstado = document.createElement('td');
                const tagEstado = document.createElement('strong');

                // Acciones
                const tdAcciones = document.createElement('td');

                if (incidencia.id_estado === 1) {
                    tagEstado.style.color = 'orange';
                    tagEstado.textContent = 'Pendiente';

                    const btnCancelar = document.createElement('button');
                    btnCancelar.type = 'button';
                    btnCancelar.className = 'btn-cancelar';
                    btnCancelar.textContent = 'Cancelar Incidencia';
                    btnCancelar.addEventListener('click', () => cancelarIncidencia(incidencia.id_incidencia));
                    tdAcciones.appendChild(btnCancelar);
                } else {
                    tagEstado.style.color = 'green';
                    tagEstado.textContent = 'Finalizada/Cancelada';
                }
                tdEstado.appendChild(tagEstado);

                fila.appendChild(tdId);
                fila.appendChild(tdArticulo);
                fila.appendChild(tdDesc);
                fila.appendChild(tdFecha);
                fila.appendChild(tdEstado);
                fila.appendChild(tdAcciones);

                tbody.appendChild(fila);
            });
        } else {
            console.error("Error al cargar incidencias:", result.mensaje);
        }
    } catch (error) {
        console.error("Error de red al cargar incidencias:", error);
    }
}

// Cancelación dinámica de incidencias sin recargar la página
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
            cargarIncidencias(); // Actualiza la tabla dinámicamente
        } else {
            alert('No se pudo cancelar: ' + result.mensaje);
        }
    } catch (error) {
        console.error("Error al cancelar la incidencia:", error);
        alert('Error de conexión con el servidor.');
    }
}