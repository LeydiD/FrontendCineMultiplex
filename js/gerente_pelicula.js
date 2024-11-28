document.addEventListener("DOMContentLoaded", function () {
  const menuPeliculas = document.getElementById("menu-peliculas");
  const vistaPeliculas = document.getElementById("vista-peliculas");
  const buscadorPeliculas = document.getElementById("buscador-peliculas");
  const tablaPeliculas = document.getElementById("tabla-peliculas");
  const modalPelicula = document.getElementById("modal-pelicula");
  const formPelicula = document.getElementById("form-pelicula");
  const vistaEmpleados = document.getElementById("vista-empleados");
  const vistaFunciones = document.getElementById("vista-funciones");

  menuPeliculas.addEventListener("click", function () {
    vistaPeliculas.style.display = "block";
    vistaFunciones.style.display = "none";
    vistaEmpleados.style.display = "none";
    cargarPeliculas();
  });

  let peliculasTotales = [];
  function cargarPeliculas() {
    fetch("http://localhost:8080/peliculas")
      .then((response) => response.json())
      .then((data) => {
        tablaPeliculas.innerHTML = "";
        peliculasTotales = data;
        data.forEach((pelicula) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                            <td>${pelicula.titulo}</td>
                            <td>${pelicula.duracion}</td>
                            <td>${pelicula.sinopsis}</td>
                            <td>${pelicula.genero.descripcion}</td>
                            <td>
                                <img src="../img/delete.png" class="eliminar-pelicula" data-id="${pelicula.id}" />
                            </td>
                        `;
          tablaPeliculas.appendChild(tr);
        });
        setupPeliculaEventListeners();
      });
  }

  function setupPeliculaEventListeners() {
    const botonesEliminar = document.querySelectorAll(".eliminar-pelicula");
    botonesEliminar.forEach((boton) => {
      boton.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        eliminarPelicula(id);
      });
    });
  }

  // Me permite eliminar la película

  function eliminarPelicula(id) {
    fetch(`http://localhost:8080/peliculas/${id}/tiene-funciones`)
      .then((response) => response.json())
      .then((tieneFunciones) => {
        if (tieneFunciones) {
          alert(
            "No se puede eliminar la película porque tiene funciones asociadas."
          );
          return;
        }
        fetch(`http://localhost:8080/peliculas/${id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              alert("Película eliminada exitosamente.");
              cargarPeliculas();
            } else {
              alert("Error al eliminar la película.");
              console.error(
                "Error al eliminar la película:",
                response.statusText
              );
            }
          })
          .catch((error) => {
            console.error("Error al conectar con el servidor:", error);
            alert("Error al conectar con el servidor.");
          });
      })
      .catch((error) => {
        console.error("Error al verificar las funciones asociadas:", error);
        alert("Error al verificar las funciones asociadas.");
      });
  }

  // Cargar géneros desde el backend
  function cargarGeneros() {
    fetch("http://localhost:8080/generos")
      .then((response) => response.json())
      .then((data) => {
        const generoSelect = document.getElementById("genero-pelicula_agregar");
        generoSelect.innerHTML = " "; // Agregar opción predeterminada
        data.forEach((genero) => {
          const option = document.createElement("option");
          option.value = genero.id;
          option.textContent = genero.descripcion;
          generoSelect.appendChild(option);
        });
      })
      .catch((error) => console.error("Error al cargar los géneros:", error));
  }

  //Agregar Película
  formPelicula.addEventListener("submit", function (event) {
    event.preventDefault();
    const generoId = document.getElementById("genero-pelicula_agregar").value;
    const pelicula = {
      titulo: document.querySelector("#titulo_agregar").value,
      duracion: document.querySelector("#duracion_agregar").value,
      sinopsis: document.querySelector("#sinopsis_agregar").value,
      genero: {
        id: generoId,
      },
    };
    if (!generoId) {
      alert("Por favor, selecciona un género.");
      return;
    }

    fetch("http://localhost:8080/peliculas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pelicula),
    })
      .then((response) => {
        if (response.ok) {
          alert("Película agregada exitosamente.");
          formPelicula.reset();
          cargarPeliculas();
          document.getElementById("modal-pelicula").style.display = "none";
        } else {
          console.error("Error al guardar la película:", response.statusText);
        }
      })
      .catch((error) =>
        console.error("Error al conectar con el servidor:", error)
      );
  });

  //BUSCADOR DE PELICULAS
  function mostrarPeliculas(peliculasFiltradas) {
    tablaPeliculas.innerHTML = "";
    peliculasFiltradas.forEach((pelicula) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
                        <td>${pelicula.titulo}</td>
                        <td>${pelicula.duracion}</td>
                        <td>${pelicula.sinopsis}</td>
                        <td>${pelicula.genero.descripcion}</td>
                        <td>
                            <button class="eliminar" data-id="${pelicula.id}">Eliminar</button>
                        </td>
                            `;
      tablaPeliculas.appendChild(fila);
    });
    setupPeliculaEventListeners();
  }

  function filtrarPeliculas() {
    const termino = buscadorPeliculas.value.toLowerCase();
    const peliculasFiltradas = peliculasTotales.filter(
      (pelicula) =>
        pelicula.titulo.toLowerCase().includes(termino) ||
        pelicula.genero.descripcion.toLowerCase().includes(termino)
    );
    mostrarPeliculas(peliculasFiltradas);
  }

  buscadorPeliculas.addEventListener("input", filtrarPeliculas);

  document
    .getElementById("btn-agregar-pelicula")
    .addEventListener("click", function () {
      modalPelicula.style.display = "flex";
      cargarGeneros();
    });

  document.querySelectorAll(".cerrar-modal").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.getElementById("modal-pelicula").style.display = "none";
    });
  });

  cargarPeliculas();
});
