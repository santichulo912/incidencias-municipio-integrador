document.addEventListener('DOMContentLoaded', async () => {
    // Verificar Token y Sesión
    const token = localStorage.getItem('token');
    const usuarioRaw = localStorage.getItem('usuario');

    if (!token || !usuarioRaw) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioRaw);

    // Configurar Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    // Mostrar nombre del técnico
    const elNombre = document.getElementById('nombre-usuario');
    if (elNombre) {
        const nombreCompleto = `${usuario.nombres || usuario.nombre || ''} ${usuario.apellidos || usuario.apellido || ''}`.trim();
        elNombre.textContent = nombreCompleto || usuario.usuario || 'Técnico';
    }

    // Configurar formularios
    configurarFormularios();

    // Cargar Datos Iniciales
    try { await cargarCategorias(); } catch (e) { console.error('Error al cargar categorías:', e); }
    try { await cargarArticulos(); } catch (e) { console.error('Error al cargar artículos:', e); }
    try { await cargarIncidenciasTecnico(); } catch (e) { console.error('Error al cargar incidencias:', e); }
});

// Cargar categorías
async function cargarCategorias() {
    const token = localStorage.getItem('token');
    const tbodyCat = document.getElementById('tabla-categorias');
    const selectCat = document.getElementById('art-select-cat');

    if (!token) return;

    const response = await fetch('http://localhost:3000/api/v1/categorias', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (response.ok && result.data) {
        const listaCategorias = result.data;

        // A. Llenar Tabla de Categorías
        if (tbodyCat) {
            tbodyCat.replaceChildren();

            if (listaCategorias.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 3;
                td.style.padding = '8px';
                td.style.textAlign = 'center';
                td.textContent = 'No hay categorías registradas';
                tr.appendChild(td);
                tbodyCat.appendChild(tr);
            } else {
                listaCategorias.forEach(cat => {
                    const tr = document.createElement('tr');

                    const tdId = document.createElement('td');
                    tdId.style.padding = '8px';
                    tdId.style.borderBottom = '1px solid #ddd';
                    tdId.textContent = cat.id_categoria;

                    const tdDesc = document.createElement('td');
                    tdDesc.style.padding = '8px';
                    tdDesc.style.borderBottom = '1px solid #ddd';
                    tdDesc.textContent = cat.descripcion;

                    const tdAcciones = document.createElement('td');
                    tdAcciones.style.padding = '8px';
                    tdAcciones.style.borderBottom = '1px solid #ddd';

                    const btnEdit = document.createElement('button');
                    btnEdit.className = 'btn-editar-cat';
                    btnEdit.setAttribute('data-id', cat.id_categoria);
                    btnEdit.setAttribute('data-desc', cat.descripcion);
                    btnEdit.textContent = 'Editar';
                    btnEdit.style.cssText = 'background: #ffc107; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold; margin-right: 4px;';

                    const btnDel = document.createElement('button');
                    btnDel.className = 'btn-eliminar-cat';
                    btnDel.setAttribute('data-id', cat.id_categoria);
                    btnDel.textContent = 'Eliminar';
                    btnDel.style.cssText = 'background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold;';

                    tdAcciones.appendChild(btnEdit);
                    tdAcciones.appendChild(btnDel);

                    tr.appendChild(tdId);
                    tr.appendChild(tdDesc);
                    tr.appendChild(tdAcciones);

                    tbodyCat.appendChild(tr);
                });

                // Eventos de Editar y Eliminar Categoría
                document.querySelectorAll('.btn-editar-cat').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const desc = e.target.getAttribute('data-desc');
                        document.getElementById('cat-id').value = id;
                        document.getElementById('cat-descripcion').value = desc;
                        document.getElementById('titulo-form-cat').textContent = 'Editar Categoría';
                        const btnCancel = document.getElementById('btn-cancelar-cat');
                        if (btnCancel) btnCancel.style.display = 'inline-block';
                    });
                });

                document.querySelectorAll('.btn-eliminar-cat').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = e.target.getAttribute('data-id');
                        if (confirm('¿Desea eliminar esta categoría?')) {
                            await eliminarCategoria(id);
                        }
                    });
                });
            }
        }

        // Llena Select del formulario de artículos
        if (selectCat) {
            const valorActual = selectCat.value;
            selectCat.replaceChildren();
            const optDefault = document.createElement('option');
            optDefault.value = '';
            optDefault.textContent = '-- Seleccionar Categoría --';
            selectCat.appendChild(optDefault);

            listaCategorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_categoria;
                option.textContent = cat.descripcion;
                selectCat.appendChild(option);
            });
            selectCat.value = valorActual;
        }
    }
}

