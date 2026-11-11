let listaTecnicosGlobal = [];

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const usuarioRaw = localStorage.getItem('usuario');

    if (!token || !usuarioRaw) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioRaw);

    if (Number(usuario.rol) !== 1) {
        window.location.href = 'login.html';
        return;
    }

    //Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    //Muestra nombre de usuario
    const elNombre = document.getElementById('nombre-usuario');
    if (elNombre) {
        elNombre.textContent = `${usuario.nombres || usuario.nombre || ''} ${usuario.apellidos || usuario.apellido || ''}`.trim() || usuario.usuario || 'Director';
    }

    configurarModalCancelacion();

    try { await obtenerListaTecnicos(); } catch (e) { console.error('Error al obtener técnicos:', e); }
    try { await cargarDashboard(); } catch (e) { console.error('Error Dashboard:', e); }
    try { await cargarReportes(); } catch (e) { console.error('Error Reportes:', e); }
    try { await cargarIncidenciasDirector(); } catch (e) { console.error('Error Incidencias:', e); }
});

async function obtenerListaTecnicos() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('http://localhost:3000/api/v1/incidencias/tecnicos', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (response.ok && result.data) {
        listaTecnicosGlobal = result.data;
    }
}

async function cargarDashboard() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('http://localhost:3000/api/v1/incidencias/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (response.ok && result.data) {
        const d = result.data;
        if (document.getElementById('dash-pendientes')) document.getElementById('dash-pendientes').textContent = d.pendientes || 0;
        if (document.getElementById('dash-proceso')) document.getElementById('dash-proceso').textContent = d.en_proceso || 0;
        if (document.getElementById('dash-resueltas')) document.getElementById('dash-resueltas').textContent = d.resueltas || 0;
        if (document.getElementById('dash-hoy')) document.getElementById('dash-hoy').textContent = d.total_hoy || 0;
    }
}

