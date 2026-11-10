document.addEventListener('DOMContentLoaded', () => {
    mostrarUsuarioLogueado();

    const btnNuevaIncidencia = document.getElementById('btn-nueva-incidencia');
    const btnCancelarForm = document.getElementById('btn-cancelar-form');
    const seccionFormulario = document.getElementById('seccion-crear-incidencia');
    const formCrearIncidencia = document.getElementById('form-crear-incidencia');
    const btnVerIncidencias = document.getElementById('btn-ver-incidencias');

    if (btnNuevaIncidencia && seccionFormulario) {
        btnNuevaIncidencia.addEventListener('click', () => {
            seccionFormulario.style.display = 'block';
            btnNuevaIncidencia.style.display = 'none';
        });
    }

    if (btnCancelarForm) {
        btnCancelarForm.addEventListener('click', () => {
            seccionFormulario.style.display = 'none';
            if (btnNuevaIncidencia) btnNuevaIncidencia.style.display = 'inline-block';
        });
    }

    //Cargar selectores y listas
    cargarArticulos();
    cargarCategorias();
    cargarIncidencias();
    cargarCatalogoArticulos();

    if (btnVerIncidencias) {
        btnVerIncidencias.addEventListener('click', cargarIncidencias);
    }

    //Captura envío del formulario
    if (formCrearIncidencia) {
        formCrearIncidencia.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await crearIncidencia();
        });
    }
});


//Muestra empleado logueado
function mostrarUsuarioLogueado() {
    const usuarioSpan = document.getElementById('nombre-usuario');
    const usuarioData = localStorage.getItem('usuario');

    if (usuarioSpan && usuarioData) {
        try {
            const user = JSON.parse(usuarioData);
            const nombreCompleto = (user.nombres && user.apellidos)
                ? `${user.nombres} ${user.apellidos}`
                : (user.nombre || user.usuario || 'Empleado');

            usuarioSpan.textContent = `Usuario: ${nombreCompleto}`;
        } catch (e) {
            console.error("Error al leer datos de usuario:", e);
        }
    }
}

//Crear incidencia
async function crearIncidencia() {
    const token = localStorage.getItem('token');
    const selectArticulo = document.getElementById('select-articulo');
    const txtDescripcion = document.getElementById('descripcion-problema');

    const rawArticulo = selectArticulo ? selectArticulo.value : '';
    const descripcion_pedido = txtDescripcion ? txtDescripcion.value.trim() : '';

    if (!rawArticulo || !descripcion_pedido) {
        alert('Por favor elegí un artículo y escribí una descripción.');
        return;
    }

    const id_articulo = Number(rawArticulo);

    try {
        const response = await fetch('http://localhost:3000/api/v1/incidencias', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_articulo, descripcion_pedido })
        });

        const result = await response.json();

        if (response.ok && (result.ok || result.success)) {
            alert('Incidencia creada con éxito.');

            //Limpiar y ocultar formulario
            const form = document.getElementById('form-crear-incidencia');
            if (form) form.reset();

            const seccionForm = document.getElementById('seccion-crear-incidencia');
            if (seccionForm) seccionForm.style.display = 'none';

            const btnNueva = document.getElementById('btn-nueva-incidencia');
            if (btnNueva) btnNueva.style.display = 'inline-block';

            //Recargar tabla de incidencias
            cargarIncidencias();
        } else {
            console.error("Respuesta de error del servidor:", result);
            let msg = result.mensaje || 'Error al guardar la incidencia';
            if (result.errores && Array.isArray(result.errores)) {
                msg += ': ' + result.errores.map(err => err.msg).join(', ');
            }
            alert(msg);
        }
    } catch (error) {
        console.error("Error de red al crear incidencia:", error);
        alert('Error de conexión con el servidor.');
    }
}

