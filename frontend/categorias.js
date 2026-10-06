document.addEventListener('DOMContentLoaded', async () => {
    // 1. Recuperamos el token del login
    const token = localStorage.getItem('token');

    if (!token) {
        alert("No estás logueado. Redirigiendo al login...");
        window.location.href = 'index.html'; // Ajustá el nombre si tu login se llama distinto
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
            tbody.innerHTML = ''; // Limpiamos por las dudas

            // 4. Recorremos los datos y creamos las filas
            result.data.forEach(categoria => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${categoria.id_categoria}</td>
                    <td>${categoria.descripcion}</td>
                `;
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
});