async function cargarReportes() {
    const token = localStorage.getItem('token');
    const tbodyCat = document.getElementById('tabla-reporte-categorias');
    const tbodyFec = document.getElementById('tabla-reporte-fechas');

    if (!token) return;

    const response = await fetch('http://localhost:3000/api/v1/incidencias/reportes', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (response.ok && result.data) {
        if (tbodyCat) {
            tbodyCat.replaceChildren();
            const categorias = result.data.por_categoria || [];
            if (categorias.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 2;
                td.style.padding = '8px';
                td.style.textAlign = 'center';
                td.textContent = 'Sin registros';
                tr.appendChild(td);
                tbodyCat.appendChild(tr);
            } else {
                categorias.forEach(c => {
                    const tr = document.createElement('tr');

                    const tdCat = document.createElement('td');
                    tdCat.style.padding = '8px';
                    tdCat.style.borderBottom = '1px solid #ddd';
                    tdCat.textContent = c.categoria;

                    const tdTotal = document.createElement('td');
                    tdTotal.style.padding = '8px';
                    tdTotal.style.fontWeight = 'bold';
                    tdTotal.style.borderBottom = '1px solid #ddd';
                    tdTotal.textContent = c.total;

                    tr.appendChild(tdCat);
                    tr.appendChild(tdTotal);
                    tbodyCat.appendChild(tr);
                });
            }
        }

        if (tbodyFec) {
            tbodyFec.replaceChildren();
            const fechas = result.data.por_fecha || [];
            if (fechas.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 2;
                td.style.padding = '8px';
                td.style.textAlign = 'center';
                td.textContent = 'Sin registros';
                tr.appendChild(td);
                tbodyFec.appendChild(tr);
            } else {
                fechas.forEach(f => {
                    const tr = document.createElement('tr');

                    const tdFecha = document.createElement('td');
                    tdFecha.style.padding = '8px';
                    tdFecha.style.borderBottom = '1px solid #ddd';
                    tdFecha.textContent = f.fecha;

                    const tdCant = document.createElement('td');
                    tdCant.style.padding = '8px';
                    tdCant.style.fontWeight = 'bold';
                    tdCant.style.borderBottom = '1px solid #ddd';
                    tdCant.textContent = f.cantidad;

                    tr.appendChild(tdFecha);
                    tr.appendChild(tdCant);
                    tbodyFec.appendChild(tr);
                });
            }
        }
    }
}

//Listado de incidencias
async function cargarIncidenciasDirector() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('tabla-director-incidencias');
    if (!token || !tbody) return;

    const response = await fetch('http://localhost:3000/api/v1/incidencias', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (response.ok && result.data) {
        tbody.replaceChildren();

        if (result.data.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 8;
            td.style.padding = '10px';
            td.style.textAlign = 'center';
            td.textContent = 'No hay incidencias registradas';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        result.data.forEach(inc => {
            const tr = document.createElement('tr');

            const idEstado = Number(inc.id_estado);
            const esFinalizada = (idEstado === 3 || idEstado === 4); // Resuelta o Cancelada
            const esPendiente = (idEstado === 1); // Pendiente

            //Columna ID
            const tdId = document.createElement('td');
            tdId.style.padding = '10px';
            tdId.style.borderBottom = '1px solid #ddd';
            tdId.textContent = `#${inc.id_incidencia}`;

            //Columna solicitado por
            const tdEmpleado = document.createElement('td');
            tdEmpleado.style.padding = '10px';
            tdEmpleado.style.borderBottom = '1px solid #ddd';
            tdEmpleado.textContent = inc.nombre_empleado || 'N/A';

            //Columna articulo
            const tdArt = document.createElement('td');
            tdArt.style.padding = '10px';
            tdArt.style.borderBottom = '1px solid #ddd';
            tdArt.textContent = inc.articulo_descripcion || 'N/A';

            //Columna descripción
            const tdDesc = document.createElement('td');
            tdDesc.style.padding = '10px';
            tdDesc.style.borderBottom = '1px solid #ddd';
            tdDesc.textContent = inc.descripcion_pedido;

            //Columna fecha
            const tdFecha = document.createElement('td');
            tdFecha.style.padding = '10px';
            tdFecha.style.borderBottom = '1px solid #ddd';
            tdFecha.textContent = inc.creado ? inc.creado.substring(0, 10) : '-';

            //Columna estado
            const tdEstado = document.createElement('td');
            tdEstado.style.padding = '10px';
            tdEstado.style.borderBottom = '1px solid #ddd';
            const strongEstado = document.createElement('strong');

            let textoEstado = inc.estado_descripcion || inc.id_estado;
            if (idEstado === 3 || String(textoEstado).toLowerCase().includes('resuel')) {
                textoEstado = 'Resuelta';
            } else if (idEstado === 4 || String(textoEstado).toLowerCase().includes('cancel')) {
                textoEstado = 'Cancelada';
            }
            strongEstado.textContent = textoEstado;
            tdEstado.appendChild(strongEstado);

            //Columna asignar tecnico
            const tdAsignar = document.createElement('td');
            tdAsignar.style.padding = '10px';
            tdAsignar.style.borderBottom = '1px solid #ddd';

            if (esFinalizada) {
                const spanTec = document.createElement('span');
                spanTec.style.color = '#6c757d';
                spanTec.style.fontStyle = 'italic';
                spanTec.textContent = inc.nombre_tecnico || 'Sin Asignar';
                tdAsignar.appendChild(spanTec);
            } else {
                const select = document.createElement('select');
                select.className = 'select-tecnico-auto';
                select.setAttribute('data-id', inc.id_incidencia);
                select.style.cssText = 'padding: 5px; border-radius: 4px; border: 1px solid #ccc; width: 100%;';

                const optDefault = document.createElement('option');
                optDefault.value = '';
                optDefault.textContent = '-- Seleccionar --';
                select.appendChild(optDefault);

                listaTecnicosGlobal.forEach(tec => {
                    const option = document.createElement('option');
                    option.value = tec.id_usuario;
                    option.textContent = `${tec.nombres || tec.nombre} ${tec.apellidos || tec.apellido || ''}`.trim();
                    if (inc.asignado_a === tec.id_usuario) option.selected = true;
                    select.appendChild(option);
                });

                tdAsignar.appendChild(select);
            }

            //Columna acciones
            const tdAcciones = document.createElement('td');
            tdAcciones.style.padding = '10px';
            tdAcciones.style.borderBottom = '1px solid #ddd';

            if (esPendiente) {
                const btnCancel = document.createElement('button');
                btnCancel.className = 'btn-cancelar-dir';
                btnCancel.setAttribute('data-id', inc.id_incidencia);
                btnCancel.textContent = 'Cancelar';
                btnCancel.style.cssText = 'background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;';
                tdAcciones.appendChild(btnCancel);
            } else if (esFinalizada) {
                const spanAcc = document.createElement('span');
                spanAcc.style.color = '#6c757d';
                spanAcc.style.fontSize = '13px';
                spanAcc.textContent = 'Finalizada';
                tdAcciones.appendChild(spanAcc);
            } else {
                const spanAcc = document.createElement('span');
                spanAcc.style.color = '#17a2b8';
                spanAcc.style.fontSize = '13px';
                spanAcc.textContent = 'En Proceso';
                tdAcciones.appendChild(spanAcc);
            }

            tr.appendChild(tdId);
            tr.appendChild(tdEmpleado);
            tr.appendChild(tdArt);
            tr.appendChild(tdDesc);
            tr.appendChild(tdFecha);
            tr.appendChild(tdEstado);
            tr.appendChild(tdAsignar);
            tr.appendChild(tdAcciones);

            tbody.appendChild(tr);
        });

        document.querySelectorAll('.select-tecnico-auto').forEach(select => {
            select.addEventListener('change', async (e) => {
                const idIncidencia = e.target.getAttribute('data-id');
                const idTecnico = e.target.value;

                if (idTecnico) {
                    await ejecutarAsignacion(idIncidencia, idTecnico);
                }
            });
        });

        //Botón de cancelar incidencia
        document.querySelectorAll('.btn-cancelar-dir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idIncidencia = e.target.getAttribute('data-id');
                abrirModalCancelar(idIncidencia);
            });
        });
    }
}

