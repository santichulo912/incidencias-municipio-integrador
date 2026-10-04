// 1. Selecciona los elementos del DOM usando los IDs del HTML
const loginForm = document.getElementById('loginForm');
const mensajeError = document.getElementById('mensajeError');

// 2. Registra el evento submit
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    // 3. Captura los valores ingresados
    const usuario = document.getElementById('usuario').value;
    const contrasenia = document.getElementById('contrasenia').value;

    try {
        // 4. Envia la petición POST al backend
        const response = await fetch('http://localhost:3000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, contrasenia })
        });

        const data = await response.json();

        // Si el codigo HTTP no es 200 OK, lanza el error
        if (!response.ok) {
            throw new Error(data.mensaje || 'Credenciales inválidas');
        }

        // 5. Exito: Guardamos el token y damos feedback visual
        console.log("Token recibido:", data.token);
        localStorage.setItem('token', data.token); 
        
        mensajeError.style.color = "#4CAF50";
        mensajeError.textContent = "¡Ingreso exitoso! Redirigiendo...";

        // Proximo salto a otra pantalla:
        // window.location.href = 'dashboard.html';

    } catch (error) {
        // 6. Error: Muestra el mensaje en la interfaz
        console.error(error);
        mensajeError.style.color = "#dc3545";
        mensajeError.textContent = error.message;
    }
});