// Carga artículos en la tabla del técnico
async function cargarArticulos() {
    const token = localStorage.getItem('token');
    const tbodyArt = document.getElementById('tabla-articulos');
    if (!token || !tbodyArt) return;

    const response = await fetch('http://localhost:3000/api/v1/articulos', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (response.ok && result.data) {
        tbodyArt.replaceChildren();

        if (result.data.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 4;
            td.style.padding = '8px';
            td.style.textAlign = 'center';
            td.textContent = 'No hay artículos en el catálogo';
            tr.appendChild(td);
            tbodyArt.appendChild(tr);
            return;
        }

        result.data.forEach(art => {
            const tr = document.createElement('tr');

            const tdId = document.createElement('td');
            tdId.style.padding = '8px';
            tdId.style.borderBottom = '1px solid #ddd';
            tdId.textContent = art.id_articulo;

            const tdDesc = document.createElement('td');
            tdDesc.style.padding = '8px';
            tdDesc.style.borderBottom = '1px solid #ddd';
            tdDesc.textContent = art.descripcion;

            const tdCat = document.createElement('td');
            tdCat.style.padding = '8px';
            tdCat.style.borderBottom = '1px solid #ddd';
            tdCat.textContent = art.categoria_descripcion || 'Sin categoría';

            const tdAcciones = document.createElement('td');
            tdAcciones.style.padding = '8px';
            tdAcciones.style.borderBottom = '1px solid #ddd';

            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn-editar-art';
            btnEdit.setAttribute('data-id', art.id_articulo);
            btnEdit.setAttribute('data-desc', art.descripcion);
            btnEdit.setAttribute('data-cat', art.id_categoria);
            btnEdit.textContent = 'Editar';
            btnEdit.style.cssText = 'background: #ffc107; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold; margin-right: 4px;';

            const btnDel = document.createElement('button');
            btnDel.className = 'btn-eliminar-art';
            btnDel.setAttribute('data-id', art.id_articulo);
            btnDel.textContent = 'Eliminar';
            btnDel.style.cssText = 'background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold;';

            tdAcciones.appendChild(btnEdit);
            tdAcciones.appendChild(btnDel);

            tr.appendChild(tdId);
            tr.appendChild(tdDesc);
            tr.appendChild(tdCat);
            tr.appendChild(tdAcciones);

            tbodyArt.appendChild(tr);
        });

        // Editamos artículo
        // Dentro de cargarArticulos() en tecnico.js

        document.querySelectorAll('.btn-editar-art').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const desc = e.target.getAttribute('data-desc');
                const catId = e.target.getAttribute('data-cat');

                document.getElementById('art-id').value = id;
                document.getElementById('art-descripcion').value = desc;

                const selectCat = document.getElementById('art-select-cat');
                if (selectCat) selectCat.value = catId; // Preselecciona la categoría actual

                document.getElementById('titulo-form-art').textContent = 'Editar Artículo';
                const btnCancel = document.getElementById('btn-cancelar-art');
                if (btnCancel) btnCancel.style.display = 'inline-block';
            });
        });

        // Eliminamos artículo
        document.querySelectorAll('.btn-eliminar-art').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Desea eliminar este artículo?')) {
                    await eliminarArticulo(id);
                }
            });
        });
    }
}

// Carga incidencias asignadas
async function cargarIncidenciasTecnico() {
    const token = localStorage.getItem('token');
    const tbodyInc = document.getElementById('tabla-tecnico-incidencias');
    if (!token || !tbodyInc) return;

    const response = await fetch('http://localhost:3000/api/v1/incidencias', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (response.ok && result.data) {
        tbodyInc.replaceChildren();

        if (result.data.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 7;
            td.style.padding = '10px';
            td.style.textAlign = 'center';
            td.textContent = 'No tenés incidencias asignadas a tu cargo';
            tr.appendChild(td);
            tbodyInc.appendChild(tr);
            return;
        }

        result.data.forEach(inc => {
            const tr = document.createElement('tr');
            const idEstado = Number(inc.id_estado);

            let nombreEstado = inc.estado_descripcion || inc.id_estado;
            if (idEstado === 3 || String(nombreEstado).toLowerCase().includes('resuel')) {
                nombreEstado = 'Resuelta';
            } else if (idEstado === 4 || String(nombreEstado).toLowerCase().includes('cancel')) {
                nombreEstado = 'Cancelada';
            }

            const tdId = document.createElement('td');
            tdId.style.padding = '10px';
            tdId.style.borderBottom = '1px solid #ddd';
            tdId.textContent = `#${inc.id_incidencia}`;

            const tdEmp = document.createElement('td');
            tdEmp.style.padding = '10px';
            tdEmp.style.borderBottom = '1px solid #ddd';
            tdEmp.textContent = inc.nombre_empleado || 'N/A';

            const tdArt = document.createElement('td');
            tdArt.style.padding = '10px';
            tdArt.style.borderBottom = '1px solid #ddd';
            tdArt.textContent = inc.articulo_descripcion || 'N/A';

            const tdDesc = document.createElement('td');
            tdDesc.style.padding = '10px';
            tdDesc.style.borderBottom = '1px solid #ddd';
            tdDesc.textContent = inc.descripcion_pedido;

            const tdFecha = document.createElement('td');
            tdFecha.style.padding = '10px';
            tdFecha.style.borderBottom = '1px solid #ddd';
            tdFecha.textContent = inc.creado ? inc.creado.substring(0, 10) : '-';

            const tdEstado = document.createElement('td');
            tdEstado.style.padding = '10px';
            tdEstado.style.borderBottom = '1px solid #ddd';
            const strongEstado = document.createElement('strong');
            strongEstado.textContent = nombreEstado;
            tdEstado.appendChild(strongEstado);

            const tdAcciones = document.createElement('td');
            tdAcciones.style.padding = '10px';
            tdAcciones.style.borderBottom = '1px solid #ddd';

            if (idEstado === 1) {
                const btnState = document.createElement('button');
                btnState.className = 'btn-estado';
                btnState.setAttribute('data-id', inc.id_incidencia);
                btnState.setAttribute('data-estado', '2');
                btnState.textContent = 'Iniciar Incidencia';
                btnState.style.cssText = 'background: #17a2b8; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;';
                tdAcciones.appendChild(btnState);
            } else if (idEstado === 2) {
                const btnState = document.createElement('button');
                btnState.className = 'btn-estado';
                btnState.setAttribute('data-id', inc.id_incidencia);
                btnState.setAttribute('data-estado', '3');
                btnState.textContent = 'Finalizar / Resolver';
                btnState.style.cssText = 'background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;';
                tdAcciones.appendChild(btnState);
            } else if (idEstado === 3) {
                const spanRes = document.createElement('span');
                spanRes.style.color = '#28a745';
                spanRes.style.fontWeight = 'bold';
                spanRes.textContent = 'Resuelta';
                tdAcciones.appendChild(spanRes);
            } else if (idEstado === 4) {
                const spanCanc = document.createElement('span');
                spanCanc.style.color = '#dc3545';
                spanCanc.style.fontWeight = 'bold';
                spanCanc.textContent = 'Cancelada';
                tdAcciones.appendChild(spanCanc);
            }

            tr.appendChild(tdId);
            tr.appendChild(tdEmp);
            tr.appendChild(tdArt);
            tr.appendChild(tdDesc);
            tr.appendChild(tdFecha);
            tr.appendChild(tdEstado);
            tr.appendChild(tdAcciones);

            tbodyInc.appendChild(tr);
        });

        document.querySelectorAll('.btn-estado').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const nuevoEstado = e.target.getAttribute('data-estado');
                await cambiarEstadoIncidencia(id, nuevoEstado);
            });
        });
    }
}

