document.addEventListener("DOMContentLoaded", function () {
  const nombre = localStorage.getItem("nombre");

  if (nombre) {
    document.getElementById(
      "usuarioNombre"
    ).textContent = `Bienvenida, ${nombre}`;
  } else {
    // Si no hay un nombre almacenado, redirigir al login
    alert("No has iniciado sesión");
    window.location.href = "../index.html";
  }

  // Manejar el cierre de sesión
  document.getElementById("logoutButton").addEventListener("click", function () {
    if (confirm("¿Seguro que deseas cerrar sesión?")) {
      localStorage.removeItem("nombre"); // Limpiar el nombre almacenado
      window.location.href = "../index.html"; // Redirigir al login
    }
  });
  // Implementación para Funciones



  // Búsqueda para todas las entidades
  // function setupBuscadores() {
  //     // Buscador de Películas
  //     buscadorPeliculas.addEventListener('input', function (e) {
  //         const busqueda = e.target.value.toLowerCase();
  //         const filas = tablaPeliculas.getElementsByTagName('tr');

  //         Array.from(filas).forEach(fila => {
  //             const titulo = fila.cells[0].textContent.toLowerCase();
  //             const director = fila.cells[1].textContent.toLowerCase();
  //             fila.style.display =
  //                 titulo.includes(busqueda) || director.includes(busqueda)
  //                     ? ''
  //                     : 'none';
  //         });
  //     });

  //     // Buscador de Funciones
  //     buscadorFunciones.addEventListener('input', function (e) {
  //         const busqueda = e.target.value.toLowerCase();
  //         const filas = tablaFunciones.getElementsByTagName('tr');

  //         Array.from(filas).forEach(fila => {
  //             const fecha = fila.cells[0].textContent.toLowerCase();
  //             const pelicula = fila.cells[2].textContent.toLowerCase();
  //             fila.style.display =
  //                 fecha.includes(busqueda) || pelicula.includes(busqueda)
  //                     ? ''
  //                     : 'none';
  //         });
  //     });

  //     // Buscador de Empleados
  //     buscadorEmpleados.addEventListener('input', function (e) {
  //         const busqueda = e.target.value.toLowerCase();
  //         const filas = tablaEmpleados.getElementsByTagName('tr');

  //         Array.from(filas).forEach(fila => {
  //             const nombre = fila.cells[0].textContent.toLowerCase();
  //             const documento = fila.cells[1].textContent.toLowerCase();
  //             fila.style.display =
  //                 nombre.includes(busqueda) || documento.includes(busqueda)
  //                     ? ''
  //                     : 'none';
  //         });
  //     });
  // }

  // // Inicialización
  //   setupBuscadores();

  //   // Event listeners para los botones de agregar
  //   document
  //     .getElementById("btn-agregar-funcion")
  //     .addEventListener("click", function () {
  //       document.getElementById("modal-funcion").style.display = "flex";
  //     });

  //   document
  //     .getElementById("btn-agregar-empleado")
  //     .addEventListener("click", function () {
  //       document.getElementById("modal-empleado").style.display = "flex";
  //     });
});
