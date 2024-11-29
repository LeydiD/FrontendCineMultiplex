document.addEventListener("DOMContentLoaded", function () {
  const menuFunciones = document.getElementById("menu-funciones");
  const vistaFunciones = document.getElementById("vista-funciones");
  const buscadorFunciones = document.getElementById("buscador-funciones");
  const tablaFunciones = document.getElementById("tabla-funciones");
  const vistaEmpleados = document.getElementById("vista-empleados");
  const vistaPeliculas = document.getElementById("vista-peliculas");
  const formFuncion = document.getElementById("form-funcion");
  const addFuncion = document.getElementById("modal-funcion");
  const btnEditarFuncion = document.getElementById("btn-editar-funcion");
  const vistaClientes = document.getElementById("vista-clientes");

  let totalFunciones = [];
  let funcionId1 = null;

  menuFunciones.addEventListener("click", function (event) {
    event.preventDefault();
    vistaPeliculas.style.display = "none";
    vistaClientes.style.display = "none";
    vistaFunciones.style.display = "block";
    vistaEmpleados.style.display = "none";
    cargarFunciones();
  });

  function cargarFunciones() {
    fetch("http://localhost:8080/funciones")
      .then((response) => response.json())
      .then((data) => {
        totalFunciones = data;
        tablaFunciones.innerHTML = "";
        data.forEach((funcion) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                      <td>${funcion.id}</td>
                      <td>${funcion.horario}</td>
                      <td>${funcion.fecha}</td>
                      <td>${funcion.pelicula.titulo}</td>
                      <td>${funcion.sala.id}</td>
                      <td>${funcion.sala.tipoProyeccion.descripcion}</td>
  
                      <td>
                       <div class="accion-contenedor">
                            <img src="../img/edit2.png" class="editar-funcion" data-id="${funcion.id}" />
                            <span class="tooltip-text">Editar</span>
                        </div>

                        <div class="accion-contenedor">
                            <img src="../img/delete.png" class="eliminar-funcion" data-id="${funcion.id}" />
                            <span class="tooltip-text">Eliminar</span>
                        </div>
                      </td>
                  `;
          tablaFunciones.appendChild(tr);
        });
        setupFuncionesEventListeners();
      });
  }

  function setupFuncionesEventListeners() {
    document.querySelectorAll(".eliminar-funcion").forEach((boton) => {
      boton.addEventListener("click", function (event) {
        event.preventDefault();
        const id = this.getAttribute("data-id");
        eliminarFuncion(id);
      });
    });

    document.querySelectorAll(".editar-funcion").forEach((boton) => {
      boton.addEventListener("click", function (event1) {
        event1.preventDefault();
        const id = this.getAttribute("data-id");
        document.getElementById("btn-guardar-funcion").hidden = true;
        document.getElementById("btn-editar-funcion").hidden = false;
        document.getElementById("titulo").textContent = `Editar Función ${id}`;
        addFuncion.style.display = "block";
        cargarDatosEnEditar(id);
      });
    });
  }

  document
    .getElementById("btn-agregar-funcion")
    .addEventListener("click", function (event) {
      event.preventDefault();
      document.getElementById("btn-guardar-funcion").hidden = false;
      document.getElementById("btn-editar-funcion").hidden = true;
      document.getElementById("titulo").textContent = `Agregar nueva función`;
      addFuncion.style.display = "block";
      cargarPeliculas();
      funcionId1 = null;
    });

  document
    .getElementById("cerrar-modal")
    .addEventListener("click", function (event) {
      event.preventDefault();
      addFuncion.style.display = "none";
      document.getElementById("form-funcion").reset();
      fechaFuncion.value = "";
      horaFuncion.value = "";
      peliculaFuncion.value = "";
      salasSelect.innerHTML = "";
    });

  document
    .getElementById("btn-guardar-funcion")
    .addEventListener("click", function (event) {
      event.preventDefault();
      agregarFuncion();
      addFuncion.style.display = "none";
      document.getElementById("form-funcion").reset();
    });

  function cargarPeliculas() {
    fetch("http://localhost:8080/peliculas")
      .then((response) => response.json())
      .then((data) => {
        const peliculaSelect = document.getElementById("funcion-pelicula");
        peliculaSelect.innerHTML = "";
        const optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.textContent = "Seleccione una pelicula";
        peliculaSelect.appendChild(optionDefault);

        data.forEach((pelicula) => {
          const option = document.createElement("option");
          option.value = pelicula.id;
          option.textContent = pelicula.titulo;
          peliculaSelect.appendChild(option);
        });
      })
      .catch((error) => console.error("Error al cargar las películas:", error));
  }

  const salasSelect = document.getElementById("funcion-sala");
  const fechaFuncion = document.getElementById("funcion-fecha");
  const horaFuncion = document.getElementById("funcion-hora");
  const peliculaFuncion = document.getElementById("funcion-pelicula");

  function cargarDatosEnEditar(funcionId) {
    fetch(`http://localhost:8080/funciones/${funcionId}`)
      .then((response) => response.json())
      .then((funcion) => {
        funcionId1 = funcionId;
        fechaFuncion.value = funcion.fecha;
        horaFuncion.value = funcion.horario;
        peliculaSeleccionadaId = funcion.pelicula.id;

        fetch("http://localhost:8080/peliculas")
          .then((response) => response.json())
          .then((data) => {
            const peliculaSelect = document.getElementById("funcion-pelicula");
            peliculaSelect.innerHTML = "";
            data.forEach((pelicula) => {
              const option = document.createElement("option");
              option.value = pelicula.id;
              option.textContent = pelicula.titulo;
              if (pelicula.id === peliculaSeleccionadaId) {
                option.selected = true;
              }
              peliculaSelect.appendChild(option);
            });
            peliculaSelect.value = peliculaSeleccionadaId;
            cargarSalasDisponibles(funcionId);
          })
          .catch((error) =>
            console.error("Error al cargar las películas:", error)
          );
        btnEditarFuncion.setAttribute("data-id", funcionId);
      })
      .catch((error) => console.error("Error al obtener la función:", error));
  }

  function cargarSalasDisponibles(funcionId) {
    const fecha = fechaFuncion.value;
    const hora = horaFuncion.value;
    const pelicula = document.getElementById("funcion-pelicula").value;
    if (!fecha || !hora || !pelicula) {
      return;
    }
    fetch(
      `http://localhost:8080/salas/salas_disponibles/${fecha}/${hora}/${pelicula}`,
      {
        method: "GET",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "No se encontraron salas disponibles en ese horario."
          );
        }
        return response.json();
      })
      .then((salas) => {
        salasSelect.innerHTML = "";
        const optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.textContent = "Seleccione una sala";
        salasSelect.appendChild(optionDefault);
        if (funcionId && funcionId != null) {
          fetch(`http://localhost:8080/funciones/${funcionId}`)
            .then((response) => response.json())
            .then((funcion) => {
              const salaActual = funcion.sala;
              const salaYaIncluida = salas.some(
                (sala) => sala.id === salaActual.id
              );
              if (!salaYaIncluida) {
                salas.unshift(salaActual);
              }

              agregarSalasAlSelect(salas);
            })
            .catch((error) =>
              console.error("Error al cargar la función:", error)
            );
        } else {
          agregarSalasAlSelect(salas);
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Hubo un error al obtener las salas disponibles.");
      });
  }

  function agregarSalasAlSelect(salas) {
    if (salas.length === 0) {
      const option = document.createElement("option");
      option.textContent = "No hay salas disponibles en ese horario";
      salasSelect.appendChild(option);
    } else {
      salas.forEach((sala) => {
        const option = document.createElement("option");
        option.value = sala.id;
        option.textContent = `Sala ${sala.id} - ${sala.tipoProyeccion.descripcion}`;
        salasSelect.appendChild(option);
      });
    }
  }

  peliculaFuncion.addEventListener("change", () =>
    cargarSalasDisponibles(funcionId1)
  );
  fechaFuncion.addEventListener("change", () =>
    cargarSalasDisponibles(funcionId1)
  );
  horaFuncion.addEventListener("change", () =>
    cargarSalasDisponibles(funcionId1)
  );

  function agregarFuncion() {
    const funcion = {
      horario: horaFuncion.value,
      fecha: fechaFuncion.value,
      pelicula: {
        id: peliculaFuncion.value,
      },
      sala: {
        id: salasSelect.value,
      },
    };
    if (!salasSelect.value) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    fetch("http://localhost:8080/funciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(funcion),
    })
      .then((response) => {
        if (response.ok) {
          alert("Función agregada exitosamente.");
          formFuncion.reset();
          fechaFuncion.value = "";
          horaFuncion.value = "";
          peliculaFuncion.value = "";
          salasSelect.innerHTML = "";
          cargarFunciones();
        } else {
          console.error("Error al guardar la función:", response.statusText);
        }
      })
      .catch((error) =>
        console.error("Error al conectar con el servidor:", error)
      );
  }

  btnEditarFuncion.addEventListener("click", function (event) {
    event.preventDefault();
    const id = this.getAttribute("data-id");
    addFuncion.style.display = "none";
    guardarEdicionFuncion(id);
    document.getElementById("form-funcion").reset();
  });

  function guardarEdicionFuncion(funcionId) {
    const funcion = {
      horario: horaFuncion.value,
      fecha: fechaFuncion.value,
      pelicula: {
        id: peliculaFuncion.value,
      },
      sala: {
        id: salasSelect.value,
      },
    };
    if (!salasSelect.value) {
      alert("Por favor, selecciona una sala.");
      return;
    }

    fetch(`http://localhost:8080/funciones/${funcionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(funcion),
    })
      .then((response) => {
        if (response.ok) {
          alert("Función editada exitosamente.");
          formFuncion.reset();
          cargarFunciones();
        } else {
          console.error("Error al editar la función:", response.statusText);
        }
      })
      .catch((error) =>
        console.error("Error al conectar con el servidor:", error)
      );
  }

  function eliminarFuncion(funcionId) {
    if (confirm("¿Estás seguro de que deseas eliminar esta función?")) {
      fetch(`http://localhost:8080/funciones/${funcionId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            alert("Función eliminada exitosamente.");
            cargarFunciones();
          } else {
            console.error("Error al eliminar la función:", response.statusText);
          }
        })
        .catch((error) =>
          console.error("Error al conectar con el servidor:", error)
        );
    }
  }

  //BUSCADOR DE PELICULAS
  function mostrarFunciones(funcionesFiltradas) {
    tablaFunciones.innerHTML = "";
    funcionesFiltradas.forEach((funcion) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
              <td>${funcion.id}</td>
              <td>${funcion.horario}</td>
              <td>${funcion.fecha}</td>
              <td>${funcion.pelicula.titulo}</td>
              <td>${funcion.sala.id}</td>
              <td>${funcion.sala.tipoProyeccion.descripcion}</td>
  
              <td>
                <div class="accion-contenedor">
                    <img src="../img/edit2.png" class="editar-funcion" data-id="${funcion.id}" />
                    <span class="tooltip-text">Editar</span>
                </div>
                <div class="accion-contenedor">
                    <img src="../img/delete.png" class="eliminar-funcion" data-id="${funcion.id}" />
                    <span class="tooltip-text">Eliminar</span>
                </div>
              </td>
          `;
      tablaFunciones.appendChild(tr);
    });
    setupFuncionesEventListeners();
  }

  function filtrarFunciones() {
    const termino = buscadorFunciones.value.toLowerCase();
    const funcionesFiltradas = totalFunciones.filter(
      (funcion) =>
        String(funcion.id).includes(termino) ||
        String(funcion.fecha).includes(termino) ||
        String(funcion.horario).includes(termino) ||
        funcion.pelicula.titulo.toLowerCase().includes(termino) ||
        String(funcion.sala.id).includes(termino) ||
        funcion.sala.tipoProyeccion.descripcion.toLowerCase().includes(termino)
    );
    mostrarFunciones(funcionesFiltradas);
  }

  buscadorFunciones.addEventListener("input", filtrarFunciones);

  cargarFunciones();
});