// Formularios
function configurarFormularios() {
    // Formulario de categorías
    const formCat = document.getElementById('form-categoria');
    const btnCancelCat = document.getElementById('btn-cancelar-cat');

    if (formCat) {
        formCat.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const id = document.getElementById('cat-id').value;
            const descripcion = document.getElementById('cat-descripcion').value;

            const url = id
                ? `http://localhost:3000/api/v1/categorias/${id}`
                : 'http://localhost:3000/api/v1/categorias';

            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ descripcion })
            });

            if (response.ok) {
                formCat.reset();
                document.getElementById('cat-id').value = '';
                document.getElementById('titulo-form-cat').textContent = 'Nueva Categoría';
                if (btnCancelCat) btnCancelCat.style.display = 'none';
                await cargarCategorias();
            }
        });
    }

    if (btnCancelCat) {
        btnCancelCat.addEventListener('click', () => {
            formCat.reset();
            document.getElementById('cat-id').value = '';
            document.getElementById('titulo-form-cat').textContent = 'Nueva Categoría';
            btnCancelCat.style.display = 'none';
        });
    }

    // Formulario de artículos
    const formArt = document.getElementById('form-articulo');
    const btnCancelArt = document.getElementById('btn-cancelar-art');

    if (formArt) {
        formArt.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const id = document.getElementById('art-id').value;
            const descripcion = document.getElementById('art-descripcion').value;
            const id_categoria = document.getElementById('art-select-cat').value;

            const url = id
                ? `http://localhost:3000/api/v1/articulos/${id}`
                : 'http://localhost:3000/api/v1/articulos';

            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ descripcion, id_categoria })
            });

            const res = await response.json();

            if (response.ok) {
                formArt.reset();
                document.getElementById('art-id').value = '';
                document.getElementById('titulo-form-art').textContent = 'Nuevo Artículo';
                if (btnCancelArt) btnCancelArt.style.display = 'none';
                await cargarArticulos();
            } else {
                alert(res.mensaje || 'Error al guardar el artículo');
            }
        });
    }

    if (btnCancelArt) {
        btnCancelArt.addEventListener('click', () => {
            formArt.reset();
            document.getElementById('art-id').value = '';
            document.getElementById('titulo-form-art').textContent = 'Nuevo Artículo';
            btnCancelArt.style.display = 'none';
        });
    }
}

async function eliminarCategoria(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/v1/categorias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) await cargarCategorias();
}

async function eliminarArticulo(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/v1/articulos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        await cargarArticulos();
    } else {
        const res = await response.json();
        alert(res.mensaje || 'No se puede eliminar el artículo si está asociado a incidencias.');
    }
}

async function cambiarEstadoIncidencia(id, id_estado) {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/v1/incidencias/${id}/estado`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_estado })
    });
    if (response.ok) await cargarIncidenciasTecnico();
}