document.addEventListener('DOMContentLoaded', async () => {
    //Verificar Token y Sesión
    const token = localStorage.getItem('token');
    const usuarioRaw = localStorage.getItem('usuario');

    if (!token || !usuarioRaw) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioRaw);

    //Configurar Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    //Mostrar nombre del tecnico
    const elNombre = document.getElementById('nombre-usuario');
    if (elNombre) {
        const nombreCompleto = `${usuario.nombres || usuario.nombre || ''} ${usuario.apellidos || usuario.apellido || ''}`.trim();
        elNombre.textContent = nombreCompleto || usuario.usuario || 'Técnico';
    }

    //Configurar formularios
    configurarFormularios();

    //Cargar Datos Iniciales
    try { await cargarCategorias(); } catch (e) { console.error('Error al cargar categorías:', e); }
    try { await cargarArticulos(); } catch (e) { console.error('Error al cargar artículos:', e); }
    try { await cargarIncidenciasTecnico(); } catch (e) { console.error('Error al cargar incidencias:', e); }
});

//Cargar categorias
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
                tbodyCat.innerHTML = `<tr><td colspan="3" style="padding: 8px; text-align: center;">No hay categorías registradas</td></tr>`;
            } else {
                listaCategorias.forEach(cat => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${cat.id_categoria}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${cat.descripcion}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                            <button class="btn-editar-cat" data-id="${cat.id_categoria}" data-desc="${cat.descripcion}" style="background: #ffc107; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold; margin-right: 4px;">Editar</button>
                            <button class="btn-eliminar-cat" data-id="${cat.id_categoria}" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold;">Eliminar</button>
                        </td>
                    `;
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

        //Llena Select del formulario de articulos
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

//Carga articulos en la tabla del tecnico
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
            tbodyArt.innerHTML = `<tr><td colspan="4" style="padding: 8px; text-align: center;">No hay artículos en el catálogo</td></tr>`;
            return;
        }

        result.data.forEach(art => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${art.id_articulo}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${art.descripcion}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${art.categoria_descripcion || 'Sin categoría'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                    <button class="btn-editar-art" data-id="${art.id_articulo}" data-desc="${art.descripcion}" data-cat="${art.id_categoria}" style="background: #ffc107; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold; margin-right: 4px;">Editar</button>
                    <button class="btn-eliminar-art" data-id="${art.id_articulo}" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold;">Eliminar</button>
                </td>
            `;
            tbodyArt.appendChild(tr);
        });

        //Editamos articulo
        document.querySelectorAll('.btn-editar-art').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const desc = e.target.getAttribute('data-desc');
                const catId = e.target.getAttribute('data-cat');

                document.getElementById('art-id').value = id;
                document.getElementById('art-descripcion').value = desc;
                const selectCat = document.getElementById('art-select-cat');
                if (selectCat) selectCat.value = catId;

                document.getElementById('titulo-form-art').textContent = 'Editar Artículo';
                const btnCancel = document.getElementById('btn-cancelar-art');
                if (btnCancel) btnCancel.style.display = 'inline-block';
            });
        });

        //Eliminamos articulo
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

//Carga incidencias asignadas
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
            tbodyInc.innerHTML = `<tr><td colspan="7" style="padding: 10px; text-align: center;">No tenés incidencias asignadas a tu cargo</td></tr>`;
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

            let botonesHTML = '';
            if (idEstado === 1) {
                // Pendiente -> Iniciar Incidencia (Pasa a En Proceso)
                botonesHTML = `
                    <button class="btn-estado" data-id="${inc.id_incidencia}" data-estado="2" style="background: #17a2b8; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Iniciar Incidencia</button>
                `;
            } else if (idEstado === 2) {
                // En Proceso -> Finalizar Incidencia (Pasa a Resuelta)
                botonesHTML = `
                    <button class="btn-estado" data-id="${inc.id_incidencia}" data-estado="3" style="background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Finalizar / Resolver</button>
                `;
            } else if (idEstado === 3) {
                botonesHTML = `<span style="color: #28a745; font-weight: bold;">Resuelta</span>`;
            } else if (idEstado === 4) {
                botonesHTML = `<span style="color: #dc3545; font-weight: bold;">Cancelada</span>`;
            }

            tr.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">#${inc.id_incidencia}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.nombre_empleado || 'N/A'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.articulo_descripcion || 'N/A'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.descripcion_pedido}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.creado ? inc.creado.substring(0, 10) : '-'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>${nombreEstado}</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${botonesHTML}</td>
            `;
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

//Formularios
function configurarFormularios() {
    //Formulario de categorias
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

    //Formulario de articulos
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