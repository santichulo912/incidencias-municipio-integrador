// Al inicio del archivo, capturamos los elementos del nuevo formulario (Paso 4)
const formCategoria = document.getElementById('form-categoria');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
});

// Función principal para consultar y renderizar la lista
async function cargarCategorias() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("No estás logueado. Redirigiendo al login...");
        window.location.href = 'index.html';
        return;
    }

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
            const tbody = document.getElementById('cuerpo-tabla');
            tbody.replaceChildren(); // Limpia el cuerpo de la tabla de forma segura

            result.data.forEach(categoria => {
                const fila = crearFilaCategoria(categoria);
                tbody.appendChild(fila);
            });
        } else {
            console.error("Error del servidor:", result.mensaje);
            alert("Error al cargar categorías: " + result.mensaje);
        }

    } catch (error) {
        console.error("Error de red:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

// Función helper para construir elementos <tr>
function crearFilaCategoria(categoria) {
    const fila = document.createElement('tr');
    fila.setAttribute('data-id', categoria.id_categoria);

    const tdId = document.createElement('td');
    tdId.style.padding = '10px';
    tdId.style.borderBottom = '1px solid #ddd';
    tdId.textContent = categoria.id_categoria;

    const tdDesc = document.createElement('td');
    tdDesc.style.padding = '10px';
    tdDesc.style.borderBottom = '1px solid #ddd';
    tdDesc.textContent = categoria.descripcion;

    const tdAcciones = document.createElement('td');
    tdAcciones.style.padding = '10px';
    tdAcciones.style.borderBottom = '1px solid #ddd';

    // Botón Editar
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-editar';
    btnEditar.textContent = 'Editar';
    btnEditar.style.cssText = 'background-color: #ffc107; color: black; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;';
    btnEditar.addEventListener('click', () => prepararEdicion(categoria));

    // Botón Borrar
    const btnBorrar = document.createElement('button');
    btnBorrar.className = 'btn-borrar';
    btnBorrar.textContent = 'Borrar';
    btnBorrar.style.cssText = 'background-color: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;';
    btnBorrar.addEventListener('click', () => eliminarCategoria(categoria.id_categoria, fila));

    tdAcciones.appendChild(btnEditar);
    tdAcciones.appendChild(btnBorrar);

    fila.appendChild(tdId);
    fila.appendChild(tdDesc);
    fila.appendChild(tdAcciones);

    return fila;
}

// Cargar datos en el formulario para editar
function prepararEdicion(categoria) {
    document.getElementById('categoria-id').value = categoria.id_categoria;
    document.getElementById('descripcion-categoria').value = categoria.descripcion;
    document.getElementById('titulo-form').textContent = `Editando Categoría #${categoria.id_categoria}`;
    btnCancelarEdicion.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Borrado dinámico sin recargar la página (window.location.reload)
async function eliminarCategoria(id, filaElemento) {
    const token = localStorage.getItem('token');

    if (confirm(`¿Estás seguro de que deseas eliminar la categoría #${id}?`)) {
        try {
            const response = await fetch(`http://localhost:3000/api/categorias/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Categoría eliminada con éxito.');
                filaElemento.remove(); // Elimina la fila visualmente en vivo
            } else {
                const error = await response.json();
                alert('Error: ' + error.mensaje);
            }
        } catch (error) {
            console.error(error);
        }
    }
}

// Guardar o Actualizar categoría sin reload
formCategoria.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('categoria-id').value;
    const descripcion = document.getElementById('descripcion-categoria').value;

    const url = id ? `http://localhost:3000/api/categorias/${id}` : 'http://localhost:3000/api/categorias';
    const metodo = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ descripcion })
        });

        if (response.ok) {
            alert(id ? 'Categoría actualizada.' : 'Categoría creada exitosamente.');
            limpiarFormulario();
            cargarCategorias(); // Recarga únicamente los datos de la tabla dinámicamente
        } else {
            const error = await response.json();
            alert('Error: ' + (error.mensaje || JSON.stringify(error.errores)));
        }
    } catch (error) {
        console.error(error);
    }
});

function limpiarFormulario() {
    document.getElementById('categoria-id').value = '';
    document.getElementById('descripcion-categoria').value = '';
    document.getElementById('titulo-form').textContent = 'Nueva Categoría';
    btnCancelarEdicion.style.display = 'none';
}

btnCancelarEdicion.addEventListener('click', limpiarFormulario);