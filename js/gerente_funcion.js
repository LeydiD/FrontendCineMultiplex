document.addEventListener("DOMContentLoaded", function () {
    const menuFunciones = document.getElementById("menu-funciones");
    const vistaFunciones = document.getElementById("vista-funciones");
    const buscadorFunciones = document.getElementById("buscador-funciones");
    const tablaFunciones = document.getElementById("tabla-funciones");
    const vistaEmpleados = document.getElementById("vista-empleados");
    const vistaPeliculas = document.getElementById("vista-peliculas");
    const formFuncion = document.getElementById("form-funcion");
    // const formEditarFuncion = document.getElementById("form-funcion-editar");
    const addFuncion = document.getElementById("modal-funcion");
    // const editarFuncion = document.getElementById("editar-funcion");
    const btnEditarFuncion = document.getElementById("btn-editar-funcion");

    let totalFunciones = [];

    menuFunciones.addEventListener("click", function () {
        vistaPeliculas.style.display = "none";
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
                            <button class="editar-funcion" data-id="${funcion.id}">Editar</button>
                            <button class="eliminar-funcion" data-id="${funcion.id}">Eliminar</button>
                        </td>
                    `;
                    tablaFunciones.appendChild(tr);
                });
                setupFuncionesEventListeners();
            });
    }

    function setupFuncionesEventListeners() {
        document.querySelectorAll(".eliminar-funcion").forEach((boton) => {
            boton.addEventListener("click", function () {
                const id = this.getAttribute("data-id");
                eliminarFuncion(id);
            });
        });

        document.querySelectorAll(".editar-funcion").forEach((boton) => {
            boton.addEventListener("click", function () {
                const id = this.getAttribute("data-id");
                document.getElementById("btn-guardar-funcion").hidden = true;
                document.getElementById("btn-editar-funcion").hidden = false;
                document.getElementById("titulo").textContent = `Editar Función ${id}`;
                addFuncion.style.display = "block";
                cargarDatos(id);
            });
        });
    }

    document.getElementById("btn-agregar-funcion")
        .addEventListener("click", function () {
            document.getElementById("btn-guardar-funcion").hidden = false;
            document.getElementById("btn-editar-funcion").hidden = true;
            document.getElementById("titulo").textContent = `Agregar nueva función`;
            addFuncion.style.display = "block";
            cargarPeliculas();
        });

    document
        .getElementById("cerrar-modal")
        .addEventListener("click", function () {
            addFuncion.style.display = "none";
        });

    document
        .getElementById("btn-guardar-funcion")
        .addEventListener("click", function () {
            agregarFuncion();
            addFuncion.style.display = "none";
        });

    function cargarPeliculas() {
        fetch("http://localhost:8080/peliculas")
            .then((response) => response.json())
            .then((data) => {
                const peliculaSelect = document.getElementById("funcion-pelicula");
                peliculaSelect.innerHTML = "";
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

    function cargarSalasDisponibles() {
        const fecha = fechaFuncion.value;
        const hora = horaFuncion.value;
        const pelicula = peliculaFuncion.value;
        if (!fecha || !hora || !pelicula) {
            return;
        }
        fetch(`http://localhost:8080/salas/salas_disponibles/${fecha}/${hora}/${pelicula}`, {
            method: "GET"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se encontraron salas disponibles en ese horario.");
                }
                return response.json();
            })
            .then(salas => {
                salasSelect.innerHTML = "";
                if (salas.length === 0) {
                    const option = document.createElement("option");
                    option.textContent = "No hay salas disponibles en ese horario";
                    salasSelect.appendChild(option);
                } else {
                    salas.forEach(sala => {
                        const option = document.createElement("option");
                        option.value = sala.id;
                        option.textContent = `Sala ${sala.id} - ${sala.tipoProyeccion.descripcion}`;
                        salasSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error(error);
                alert("Hubo un error al obtener las salas disponibles.");
            });
    }
    peliculaFuncion.addEventListener('change', cargarSalasDisponibles);
    fechaFuncion.addEventListener('change', cargarSalasDisponibles);
    horaFuncion.addEventListener('change', cargarSalasDisponibles);

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
            alert("Por favor, selecciona una sala.");
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
                    cargarFunciones();
                } else {
                    console.error("Error al guardar la función:", response.statusText);
                }
            })
            .catch((error) =>
                console.error("Error al conectar con el servidor:", error)
            );
    }

    // formFuncion.addEventListener("submit", function (event) {
    //     event.preventDefault();
    //     const funcion = {
    //         horario: horaFuncion.value,
    //         fecha: fechaFuncion.value,
    //         pelicula: {
    //             id: peliculaFuncion.value,
    //         },
    //         sala: {
    //             id: salasSelect.value,
    //         },
    //     };
    //     if (!salasSelect.value) {
    //         alert("Por favor, selecciona una sala.");
    //         return;
    //     }

    //     fetch("http://localhost:8080/funciones", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(funcion),
    //     })
    //         .then((response) => {
    //             if (response.ok) {
    //                 alert("Función agregada exitosamente.");
    //                 formFuncion.reset();
    //                 cargarFunciones();
    //             } else {
    //                 console.error("Error al guardar la función:", response.statusText);
    //             }
    //         })
    //         .catch((error) =>
    //             console.error("Error al conectar con el servidor:", error)
    //         );
    // });


    function cargarDatos(funcionId) {
        fetch(`http://localhost:8080/funciones/${funcionId}`)
            .then(response => response.json())
            .then(funcion => {
                fechaFuncion.value = funcion.fecha;
                horaFuncion.value = funcion.horario;
                peliculaFuncion.value = funcion.pelicula.id;
                salasSelect.value = funcion.sala.id;
                cargarPeliculas();
                cargarSalasDisponibles();
                btnEditarFuncion.setAttribute("data-id", funcionId);
            })
            .catch(error => console.error("Error al obtener la función:", error));
    }


    btnEditarFuncion.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        addFuncion.style.display = "none";
        guardarEdicionFuncion(id);
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


    function eliminarFuncion(id) {
        if (confirm("¿Está seguro de eliminar esta función?")) {
            fetch(`/funciones/${id}`, {
                method: "DELETE",
            }).then(() => {
                cargarFunciones();
            });
        }
    }


    // setupBuscadores();




});