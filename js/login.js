document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const documento = document.getElementById("usuario").value;
      const contrasena = document.getElementById("contrasena").value;

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
            if (response.status === 401) {
              return response.text().then((text) => {
                throw new Error(text);
              });
            }
            throw new Error("Error en la solicitud");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Respuesta del servidor:", data);
          const nombre = data.nombre;
          const rol = data.rol;

          localStorage.setItem("nombre", nombre);

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
          alert(error.message);
        });
    });
});
