// Al inicio del archivo, capturamos los elementos del nuevo formulario (Paso 4)
const formCategoria = document.getElementById('form-categoria');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Recuperamos el token del login
    const token = localStorage.getItem('token');

    if (!token) {
        alert("No estás logueado. Redirigiendo al login...");
        window.location.href = 'index.html'; 
        return;
    }

    try {
        // 2. Pedimos los datos al backend enviando el token
        const response = await fetch('http://localhost:3000/api/categorias', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            // 3. Seleccionamos el cuerpo de la tabla en el HTML
            const tbody = document.getElementById('cuerpo-tabla');
            tbody.innerHTML = ''; 

            // 4. Recorremos los datos y creamos las filas
            result.data.forEach(categoria => {
                const fila = document.createElement('tr');
                
                // --- Agregamos la columna de botones ---
                fila.innerHTML = `
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${categoria.id_categoria}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${categoria.descripcion}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <button class="btn-editar" data-id="${categoria.id_categoria}" data-desc="${categoria.descripcion}" style="background-color: #ffc107; color: black; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;">Editar</button>
                        <button class="btn-borrar" data-id="${categoria.id_categoria}" style="background-color: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">Borrar</button>
                    </td>
                `;
                tbody.appendChild(fila);
            });

            // Una vez que los botones existen en el HTML, les activamos los clics
            asignarEventosBotones();

        } else {
            console.error("Error del servidor:", result.mensaje);
            alert("Error al cargar categorías: " + result.mensaje);
        }

    } catch (error) {
        console.error("Error de red:", error);
        alert("No se pudo conectar con el servidor.");
    }
});

// --- LÓGICA DE LOS BOTONES DE LA TABLA ---
function asignarEventosBotones() {
    const token = localStorage.getItem('token');

    // LÓGICA PARA ELIMINAR (DELETE)
    document.querySelectorAll('.btn-borrar').forEach(boton => {
        boton.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            
            if (confirm(`¿Estás seguro de que deseas eliminar la categoría #${id}?`)) {
                try {
                    const response = await fetch(`http://localhost:3000/api/categorias/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.ok) {
                        alert('Categoría eliminada con éxito.');
                        window.location.reload(); // Recarga la página para actualizar la tabla
                    } else {
                        const error = await response.json();
                        alert('Error: ' + error.mensaje);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        });
    });

    // LÓGICA PARA PREPARAR LA EDICIÓN
    document.querySelectorAll('.btn-editar').forEach(boton => {
        boton.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const desc = e.target.getAttribute('data-desc');
            
            // Llenamos el formulario con los datos viejos
            document.getElementById('categoria-id').value = id;
            document.getElementById('descripcion-categoria').value = desc;
            
            // Cambiamos la interfaz visualmente
            document.getElementById('titulo-form').textContent = `Editando Categoría #${id}`;
            document.getElementById('btn-cancelar-edicion').style.display = 'inline-block';
            
            // Hacemos scroll hacia arriba para que el usuario vea el formulario
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// --- LÓGICA PARA POST Y PUT ---
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
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.mensaje || JSON.stringify(error.errores)));
        }
    } catch (error) {
        console.error(error);
    }
});

// Botón para cancelar la edición y limpiar el formulario
btnCancelarEdicion.addEventListener('click', () => {
    document.getElementById('categoria-id').value = '';
    document.getElementById('descripcion-categoria').value = '';
    document.getElementById('titulo-form').textContent = 'Nueva Categoría';
    btnCancelarEdicion.style.display = 'none';
});