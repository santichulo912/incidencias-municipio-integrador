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

    // Logout
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
                tbodyCat.innerHTML = `<tr><td colspan="2" style="padding: 8px; text-align: center;">Sin registros</td></tr>`;
            } else {
                categorias.forEach(c => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td style="padding: 8px; border-bottom: 1px solid #ddd;">${c.categoria}</td><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">${c.total}</td>`;
                    tbodyCat.appendChild(tr);
                });
            }
        }

        if (tbodyFec) {
            tbodyFec.replaceChildren();
            const fechas = result.data.por_fecha || [];
            if (fechas.length === 0) {
                tbodyFec.innerHTML = `<tr><td colspan="2" style="padding: 8px; text-align: center;">Sin registros en los últimos 7 días</td></tr>`;
            } else {
                fechas.forEach(f => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td style="padding: 8px; border-bottom: 1px solid #ddd;">${f.fecha}</td><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">${f.cantidad}</td>`;
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
            tbody.innerHTML = `<tr><td colspan="8" style="padding: 10px; text-align: center;">No hay incidencias registradas</td></tr>`;
            return;
        }

        result.data.forEach(inc => {
            const tr = document.createElement('tr');

            const idEstado = Number(inc.id_estado);
            const esFinalizada = (idEstado === 3 || idEstado === 4); // Resuelta o Cancelada
            const esPendiente = (idEstado === 1); // Pendiente

            let colAsignarHTML = '';
            if (esFinalizada) {
                colAsignarHTML = `<span style="color: #6c757d; font-style: italic;">${inc.nombre_tecnico || 'Sin Asignar'}</span>`;
            } else {
                let optionsTecnicos = `<option value="">-- Seleccionar --</option>`;
                listaTecnicosGlobal.forEach(tec => {
                    const selected = (inc.asignado_a === tec.id_usuario) ? 'selected' : '';
                    optionsTecnicos += `<option value="${tec.id_usuario}" ${selected}>${tec.nombres || tec.nombre} ${tec.apellidos || tec.apellido || ''}</option>`;
                });
                colAsignarHTML = `
                    <select class="select-tecnico-auto" data-id="${inc.id_incidencia}" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc; width: 100%;">
                        ${optionsTecnicos}
                    </select>
                `;
            }

            // Columna Acciones (Solo muestra Cancelar en estado Pendiente)
            let colAccionesHTML = '';
            if (esPendiente) {
                colAccionesHTML = `
                    <button class="btn-cancelar-dir" data-id="${inc.id_incidencia}" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">Cancelar</button>
                `;
            } else if (esFinalizada) {
                colAccionesHTML = `<span style="color: #6c757d; font-size: 13px;">Finalizada</span>`;
            } else {
                colAccionesHTML = `<span style="color: #17a2b8; font-size: 13px;">En Proceso</span>`;
            }

            tr.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">#${inc.id_incidencia}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.nombre_empleado || 'N/A'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.articulo_descripcion || 'N/A'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.descripcion_pedido}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${inc.creado ? inc.creado.substring(0, 10) : '-'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>${inc.estado_descripcion || inc.id_estado}</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${colAsignarHTML}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${colAccionesHTML}</td>
            `;

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

        //Botón de cancelar incidencias
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