document.addEventListener("DOMContentLoaded", function () {
    // Selección de elementos
    const menuPeliculas = document.getElementById('menu-peliculas');
    const menuFunciones = document.getElementById('menu-funciones');
    const menuEmpleados = document.getElementById('menu-empleados');
    const vistaPeliculas = document.getElementById('vista-peliculas');
    const vistaFunciones = document.getElementById('vista-funciones');
    const vistaEmpleados = document.getElementById('vista-empleados');
    const buscadorPeliculas = document.getElementById('buscador-peliculas');
    const buscadorFunciones = document.getElementById('buscador-funciones');
    const buscadorEmpleados = document.getElementById('buscador-empleados');
    const tablaPeliculas = document.getElementById('tabla-peliculas');
    const tablaFunciones = document.getElementById('tabla-funciones');
    const tablaEmpleados = document.getElementById('tabla-empleados');
    const modalPelicula = document.getElementById('modal-pelicula');
    const cerrarModal = document.querySelector('.cerrar-modal');
    const formPelicula = document.getElementById('form-pelicula');

    /***********************************Seccion Empleados*****************************/
    let empleadosTotal = [];
    // Mostrar vista de Empleados
    menuEmpleados.addEventListener('click', function () {
        vistaPeliculas.style.display = 'none';
        vistaFunciones.style.display = 'none';
        vistaEmpleados.style.display = 'block';
        cargarEmpleados();
    });

    // Implementación para Empleados
    function cargarEmpleados() {
        fetch('http://localhost:8080/empleados')
            .then(response => response.json())
            .then(data => {
                tablaEmpleados.innerHTML = '';
                empleadosTotal = data;
                data.forEach(empleado => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                    <td>${empleado.nombre}</td>
                    <td>${empleado.documento}</td>
                    <td>${empleado.email}</td>
                    <td>
                    ${empleado.rol.descripcion}
                        <button class="editar-empleado" data-id="${empleado.id}">Editar</button>
                    </td>
                    <td>
                        <button class="ver-info" data-id="${empleado.id}">Ver info</button>
                    </td>
                `;
                    tablaEmpleados.appendChild(tr);
                });

                setupEmpleadosEventListeners();
            });
    }

    // Asocia los eventos de los botones de editar, o sea es como a cada boton decir, si da click entonces abra el modal
    function setupEmpleadosEventListeners() {
        const botonesEditar = document.querySelectorAll('.editar-empleado');
        botonesEditar.forEach(boton => {
            boton.addEventListener('click', function () {
                const empleadoId = this.getAttribute('data-id');
                abrirModal(empleadoId);
            });
        });
        const botonesVerInfo = document.querySelectorAll('.ver-info');
        botonesVerInfo.forEach(boton => {
            boton.addEventListener('click', function () {
                const empleadoId = this.getAttribute('data-id');
                abrirModalVerInfo(empleadoId);
            });
        });
    }

    // Trae los roles desde el backend
    function cargarRoles() {
        fetch('http://localhost:8080/rols')
            .then(response => response.json())
            .then(data => {
                const rolSelect = document.getElementById('rolSelect');
                rolSelect.innerHTML = '';
                // Agregar las opciones de roles al combo box
                data.forEach(rol => {
                    const option = document.createElement('option');
                    option.value = rol.id;
                    option.textContent = rol.descripcion;
                    rolSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar los roles:', error));
    }

    // Abrir el modal de edición y cargar los roles
    function abrirModal(empleadoId) {
        cargarRoles();
        const modal = new bootstrap.Modal(document.getElementById('editRoleModal'));
        modal.show();
        window.empleadoId = empleadoId; // Guardamos el ID del empleado para usarlo al guardar
    }

    function guardarRol() {
        const rolId = document.getElementById('rolSelect').value;

        // Llamar al backend para actualizar el rol del empleado
        fetch(`http://localhost:8080/empleados/actualizarRol/${window.empleadoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rolId) // Enviar el ID del rol seleccionado
        })
            .then(response => response.json())
            .then(data => {
                alert('Rol actualizado con éxito');
                const modal = bootstrap.Modal.getInstance(document.getElementById('editRoleModal'));
                modal.hide();

            })
            .catch(error => console.error('Error al actualizar el rol:', error));
    }

    //Al dar click en guardar guarda el rol
    document.querySelector('.btn-primary').addEventListener('click', function () {
        guardarRol();
    });

    document.querySelector('.btn-secondary').addEventListener('click', function () {
        const modal = bootstrap.Modal.getInstance(document.getElementById('editRoleModal'));
        modal.hide(); // Cerrar el modal al hacer clic en "Cancelar"
    });

    // Detectar cuando el modal se cierra y recargar la tabla
    const modalElement = document.getElementById('editRoleModal');
    modalElement.addEventListener('hidden.bs.modal', function () {
        cargarEmpleados(); // Recargar la tabla cuando el modal se cierra
    });

    /**Ver info de las funciones del empleado */
    // Función para abrir el modal Ver Info

    function abrirModalVerInfo(empleadoId) {
        document.getElementById("modalVerInfo").style.display = "block";
        cargarFuncionesEmpleado(empleadoId); // Cargar funciones del empleado
        const botonesEditar = document.querySelectorAll('.asig_funcion');
        botonesEditar.forEach(boton => {
            boton.addEventListener('click', function () {
                abrirModalAsignar(empleadoId);
            });
        });
    }

    // Función para abrir el modal Asignar Función
    function abrirModalAsignar(empleadoId) {
        document.getElementById("modalAsignarFuncion").style.display = "block";
        cargarFechasDisponibles(); // Cargar fechas disponibles cuando se abre el modal
        window.empleadoId = empleadoId;
    }

    // Cargar las funciones de un empleado en el modal Ver Info
    function cargarFuncionesEmpleado(empleadoId) {
        fetch(`http://localhost:8080/empleados/${empleadoId}/funciones`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar funciones: ${response.statusText}`);
                }
                if (response.status === 204) {
                    return [];
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error("La respuesta no es un array de funciones.");
                }

                const tabla = document.getElementById("tablaFuncionesEmpleado").getElementsByTagName('tbody')[0];
                tabla.innerHTML = '';

                // Recorrer los datos y agregarlos a la tabla
                data.forEach(funcion => {
                    const fila = tabla.insertRow();
                    fila.insertCell(0).textContent = funcion.id;
                    fila.insertCell(1).textContent = funcion.fecha;
                    fila.insertCell(2).textContent = funcion.horario;
                    fila.insertCell(3).textContent = funcion.sala.id;
                    fila.insertCell(4).textContent = funcion.pelicula.titulo;

                    // Crear botón de eliminar
                    const btnEliminar = document.createElement("button");
                    btnEliminar.textContent = "Eliminar";
                    btnEliminar.onclick = function () {
                        eliminarFuncionDeEmpleado(empleadoId, funcion.id);
                    };
                    fila.insertCell(5).appendChild(btnEliminar);
                });
            })
            .catch(error => {
                console.error('Error al cargar funciones del empleado:', error);
                alert('Hubo un error al cargar las funciones del empleado');
            });
    }


    // Cargar fechas disponibles para asignar una nueva función
    function cargarFechasDisponibles() {
        fetch('http://localhost:8080/funciones/fechas_disponibles')
            .then(response => response.json())
            .then(data => {
                const selectFecha = document.getElementById('fechaSeleccionada');
                selectFecha.innerHTML = ''; // Limpiar opciones anteriores
                data.forEach(fecha => {
                    const option = document.createElement("option");
                    option.value = fecha;
                    option.textContent = fecha;
                    selectFecha.appendChild(option);
                });
                document.getElementById('funcionSeleccionada').disabled = false;
                cargarFuncionesPorFecha();

            })
            .catch(error => console.error('Error al cargar fechas:', error));
    }

    // Cargar funciones disponibles para la fecha seleccionada
    function cargarFuncionesPorFecha() {
        const fechaSeleccionada = document.getElementById('fechaSeleccionada').value;
        if (fechaSeleccionada) {
            fetch(`http://localhost:8080/funciones/fecha/${fechaSeleccionada}`)
                .then(response => response.json())
                .then(data => {
                    const selectFuncion = document.getElementById('funcionSeleccionada');
                    selectFuncion.innerHTML = ''; // Limpiar opciones anteriores

                    // Crear opción por defecto
                    const optionDefault = document.createElement("option");
                    optionDefault.value = "";
                    optionDefault.textContent = "Seleccione una función";
                    selectFuncion.appendChild(optionDefault);

                    // Agregar las funciones al select
                    data.forEach(funcion => {
                        const option = document.createElement("option");
                        option.value = funcion.id; // Asumimos que la función tiene un 'id'
                        option.textContent = `Sala: ${funcion.sala.id} - Hora:${funcion.horario} - Peli: ${funcion.pelicula.titulo}`;
                        selectFuncion.appendChild(option);
                    });
                })
                .catch(error => console.error('Error al cargar funciones:', error));
        }
    }


    // Función para asignar una función al empleado
    function asignarFuncion() {
        const fecha = document.getElementById('fechaSeleccionada').value;
        const funcionId = document.getElementById('funcionSeleccionada').value;

        if (fecha && funcionId) {
            fetch(`http://localhost:8080/empleados/${window.empleadoId}/add_funcions/${funcionId}`, { // Suponiendo que 1 es el id del empleado
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(response => response.json())
                .then(data => {
                    // Recargar la tabla de funciones después de asignar
                    cargarFuncionesEmpleado(window.empleadoId);
                    alert('Función asignada correctamente');
                })
                .catch(error => console.error('Error al asignar función:', error));
        } else {
            alert('Debe seleccionar una fecha y una función');
        }
    }

    document.querySelector('.btn_asig_funcion').addEventListener('click', function () {
        asignarFuncion();
    });

    document.querySelector('.cerrarModalAsig').addEventListener('click', function () {
        const modal = document.getElementById('modalAsignarFuncion');
        modal.style.display = 'none'; // Oculta el modal
    });

    document.querySelector('#modalVerInfo').addEventListener('click', function () {
        const modal = document.getElementById('modalVerInfo');
        modal.style.display = 'none'; // Oculta el modal
    });


    function eliminarFuncionDeEmpleado(empleadoId, funcionId) {
        fetch(`http://localhost:8080/empleados/${empleadoId}/funciones/${funcionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al eliminar la relación');
                }
                // Si la respuesta es 204 (No Content), no hace falta hacer .json()
                alert('Relación eliminada correctamente');
                // Recargar la tabla de funciones para reflejar los cambios
                cargarFuncionesEmpleado(empleadoId);
            })
            .catch(error => {
                console.error('Error al eliminar relación:', error);
                alert('Hubo un error al eliminar la relación');
            });
    }

    document.getElementById('btn-agregar-empleado').addEventListener('click', function () {
        document.getElementById('modalAgregarEmpleado').style.display = 'block';
        cargarRolesEmpleado();
    });

    document.querySelectorAll('.cerrar-modal').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.getElementById('modalAgregarEmpleado').style.display = 'none';
        });
    });

    function cargarRolesEmpleado() {
        fetch('http://localhost:8080/rols')
            .then(response => response.json())
            .then(data => {
                const rolSelect = document.getElementById('empleado-rol');
                rolSelect.innerHTML = '';
                // Agregar las opciones de roles al combo box
                data.forEach(rol => {
                    const option = document.createElement('option');
                    option.value = rol.id;
                    option.textContent = rol.descripcion;
                    rolSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar los roles:', error));
    }

    document.getElementById('btn btn-primary_guardar').addEventListener('click', function () {
        document.getElementById('modalAgregarEmpleado').style.display = 'none';
        agregarEmpleado();
    });

    function agregarEmpleado() {

        // Obtener los valores del formulario
        const nombre = document.getElementById('empleado-nombre').value;
        const documento = document.getElementById('empleado-documento').value;
        const email = document.getElementById('empleado-email').value;
        const rol = document.getElementById('empleado-rol').value;
        const contrasena = document.getElementById('empleado-contrasena').value;


        // Crear el objeto con los datos del empleado
        const empleadoData = {
            nombre: nombre,
            documento: documento,
            email: email,
            contrasena: contrasena,
            rol: {
                id: rol,
            }
        };

        // Hacer el POST al backend
        fetch('http://localhost:8080/empleados', { // Ajusta la URL según tu API
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(empleadoData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al guardar el empleado');
                }
                return response.json();
            })
            .then(data => {
                alert('Empleado guardado exitosamente');
                document.getElementById('modalAgregarEmpleado').style.display = 'none';
                document.getElementById('form-agregar-empleado').reset();
                if (typeof cargarEmpleados === 'function') {
                    cargarEmpleados();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un problema al guardar el empleado');
            });
    }

    function mostrarEmpleados(empleadosFiltrados) {
        // const tablaEmpleados = document.querySelector('#tablaEmpleados');
        tablaEmpleados.innerHTML = ''; // Limpia las filas existentes

        empleadosFiltrados.forEach(empleado => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${empleado.nombre}</td>
                <td>${empleado.documento}</td>
                <td>${empleado.email}</td>
                <td>
                    ${empleado.rol.descripcion}
                        <button class="editar-empleado" data-id="${empleado.id}">Editar</button>
                    </td>
                    <td>
                        <button class="ver-info" data-id="${empleado.id}">Ver info</button>
                    </td>
            `;

            tablaEmpleados.appendChild(fila);
            setupEmpleadosEventListeners();
        });
    }

    // Función para filtrar empleados
    function filtrarEmpleados() {
        const termino = document.querySelector('#buscadorEmpleados').value.toLowerCase();

        const empleadosFiltrados = empleadosTotal.filter(empleado =>
            empleado.nombre.toLowerCase().includes(termino) ||
            empleado.documento.includes(termino) ||
            empleado.rol.descripcion.toLowerCase().includes(termino)
        );

        mostrarEmpleados(empleadosFiltrados);
    }

    // Escuchar el evento de entrada en el buscador
    document.querySelector('#buscadorEmpleados').addEventListener('input', filtrarEmpleados);

    // Cargar los empleados al iniciar
    cargarEmpleados();

    /**-------------------------------Seccion Peliculas------------------------------ */

    menuPeliculas.addEventListener('click', function () {
        vistaPeliculas.style.display = 'block';
        vistaFunciones.style.display = 'none';
        vistaEmpleados.style.display = 'none';
        cargarPeliculas();  // Cargar las películas
    });


    // Cargar películas
    function cargarPeliculas() {
        fetch('http://localhost:8080/peliculas')
            .then(response => response.json())
            .then(data => {
                tablaPeliculas.innerHTML = ''; // Limpiar tabla
                data.forEach(pelicula => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${pelicula.titulo}</td>
                        <td>${pelicula.duracion}</td>
                        <td>${pelicula.sinopsis}</td>
                        <td>${pelicula.genero.descripcion}</td>
                        <td>
                            <button class="editar" data-id="${pelicula.id}">Editar</button>
                            <button class="eliminar" data-id="${pelicula.id}">Eliminar</button>
                        </td>
                    `;
                    tablaPeliculas.appendChild(tr);
                });

                // Agregar funcionalidad para editar y eliminar película
                const botonesEliminar = document.querySelectorAll('.eliminar');
                botonesEliminar.forEach(boton => {
                    boton.addEventListener('click', function () {
                        const id = this.getAttribute('data-id');
                        eliminarPelicula(id);
                    });
                });

                // const botonesEditar = document.querySelectorAll('.editar');
                // botonesEditar.forEach(boton => {
                //     boton.addEventListener('click', function () {
                //         const id = this.getAttribute('data-id');
                //         editarPelicula(id);
                //     });
                // });
            });
    }

    function eliminarPelicula(id) {
        // Verificar si la película tiene funciones asociadas
        fetch(`http://localhost:8080/peliculas/${id}/tiene-funciones`)
            .then(response => response.json())
            .then(tieneFunciones => {
                if (tieneFunciones) {
                    alert('No se puede eliminar la película porque tiene funciones asociadas.');
                    return; // Detener el flujo si tiene funciones asociadas
                }
    
                // Si no tiene funciones, proceder a eliminar la película
                fetch(`http://localhost:8080/peliculas/${id}`, {
                    method: 'DELETE',
                })
                    .then(response => {
                        if (response.ok) {
                            alert('Película eliminada exitosamente.');
                            cargarPeliculas(); // Actualizar la lista de películas
                        } else {
                            alert('Error al eliminar la película.');
                            console.error('Error al eliminar la película:', response.statusText);
                        }
                    })
                    .catch(error => {
                        console.error('Error al conectar con el servidor:', error);
                        alert('Error al conectar con el servidor.');
                    });
            })
            .catch(error => {
                console.error('Error al verificar las funciones asociadas:', error);
                alert('Error al verificar las funciones asociadas.');
            });
    }
    


    // function editarPelicula(id) {
    //     fetch(`http://localhost:8080/peliculas/${id}`)
    //         .then(response => response.json())
    //         .then(pelicula => {
    //             document.getElementById('titulo').value = pelicula.titulo;
    //             document.getElementById('duracion').value = pelicula.duracion;
    //             document.getElementById('sinopsis').value = pelicula.sinopsis;
    //             document.getElementById('genero').value = pelicula.genero;
    //             modalPelicula.style.display = 'flex';
    //         });
    // }

    // Agregar una nueva película
    document.getElementById('btn-agregar-pelicula').addEventListener('click', function () {
        modalPelicula.style.display = 'flex';
        cargarGeneros();
    });

    document.getElementById('cerrarModalPelicula').addEventListener('click', function () {
        modalPelicula.style.display = 'none';
    });

    // Cargar géneros desde el backend
    function cargarGeneros() {
        fetch('http://localhost:8080/generos')
            .then(response => response.json())
            .then(data => {
                const generoSelect = document.getElementById('genero-pelicula_agregar');
                generoSelect.innerHTML = ' '; // Agregar opción predeterminada
                data.forEach(genero => {
                    const option = document.createElement('option');
                    option.value = genero.id;
                    option.textContent = genero.descripcion;
                    generoSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar los géneros:', error));
    }

    formPelicula.addEventListener('submit', function (event) {
        event.preventDefault(); // Evitar recargar la página
        const generoId = document.getElementById('genero-pelicula_agregar').value;
        console.log(generoId);
        const pelicula = {
            titulo: document.querySelector('#titulo_agregar').value,
            duracion: document.querySelector('#duracion_agregar').value,
            sinopsis: document.querySelector('#sinopsis_agregar').value,
            genero: {
                id: generoId,
            }
        };

        // Validar que se haya seleccionado un género
        if (!generoId) {
            alert('Por favor, selecciona un género.');
            return;
        }

        // Enviar datos al backend
        fetch('http://localhost:8080/peliculas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pelicula)
        })
            .then(response => {
                if (response.ok) {
                    alert('Película agregada exitosamente.');
                    formPelicula.reset();
                    cargarPeliculas(); // Actualizar la lista de películas
                } else {
                    console.error('Error al guardar la película:', response.statusText);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    });

    // Mostrar vista de Funciones
    menuFunciones.addEventListener('click', function () {
        vistaPeliculas.style.display = 'none';
        vistaFunciones.style.display = 'block';
        vistaEmpleados.style.display = 'none';
        cargarFunciones();  // Cargar las funciones
    });













    // Función para editar película
    function editarPelicula(id) {
        fetch(`/api/peliculas/${id}`)
            .then(response => response.json())
            .then(pelicula => {
                document.getElementById('titulo').value = pelicula.titulo;
                document.getElementById('director').value = pelicula.director;
                document.getElementById('duracion').value = pelicula.duracion;
                modalPelicula.style.display = 'flex';
            });
    }
});
// Implementación para Funciones
function cargarFunciones() {
    fetch('/funciones')
        .then(response => response.json())
        .then(data => {
            tablaFunciones.innerHTML = '';
            data.forEach(funcion => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${funcion.fecha}</td>
                    <td>${funcion.hora}</td>
                    <td>${funcion.pelicula ? funcion.pelicula.titulo : 'Sin película'}</td>
                    <td>
                        <button class="editar-funcion" data-id="${funcion.id}">Editar</button>
                        <button class="eliminar-funcion" data-id="${funcion.id}">Eliminar</button>
                    </td>
                `;
                tablaFunciones.appendChild(tr);
            });

            // Agregar event listeners para los botones
            setupFuncionesEventListeners();
        });
}

// Event listeners para Funciones
function setupFuncionesEventListeners() {
    document.querySelectorAll('.eliminar-funcion').forEach(boton => {
        boton.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            eliminarFuncion(id);
        });
    });

    document.querySelectorAll('.editar-funcion').forEach(boton => {
        boton.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            editarFuncion(id);
        });
    });
}

// CRUD operations para Funciones
function agregarFuncion(funcion) {
    fetch('/funciones', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(funcion)
    })
        .then(response => response.json())
        .then(data => {
            cargarFunciones();
            document.getElementById('modal-funcion').style.display = 'none';
        });
}

function editarFuncion(id) {
    fetch(`/funciones/${id}`)
        .then(response => response.json())
        .then(funcion => {
            // Rellenar el modal con los datos de la función
            document.getElementById('funcion-fecha').value = funcion.fecha;
            document.getElementById('funcion-hora').value = funcion.hora;
            document.getElementById('funcion-pelicula').value = funcion.pelicula ? funcion.pelicula.id : '';

            document.getElementById('modal-funcion').style.display = 'flex';
        });
}

function eliminarFuncion(id) {
    if (confirm('¿Está seguro de eliminar esta función?')) {
        fetch(`/funciones/${id}`, {
            method: 'DELETE'
        })
            .then(() => {
                cargarFunciones();
            });
    }
}



// Búsqueda para todas las entidades
function setupBuscadores() {
    // Buscador de Películas
    buscadorPeliculas.addEventListener('input', function (e) {
        const busqueda = e.target.value.toLowerCase();
        const filas = tablaPeliculas.getElementsByTagName('tr');

        Array.from(filas).forEach(fila => {
            const titulo = fila.cells[0].textContent.toLowerCase();
            const director = fila.cells[1].textContent.toLowerCase();
            fila.style.display =
                titulo.includes(busqueda) || director.includes(busqueda)
                    ? ''
                    : 'none';
        });
    });

    // Buscador de Funciones
    buscadorFunciones.addEventListener('input', function (e) {
        const busqueda = e.target.value.toLowerCase();
        const filas = tablaFunciones.getElementsByTagName('tr');

        Array.from(filas).forEach(fila => {
            const fecha = fila.cells[0].textContent.toLowerCase();
            const pelicula = fila.cells[2].textContent.toLowerCase();
            fila.style.display =
                fecha.includes(busqueda) || pelicula.includes(busqueda)
                    ? ''
                    : 'none';
        });
    });

    // Buscador de Empleados
    buscadorEmpleados.addEventListener('input', function (e) {
        const busqueda = e.target.value.toLowerCase();
        const filas = tablaEmpleados.getElementsByTagName('tr');

        Array.from(filas).forEach(fila => {
            const nombre = fila.cells[0].textContent.toLowerCase();
            const documento = fila.cells[1].textContent.toLowerCase();
            fila.style.display =
                nombre.includes(busqueda) || documento.includes(busqueda)
                    ? ''
                    : 'none';
        });
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    setupBuscadores();

    // Event listeners para los botones de agregar
    document.getElementById('btn-agregar-funcion').addEventListener('click', function () {
        document.getElementById('modal-funcion').style.display = 'flex';
    });

    document.getElementById('btn-agregar-empleado').addEventListener('click', function () {
        document.getElementById('modal-empleado').style.display = 'flex';
    });
});