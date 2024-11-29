document.addEventListener("DOMContentLoaded", function () {
  const menuClientes = document.getElementById("menu-clientes");
  const vistaClientes = document.getElementById("vista-clientes");
  const tablaClientes = document.getElementById("tabla-clientes");
  const vistaEmpleados = document.getElementById("vista-empleados");
  const vistaPeliculas = document.getElementById("vista-peliculas");
  const vistaFunciones = document.getElementById("vista-funciones");
  
  menuClientes.addEventListener("click", function () {
    vistaPeliculas.style.display = "none";
    vistaFunciones.style.display = "none";
    vistaEmpleados.style.display = "none";
    vistaClientes.style.display = "block";
    cargarClientes();
  });

  let clientesTotal = [];
  function cargarClientes() {
    fetch("http://localhost:8080/clientes")
      .then((response) => response.json())
      .then((data) => {
        tablaClientes.innerHTML = "";
        clientesTotal = data;
        data.forEach((cliente) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                            <td>${cliente.nombre}</td>
                            <td>${cliente.documento}</td>
                            <td>${cliente.email}</td>
                            <td>${cliente.telefono}</td>
                        `;
          tablaClientes.appendChild(tr);
        });
      });
  }

 

  function filtrarClientes() {
    const termino = document
      .querySelector("#buscadorClientes")
      .value.toLowerCase();
    const clientesFiltrados = clientesTotal.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(termino) ||
        cliente.documento.includes(termino) ||
        cliente.email.toLowerCase().includes(termino)
    );
    mostrarClientes(clientesFiltrados);
  }

  function mostrarClientes(clientesFiltrados) {
    tablaClientes.innerHTML = "";
    clientesFiltrados.forEach((cliente) => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
                  <td>${cliente.nombre}</td>
                  <td>${cliente.documento}</td>
                  <td>${cliente.email}</td>
                  <td>${cliente.telefono}</td>
              `;
      tablaClientes.appendChild(fila);
    });
  }

  

  document
    .querySelector("#buscadorClientes")
    .addEventListener("input", filtrarClientes);
  cargarClientes();
});
