document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevenir que se recargue la página

      // Aquí usamos los IDs correctos que están en tu HTML: 'usuario' y 'contrasena'
      const documento = document.getElementById("usuario").value;
      const contrasena = document.getElementById("contrasena").value;

      // Enviar las credenciales al backend
      fetch("http://localhost:8080/empleados/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documento: documento,
          contrasena: contrasena,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            // Si la respuesta no es ok (código 2xx), verificamos el código específico
            if (response.status === 401) {
              return response.text().then((text) => {
                throw new Error(text); // Mostrar el mensaje de error
              });
            }
            throw new Error("Error en la solicitud");
          }
          return response.json(); // Usamos .json() para obtener los datos (nombre y rol)
        })
        .then((data) => {
          console.log("Respuesta del servidor:", data);
          const nombre = data.nombre;
          const rol = data.rol;

          // Almacenar el nombre en el localStorage para usarlo en la página redirigida
          localStorage.setItem("nombre", nombre);

          // Redirigir según el rol
          if (rol === "Gerente") {
            window.location.href = "../html/gerente.html";
          } else if (rol === "Taquillero") {
            window.location.href = "../html/taquillero.html";
          } else {
            alert("Rol no encontrado");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert(error.message); // Muestra el mensaje de error personalizado
        });
    });
});
