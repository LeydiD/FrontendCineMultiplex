document.addEventListener("DOMContentLoaded", function () {
  const nombre = localStorage.getItem("nombre");

  if (nombre) {
    document.getElementById(
      "usuarioNombre"
    ).textContent = `Bienvenida, ${nombre}`;
  } else {
    alert("No has iniciado sesión");
    window.location.href = "../index.html";
  }

  document
    .getElementById("logoutButton")
    .addEventListener("click", function () {
      if (confirm("¿Seguro que deseas cerrar sesión?")) {
        localStorage.removeItem("nombre");
        window.location.href = "../index.html";
      }
    });
});