//Cargar listado de incidencias
async function cargarIncidencias() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const tbody = document.getElementById('tabla-incidencias');
    if (!tbody) return;

    try {
        const response = await fetch('http://localhost:3000/api/v1/incidencias', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            tbody.replaceChildren();
            const incidencias = result.data || [];

            if (incidencias.length === 0) {
                const filaVacia = document.createElement('tr');
                const tdVacio = document.createElement('td');
                tdVacio.colSpan = 6;
                tdVacio.style.padding = '15px';
                tdVacio.style.textAlign = 'center';
                tdVacio.textContent = 'No tenés incidencias reportadas.';
                filaVacia.appendChild(tdVacio);
                tbody.appendChild(filaVacia);
                return;
            }

            incidencias.forEach(incidencia => {
                const fila = crearFilaIncidencia(incidencia);
                tbody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error("Error al cargar incidencias:", error);
    }
}

function crearFilaIncidencia(incidencia) {
    const fila = document.createElement('tr');

    let fechaTexto = '-';
    if (incidencia.creado || incidencia.fecha) {
        const f = new Date(incidencia.creado || incidencia.fecha);
        fechaTexto = isNaN(f.getTime()) ? (incidencia.creado || incidencia.fecha) : f.toLocaleDateString('es-AR');
    }

    const tdId = document.createElement('td');
    tdId.style.padding = '10px';
    tdId.style.borderBottom = '1px solid #ddd';
    tdId.textContent = `#${incidencia.id_incidencia}`;

    const tdArticulo = document.createElement('td');
    tdArticulo.style.padding = '10px';
    tdArticulo.style.borderBottom = '1px solid #ddd';
    tdArticulo.textContent = incidencia.articulo_descripcion || (incidencia.Articulo ? incidencia.Articulo.descripcion : 'General');

    const tdDesc = document.createElement('td');
    tdDesc.style.padding = '10px';
    tdDesc.style.borderBottom = '1px solid #ddd';
    tdDesc.textContent = incidencia.descripcion_pedido;

    const tdFecha = document.createElement('td');
    tdFecha.style.padding = '10px';
    tdFecha.style.borderBottom = '1px solid #ddd';
    tdFecha.textContent = fechaTexto;

    const tdEstado = document.createElement('td');
    tdEstado.style.padding = '10px';
    tdEstado.style.borderBottom = '1px solid #ddd';

    const tagEstado = document.createElement('span');
    tagEstado.style.fontWeight = 'bold';

    const tdAcciones = document.createElement('td');
    tdAcciones.style.padding = '10px';
    tdAcciones.style.borderBottom = '1px solid #ddd';

    const idEstado = Number(incidencia.id_estado);

    if (idEstado === 1) {
        tagEstado.style.color = '#e67e22';
        tagEstado.textContent = 'Pendiente';

        const btnCancelar = document.createElement('button');
        btnCancelar.type = 'button';
        btnCancelar.textContent = 'Cancelar Incidencia';
        btnCancelar.style.cssText = 'background-color: #dc3545; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: bold;';

        btnCancelar.addEventListener('click', () => cancelarIncidencia(incidencia.id_incidencia, fila));
        tdAcciones.appendChild(btnCancelar);

    } else if (idEstado === 2) {
        tagEstado.style.color = '#17a2b8';
        tagEstado.textContent = 'En Proceso';
        tdAcciones.textContent = '-';
    } else if (idEstado === 3) {
        tagEstado.style.color = '#28a745';
        tagEstado.textContent = 'Resuelta';
        tdAcciones.textContent = '-';
    } else if (idEstado === 4) {
        tagEstado.style.color = '#6c757d';
        tagEstado.textContent = 'Cancelada';
        tdAcciones.textContent = '-';
    } else {
        tagEstado.textContent = incidencia.estado_descripcion || `Estado #${idEstado}`;
        tdAcciones.textContent = '-';
    }

    tdEstado.appendChild(tagEstado);

    fila.appendChild(tdId);
    fila.appendChild(tdArticulo);
    fila.appendChild(tdDesc);
    fila.appendChild(tdFecha);
    fila.appendChild(tdEstado);
    fila.appendChild(tdAcciones);

    return fila;
}

//Cancelar incidencia
function cancelarIncidencia(idIncidencia, filaElemento) {
    const modal = document.getElementById('modal-confirm');
    const msg = document.getElementById('modal-mensaje');
    const btnAceptar = document.getElementById('btn-modal-aceptar');
    const btnCancelar = document.getElementById('btn-modal-cancelar');

    if (!modal) {
        if (confirm(`¿Estás seguro de que querés cancelar la incidencia #${idIncidencia}?`)) {
            ejecutarCancelacion(idIncidencia, filaElemento);
        }
        return;
    }

    msg.textContent = `¿Estás seguro de que querés cancelar la incidencia #${idIncidencia}?`;
    modal.style.display = 'flex';

    const nuevoBtnAceptar = btnAceptar.cloneNode(true);
    const nuevoBtnCancelar = btnCancelar.cloneNode(true);

    btnAceptar.parentNode.replaceChild(nuevoBtnAceptar, btnAceptar);
    btnCancelar.parentNode.replaceChild(nuevoBtnCancelar, btnCancelar);

    nuevoBtnAceptar.addEventListener('click', async () => {
        modal.style.display = 'none';
        await ejecutarCancelacion(idIncidencia, filaElemento);
    });

    nuevoBtnCancelar.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

async function ejecutarCancelacion(idIncidencia, filaElemento) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:3000/api/v1/incidencias/${idIncidencia}/cancelar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok && (result.ok || result.success)) {
            filaElemento.remove();
        } else {
            alert('No se pudo cancelar: ' + (result.mensaje || 'Error del servidor'));
        }
    } catch (error) {
        console.error("Error al cancelar la incidencia:", error);
        alert('Error de conexión con el servidor.');
    }
}

//Cargar selectores y lista de articulos
async function cargarArticulos() {
    const selectArticulo = document.getElementById('select-articulo');
    const token = localStorage.getItem('token');
    if (!token || !selectArticulo) return;

    try {
        const response = await fetch('http://localhost:3000/api/v1/articulos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok) {
            selectArticulo.replaceChildren();
            const optionDefault = document.createElement('option');
            optionDefault.value = '';
            optionDefault.textContent = '-- Seleccionar Artículo --';
            selectArticulo.appendChild(optionDefault);

            (result.data || []).forEach(art => {
                const opt = document.createElement('option');
                opt.value = art.id_articulo;
                opt.textContent = art.descripcion;
                selectArticulo.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Error al cargar artículos:", e);
    }
}

async function cargarCategorias() {
    const selectCategoria = document.getElementById('select-categoria');
    const token = localStorage.getItem('token');
    if (!token || !selectCategoria) return;

    try {
        const response = await fetch('http://localhost:3000/api/v1/categorias', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok) {
            selectCategoria.replaceChildren();
            const optionDefault = document.createElement('option');
            optionDefault.value = '';
            optionDefault.textContent = '-- Seleccionar Categoría --';
            selectCategoria.appendChild(optionDefault);

            (result.data || []).forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id_categoria;
                opt.textContent = cat.descripcion;
                selectCategoria.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Error al cargar categorías:", e);
    }
}

//Listado de articulos
async function cargarCatalogoArticulos() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('tabla-articulos-catalogo');
    if (!token || !tbody) return;

    try {
        const response = await fetch('http://localhost:3000/api/v1/articulos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.data) {
            tbody.replaceChildren();
            result.data.forEach(art => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">#${art.id_articulo}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${art.descripcion}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${art.categoria_descripcion || 'General'}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error("Error al cargar catálogo de artículos:", e);
    }
}