async function ejecutarAsignacion(id_incidencia, id_tecnico) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/api/v1/incidencias/${id_incidencia}/asignar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_tecnico })
        });

        if (response.ok) {
            await cargarIncidenciasDirector();
            await cargarDashboard();
        }
    } catch (error) {
        console.error('Error al realizar asignación:', error);
    }
}

let incidenciaACancelarId = null;

function abrirModalCancelar(id_incidencia) {
    incidenciaACancelarId = id_incidencia;
    const modal = document.getElementById('modal-confirm');
    const msg = document.getElementById('modal-mensaje');
    if (msg) msg.textContent = `¿Estás seguro de que querés cancelar la incidencia #${id_incidencia}?`;
    if (modal) modal.style.display = 'flex';
}

function configurarModalCancelacion() {
    const modal = document.getElementById('modal-confirm');
    const btnVolver = document.getElementById('btn-modal-cancelar');
    const btnAceptar = document.getElementById('btn-modal-aceptar');

    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
            incidenciaACancelarId = null;
        });
    }

    if (btnAceptar) {
        btnAceptar.addEventListener('click', async () => {
            if (!incidenciaACancelarId) return;
            const token = localStorage.getItem('token');

            try {
                const response = await fetch(`http://localhost:3000/api/v1/incidencias/${incidenciaACancelarId}/cancelar`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    if (modal) modal.style.display = 'none';
                    incidenciaACancelarId = null;
                    await cargarIncidenciasDirector();
                    await cargarDashboard();
                }
            } catch (error) {
                console.error('Error al cancelar la incidencia:', error);
            }
        });
    }
}