document.addEventListener("DOMContentLoaded", function () {
    const menuEmpleados = document.getElementById("menu-empleados");
    const vistaEmpleados = document.getElementById("vista-empleados");
    const tablaEmpleados = document.getElementById("tabla-empleados");
    const vistaPeliculas = document.getElementById("vista-peliculas");
    const vistaFunciones = document.getElementById("vista-funciones");

    menuEmpleados.addEventListener("click", function () {
        vistaPeliculas.style.display = "none";
        vistaFunciones.style.display = "none";
        vistaEmpleados.style.display = "block";
        cargarEmpleados();
    });

    let empleadosTotal = [];


    // ----------------------------------------------------Manejo de Modales--------------------------------------

    // Modal para editar el rol
    function abrirModal(empleadoId) {
        cargarRoles();
        const modal = new bootstrap.Modal(document.getElementById("editRoleModal"));
        modal.show();
        window.empleadoId = empleadoId;
    }

    //Al dar click en guardar guarda el rol
    document.querySelector(".btn-primary").addEventListener("click", function () {
        guardarRol();
    });

    document
        .querySelector(".btn-secondary")
        .addEventListener("click", function () {
            const modal = bootstrap.Modal.getInstance(
                document.getElementById("editRoleModal")
            );
            modal.hide();
        });

    // Detectar cuando el modal se cierra y recargar la tabla
    const modalElement = document.getElementById("editRoleModal");
    modalElement.addEventListener("hidden.bs.modal", function () {
        cargarEmpleados();
    });

    document.querySelector(".btn_asig_funcion")
        .addEventListener("click", function () {
            asignarFuncion();
        });

    document.querySelector(".cerrarModalAsig")
        .addEventListener("click", function () {
            const modal = document.getElementById("modalAsignarFuncion");
            modal.style.display = "none";
        });

    document.querySelector("#modalVerInfo")
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



    // -----------------------------------------------------Funciones-----------------------------------------------------
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
                            <button class="ver-info" data-id="${empleado.id}">Ver funciones</button>
                            <button class="editar-empleado" data-id="${empleado.id}">Editar Rol</button>
                            <button class="eliminar-empleado" data-id="${empleado.id}">Eliminar empleado</button>
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
                abrirModal(empleadoId);
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
                const modal = bootstrap.Modal.getInstance(
                    document.getElementById("editRoleModal")
                );
                modal.hide();
            })
            .catch((error) => console.error("Error al actualizar el rol:", error));
    }

    // Cargar las funciones de un empleado en el modal Ver Info
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



    // Cargar fechas disponibles para asignar una nueva función
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
    document.getElementById("fechaSeleccionada").addEventListener('change', cargarFuncionesPorFecha);


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
                // Si la respuesta es 204 (No Content), no hace falta hacer .json()
                alert("Relación eliminada correctamente");
                cargarFuncionesEmpleado(empleadoId);
            })
            .catch((error) => {
                console.error("Error al eliminar relación:", error);
                alert("Hubo un error al eliminar la relación");
            });
    }

    //Modal para agregar empleado

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
        .getElementById("btn btn-primary_guardar")
        .addEventListener("click", function () {
            document.getElementById("modalAgregarEmpleado").style.display = "none";
            agregarEmpleado();
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
                alert("Hubo un problema al guardar el empleado");
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
                        <button class="ver-info" data-id="${empleado.id}">Ver funciones</button>
                        <button class="editar-empleado" data-id="${empleado.id}">Editar Rol</button>
                        <button class="eliminar-empleado" data-id="${empleado.id}">Eliminar empleado</button>
                    </td>
            `;
            tablaEmpleados.appendChild(fila);
            setupEmpleadosEventListeners();
        });
    }

    // Función para filtrar empleados
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
        const confirmar = confirm("¿Estás seguro de que deseas eliminar este empleado?");
        if (!confirmar) {
            return;
        }
        fetch(`http://localhost:8080/empleados/${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    alert("Empleado eliminado exitosamente.");
                    cargarEmpleados();
                } else {
                    return response.text().then(message => {
                        alert(message);
                    });
                }
            })
            .catch(error => {
                console.error('Error al conectar con el servidor:', error);
            });
    }

    // Escuchar el evento de entrada en el buscador
    document.querySelector("#buscadorEmpleados")
        .addEventListener("input", filtrarEmpleados);

    cargarEmpleados();

});

