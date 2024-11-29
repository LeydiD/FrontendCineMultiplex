document.addEventListener("DOMContentLoaded", function () {
  const menuEmpleados = document.getElementById("menu-empleados");
  const vistaEmpleados = document.getElementById("vista-empleados");
  const tablaEmpleados = document.getElementById("tabla-empleados");
  const vistaPeliculas = document.getElementById("vista-peliculas");
  const vistaFunciones = document.getElementById("vista-funciones");
  const vistaClientes = document.getElementById("vista-clientes");

  menuEmpleados.addEventListener("click", function () {
    vistaPeliculas.style.display = "none";
    vistaFunciones.style.display = "none";
    vistaClientes.style.display = "none";
    vistaEmpleados.style.display = "block";
    cargarEmpleados();
  });

  let empleadosTotal = [];

  // ----------------------------------------------------Manejo de Modales--------------------------------------

  const modalEditRole = document.getElementById("editRoleModal");
  const closeModalEditRole = modalEditRole.querySelector(".cerrar-modal");

  function abrirModalEditRole(empleadoId) {
    cargarRoles();
    modalEditRole.style.display = "flex";
    window.empleadoId = empleadoId;
  }
  function cerrarModalEditRole() {
    modalEditRole.style.display = "none";
    cargarEmpleados();
  }

  // Cerrar el modal al hacer clic en el botón de cerrar
  closeModalEditRole.addEventListener("click", cerrarModalEditRole);

  // Cerrar el modal al hacer clic fuera del contenido del modal
  modalEditRole.addEventListener("click", (event) => {
    if (event.target === modalEditRole) {
      cerrarModalEditRole();
    }
  });

  document
    .getElementById("btn-guardar-role")
    .addEventListener("click", guardarRol);

  document
    .querySelector(".btn_asig_funcion")
    .addEventListener("click", function () {
      asignarFuncion();
    });

  document
    .querySelector(".cerrarModalAsig")
    .addEventListener("click", function () {
      const modal = document.getElementById("modalAsignarFuncion");
      modal.style.display = "none";
    });

  document
    .querySelector("#modalVerInfo")
    .addEventListener("click", function () {
      const modal = document.getElementById("modalVerInfo");
      modal.style.display = "none";
    });

  // Función para abrir el modal Ver Info
  function abrirModalVerInfo(empleadoId) {
    document.getElementById("modalVerInfo").style.display = "block";
    cargarFuncionesEmpleado(empleadoId);
    const botonesEditar = document.querySelectorAll(".asig_funcion");
    botonesEditar.forEach((boton) => {
      boton.addEventListener("click", function () {
        abrirModalAsignar(empleadoId);
      });
    });
  }

  // Función para abrir el modal Asignar Función
  function abrirModalAsignar(empleadoId) {
    document.getElementById("modalAsignarFuncion").style.display = "block";
    cargarFechasDisponibles();
    window.empleadoId = empleadoId;
  }

  function cargarEmpleados() {
    fetch("http://localhost:8080/empleados")
      .then((response) => response.json())
      .then((data) => {
        tablaEmpleados.innerHTML = "";
        empleadosTotal = data;
        data.forEach((empleado) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                        <td>${empleado.nombre}</td>
                        <td>${empleado.documento}</td>
                        <td>${empleado.email}</td>
                        <td>
                        ${empleado.rol.descripcion}
                        </td>
                        <td>
                         <div class="accion-contenedor">
                           <img src="../img/info.png" class="ver-info" data-id="${empleado.id}" />
                           <span class="tooltip-text">Ver Info</span>
                         </div>
                         <div class="accion-contenedor">
                           <img src="../img/edit2.png" class="editar-empleado" data-id="${empleado.id}" />
                           <span class="tooltip-text">Editar</span>
                         </div>
                         <div class="accion-contenedor">
                           <img src="../img/delete.png" class="eliminar-empleado" data-id="${empleado.id}" />
                           <span class="tooltip-text">Eliminar</span>
                         </div>
                        </td>
                    `;
          tablaEmpleados.appendChild(tr);
        });
        setupEmpleadosEventListeners();
      });
  }

  function setupEmpleadosEventListeners() {
    const botonesEditar = document.querySelectorAll(".editar-empleado");
    botonesEditar.forEach((boton) => {
      boton.addEventListener("click", function () {
        const empleadoId = this.getAttribute("data-id");
        abrirModalEditRole(empleadoId);
      });
    });
    const botonesVerInfo = document.querySelectorAll(".ver-info");
    botonesVerInfo.forEach((boton) => {
      boton.addEventListener("click", function () {
        const empleadoId = this.getAttribute("data-id");
        abrirModalVerInfo(empleadoId);
      });
    });
    const botonesEliminar = document.querySelectorAll(".eliminar-empleado");
    botonesEliminar.forEach((boton) => {
      boton.addEventListener("click", function () {
        const empleadoId = this.getAttribute("data-id");
        eliminarEmpleado(empleadoId);
      });
    });
  }

  // Carga los roles en el editar rol empleado
  function cargarRoles() {
    fetch("http://localhost:8080/rols")
      .then((response) => response.json())
      .then((data) => {
        const rolSelect = document.getElementById("rolSelect");
        rolSelect.innerHTML = "";

        data.forEach((rol) => {
          const option = document.createElement("option");
          option.value = rol.id;

          option.textContent = rol.descripcion;
          rolSelect.appendChild(option);
        });
      })
      .catch((error) => console.error("Error al cargar los roles:", error));
  }

  function guardarRol() {
    const rolId = document.getElementById("rolSelect").value;
    fetch(
      `http://localhost:8080/empleados/actualizarRol/${window.empleadoId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rolId),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        alert("Rol actualizado con éxito");
        cerrarModalEditRole();
      })
      .catch((error) => console.error("Error al actualizar el rol:", error));
  }

  function cargarFuncionesEmpleado(empleadoId) {
    fetch(`http://localhost:8080/empleados/${empleadoId}/funciones`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al cargar funciones: ${response.statusText}`);
        }
        if (response.status === 204) {
          return [];
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("La respuesta no es un array de funciones.");
        }

        const tabla = document
          .getElementById("tablaFuncionesEmpleado")
          .getElementsByTagName("tbody")[0];
        tabla.innerHTML = "";

        data.forEach((funcion) => {
          const fila = tabla.insertRow();
          fila.insertCell(0).textContent = funcion.id;
          fila.insertCell(1).textContent = funcion.fecha;
          fila.insertCell(2).textContent = funcion.horario;
          fila.insertCell(3).textContent = funcion.sala.id;
          fila.insertCell(4).textContent = funcion.pelicula.titulo;

          const btnEliminar = document.createElement("button");
          btnEliminar.textContent = "Eliminar";
          btnEliminar.classList.add("delete-funcion");
          btnEliminar.onclick = function () {
            eliminarFuncionDeEmpleado(empleadoId, funcion.id);
          };
          fila.insertCell(5).appendChild(btnEliminar);
        });
      })
      .catch((error) => {
        console.error("Error al cargar funciones del empleado:", error);
        alert("Hubo un error al cargar las funciones del empleado");
      });
  }

  function cargarFechasDisponibles() {
    fetch("http://localhost:8080/funciones/fechas_disponibles")
      .then((response) => response.json())
      .then((data) => {
        const selectFecha = document.getElementById("fechaSeleccionada");
        selectFecha.innerHTML = "";
        data.forEach((fecha) => {
          const option = document.createElement("option");
          option.value = fecha;
          option.textContent = fecha;
          selectFecha.appendChild(option);
        });
        document.getElementById("funcionSeleccionada").disabled = false;
        cargarFuncionesPorFecha();
      })
      .catch((error) => console.error("Error al cargar fechas:", error));
  }

  // Cargar funciones disponibles para la fecha seleccionada
  function cargarFuncionesPorFecha() {
    const fechaSeleccionada =
      document.getElementById("fechaSeleccionada").value;
    if (fechaSeleccionada) {
      fetch(`http://localhost:8080/funciones/fecha/${fechaSeleccionada}`)
        .then((response) => response.json())
        .then((data) => {
          const selectFuncion = document.getElementById("funcionSeleccionada");
          selectFuncion.innerHTML = "";
          const optionDefault = document.createElement("option");
          optionDefault.value = "";
          optionDefault.textContent = "Seleccione una función";
          selectFuncion.appendChild(optionDefault);
          data.forEach((funcion) => {
            const option = document.createElement("option");
            option.value = funcion.id;
            option.textContent = `Sala: ${funcion.sala.id} - Hora:${funcion.horario} - Peli: ${funcion.pelicula.titulo}`;
            selectFuncion.appendChild(option);
          });
        })
        .catch((error) => console.error("Error al cargar funciones:", error));
    }
  }
  document
    .getElementById("fechaSeleccionada")
    .addEventListener("change", cargarFuncionesPorFecha);

  // Función para asignar una función al empleado
  function asignarFuncion() {
    const fecha = document.getElementById("fechaSeleccionada").value;
    const funcionId = document.getElementById("funcionSeleccionada").value;

    if (fecha && funcionId) {
      fetch(
        `http://localhost:8080/empleados/${window.empleadoId}/add_funcions/${funcionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          cargarFuncionesEmpleado(window.empleadoId);
          alert("Función asignada correctamente");
          document.getElementById("modalAsignarFuncion").style.display = "none";
        })
        .catch((error) => console.error("Error al asignar función:", error));
    } else {
      alert("Debe seleccionar una fecha y una función");
    }
  }

  function eliminarFuncionDeEmpleado(empleadoId, funcionId) {
    fetch(
      `http://localhost:8080/empleados/${empleadoId}/funciones/${funcionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al eliminar la relación");
        }
        alert("Relación eliminada correctamente");
        cargarFuncionesEmpleado(empleadoId);
      })
      .catch((error) => {
        console.error("Error al eliminar relación:", error);
        alert("Hubo un error al eliminar la relación");
      });
  }

  document
    .getElementById("btn-agregar-empleado")
    .addEventListener("click", function () {
      document.getElementById("modalAgregarEmpleado").style.display = "block";
      cargarRolesEmpleado();
    });

  document.querySelectorAll(".cerrar-modal").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.getElementById("modalAgregarEmpleado").style.display = "none";
    });
  });

  function cargarRolesEmpleado() {
    fetch("http://localhost:8080/rols")
      .then((response) => response.json())
      .then((data) => {
        const rolSelect = document.getElementById("empleado-rol");
        rolSelect.innerHTML = "";
        const optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.textContent = "Seleccione un rol";
        rolSelect.appendChild(optionDefault);
        data.forEach((rol) => {
          const option = document.createElement("option");
          option.value = rol.id;
          option.textContent = rol.descripcion;
          rolSelect.appendChild(option);
        });
      })
      .catch((error) => console.error("Error al cargar los roles:", error));
  }

  document
    .getElementById("btn-guardar-empleado")
    .addEventListener("click", function () {
      const form = document.getElementById("form-agregar-empleado");
      if (!form.checkValidity()) {
        alert("Por favor completa todos los campos requeridos.");
        form.reportValidity();
        return;
      }
      agregarEmpleado();
      document.getElementById("modalAgregarEmpleado").style.display = "none";
      document.getElementById("form-agregar-empleado").reset();
    });

  function agregarEmpleado() {
    const nombre = document.getElementById("empleado-nombre").value;
    const documento = document.getElementById("empleado-documento").value;
    const email = document.getElementById("empleado-email").value;
    const rol = document.getElementById("empleado-rol").value;
    const contrasena = document.getElementById("empleado-contrasena").value;
    const empleadoData = {
      nombre: nombre,
      documento: documento,
      email: email,
      contrasena: contrasena,
      rol: {
        id: rol,
      },
    };

    fetch("http://localhost:8080/empleados", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(empleadoData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al guardar el empleado");
        }
        return response.json();
      })
      .then((data) => {
        alert("Empleado guardado exitosamente");
        document.getElementById("modalAgregarEmpleado").style.display = "none";
        document.getElementById("form-agregar-empleado").reset();
        if (typeof cargarEmpleados === "function") {
          cargarEmpleados();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Completa todos los campos del formulario");
      });
  }

  function mostrarEmpleados(empleadosFiltrados) {
    tablaEmpleados.innerHTML = "";
    empleadosFiltrados.forEach((empleado) => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
                <td>${empleado.nombre}</td>
                <td>${empleado.documento}</td>
                <td>${empleado.email}</td>
                <td>
                    ${empleado.rol.descripcion}
                    </td>
                    <td>
                      <div class="accion-contenedor">
                        <img src="../img/info.png" class="ver-info" data-id="${empleado.id}" />
                        <span class="tooltip-text">Ver Info</span>
                      </div>
                      <div class="accion-contenedor">
                        <img src="../img/edit2.png" class="editar-empleado" data-id="${empleado.id}" />
                        <span class="tooltip-text">Editar</span>
                      </div>
                      <div class="accion-contenedor">
                        <img src="../img/delete.png" class="eliminar-empleado" data-id="${empleado.id}" />
                        <span class="tooltip-text">Eliminar</span>
                      </div>
                    </td>
            `;
      tablaEmpleados.appendChild(fila);
      setupEmpleadosEventListeners();
    });
  }

  function filtrarEmpleados() {
    const termino = document
      .querySelector("#buscadorEmpleados")
      .value.toLowerCase();
    const empleadosFiltrados = empleadosTotal.filter(
      (empleado) =>
        empleado.nombre.toLowerCase().includes(termino) ||
        empleado.documento.includes(termino) ||
        empleado.rol.descripcion.toLowerCase().includes(termino)
    );
    mostrarEmpleados(empleadosFiltrados);
  }

  function eliminarEmpleado(id) {
    const confirmar = confirm(
      "¿Estás seguro de que deseas eliminar este empleado?"
    );
    if (!confirmar) {
      return;
    }
    fetch(`http://localhost:8080/empleados/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Empleado eliminado exitosamente.");
          cargarEmpleados();
        } else {
          return response.text().then((message) => {
            alert(message);
          });
        }
      })
      .catch((error) => {
        console.error("Error al conectar con el servidor:", error);
      });
  }

  document
    .querySelector("#buscadorEmpleados")
    .addEventListener("input", filtrarEmpleados);

  cargarEmpleados();
});
