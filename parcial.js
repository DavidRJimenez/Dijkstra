// Estructura básica de un nodo
class Nodo {
    constructor(nombre, duracion, costo, prerequisitos, postrequisitos) {
        this.nombre = nombre;
        this.duracion = duracion;
        this.costo = costo;
        this.prerequisitos = prerequisitos.split(',').map(item => item.trim());
        this.postrequisitos = postrequisitos.split(',').map(item => item.trim());
    }
}

// Lista de nodos y aristas o conexiones
let nodos = [];
let aristas = [];

// Crear el grafo usando D3.js
let svg = d3.select("#grafo").append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

// Configurar la simulación de fuerza
let force = d3.forceSimulation(nodos)
    .force("charge", d3.forceManyBody().strength(-100)) // Fuerza de repulsión entre los nodos
    .force("center", d3.forceCenter(svg.node().clientWidth / 2, svg.node().clientHeight / 2)); // Centrar los nodos en el medio del SVG

// No aplicar fuerza de enlace para evitar que los nodos se junten
force.force("link", null);

// Variables para nodos y enlaces
let node = svg.selectAll(".node");
let link = svg.selectAll(".link-line"); 


force.on("tick", function() {
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

// Actualizar la posición de los puntos de inicio y fin de las aristas
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

// Actualizar la posición del texto del costo de la conexión
linkLabels.attr("x", function(d) { return (d.source.x + d.target.x) / 2; })
    .attr("y", function(d) { return (d.source.y + d.target.y) / 2; });
});

// Funciones para permitir el arrastre de los nodos
function dragstarted(d) {
    if (!d3.event.active) force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) force.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
// Crear líneas para las conexiones entre nodos
link = link.data(aristas)
    .enter().append("line")
    .attr("class", "link-line");


// Crear etiquetas para las conexiones
linkLabels = svg.selectAll(".link-label")
    .data(aristas)
    .enter().append("text")
    .text(function(d) { return d.nombre; })
    .attr("class", "link-label")
    .attr("text-anchor", "middle")
    .attr("dy", -5); // Ajustar la posición vertical de las etiquetas

// Funcionalidad del boton crearNodo
document.getElementById("crearNodo").addEventListener("click", function() {
    console.log("Botón Crear Nodo presionado");
    // Obtener valores del formulario
    let nombreNodo = document.getElementById("nombreNodo").value;
    let duracionNodo = parseFloat(document.getElementById("duracionNodo").value);
    let costoNodo = parseFloat(document.getElementById("costoNodo").value);
    let prerequisitosNodo = document.getElementById("prerequisitosNodo").value;
    let postrequisitosNodo = document.getElementById("postrequisitosNodo").value;

    // Validar nombre no vacío
    if (!nombreNodo) {
        alert("Por favor, ingrese el nombre del nodo.");
        return;
    }

    // Crear nuevo nodo
    let nuevoNodo = new Nodo(nombreNodo, duracionNodo || 0, costoNodo || 0, prerequisitosNodo, postrequisitosNodo);
    nodos.push(nuevoNodo);

    // Actualizar el grafo
    updateGraph();
});

document.getElementById("eliminarNodo").addEventListener("click", function() {
    // Obtener nombre del nodo a eliminar
    let nombreNodo = document.getElementById("nombreNodo").value.trim();
    
    // Buscar el nodo a eliminar
    let indexNodo = nodos.findIndex(nodo => nodo.nombre.toLowerCase() === nombreNodo.toLowerCase());
    
    if (indexNodo !== -1) {
        // Eliminar el nodo del array de nodos
        nodos.splice(indexNodo, 1);
        
        // Filtrar la lista de aristas para eliminar las relacionadas con el nodo
        aristas = aristas.filter(arista => arista.source.nombre.toLowerCase() !== nombreNodo.toLowerCase() && arista.target.nombre.toLowerCase() !== nombreNodo.toLowerCase());
        
        // Actualizar los nodos visuales
        node = node.data(nodos);
        node.exit().remove(); // Eliminar nodos visuales que ya no están en los datos
        
        // Actualizar las aristas visuales
        link = link.data(aristas);
        link.exit().remove(); // Eliminar aristas visuales que ya no están en los datos
        
        // Actualizar el grafo
        updateGraph();
    } else {
        alert("No se encontró un nodo con el nombre proporcionado.");
    }
});


// Funcionalidad del boton editarNodo
document.getElementById("editarNodo").addEventListener("click", function() {
    // Obtener nombre del nodo a editar
    let nombreNodo = document.getElementById("nombreNodo").value;
    // Buscar el nodo en la lista de nodos
    let nodo = nodos.find(nodo => nodo.nombre === nombreNodo);
    if (nodo) {
        // Solicitar nuevo nombre a través de un cuadro de diálogo
        let nuevoNombre = prompt("Introduce el nuevo nombre para el nodo:");
        if (nuevoNombre) {
            // Actualizar nombre del nodo
            nodo.nombre = nuevoNombre;
            // Actualizar el texto del nodo en el grafo
            node.select("text").text(function(d) { return d.nombre; });

            // Actualizar las aristas relacionadas con el nodo
            aristas.forEach(function(arista) {
                if (arista.source.nombre === nombreNodo) {
                    arista.source.nombre = nuevoNombre;
                }
                if (arista.target.nombre === nombreNodo) {
                    arista.target.nombre = nuevoNombre;
                }
            });

            updateGraph();
        } else {
            alert("No se proporcionó un nuevo nombre.");
        }
    } else {
        alert("No se encontró un nodo con el nombre proporcionado.");
    }
});

// Variable global para almacenar el costo de la conexión
let costoConexion;

// Funcionalidad del botón conectarNodos
document.getElementById("conectarNodos").addEventListener("click", function() {
    // Obtener nombre de la arista (opcional, si tienes una forma de nombrar aristas)
    let nombreArista = document.getElementById("nombreArista").value;
    // Obtener nombres de los nodos a conectar
    let nodoOrigen = prompt("Introduce el nombre del nodo de origen:");
    let nodoDestino = prompt("Introduce el nombre del nodo de destino:");

    // Obtener el costo de la conexión
    costoConexion = parseFloat(document.getElementById("costoArista").value);

    // Buscar los nodos en la lista
    let nodoOrigenObj = nodos.find(nodo => nodo.nombre === nodoOrigen);
    let nodoDestinoObj = nodos.find(nodo => nodo.nombre === nodoDestino);

    // Validar que ambos nodos existan
    if (!nodoOrigenObj || !nodoDestinoObj) {
        alert("Uno o ambos nodos no existen.");
        return;
    }

    // Crear la arista
    let nuevaArista = {
        source: nodoOrigenObj,
        target: nodoDestinoObj,
        nombre: nombreArista, // Si deseas incluir un nombre en la arista, usa la variable nombreArista
        costo: costoConexion // Agregar el costo de la conexión a la arista
    };

    // Añadir la nueva arista a la lista de aristas
    aristas.push(nuevaArista);

    // Actualizar el grafo
    updateGraph();

    // Actualizar el texto del costo de la conexión
    updateCostoConexion(nuevaArista, costoConexion);
});

// Función para actualizar el texto del costo de la conexión
function updateCostoConexion(arista, costo) {
    // Seleccionar el texto del costo de la conexión asociado con la arista
    let costoText = svg.select(`.costo-${arista.nombre}`);
    // Actualizar el texto con el nuevo costo
    costoText.text(costo);
}

// Funcionalidad del botón eliminar arista
document.getElementById("eliminarArista").addEventListener("click", function() {
    // Obtener nombres de los nodos de origen y destino para eliminar la arista
    let nodoOrigen = prompt("Introduce el nombre del nodo de origen:");
    let nodoDestino = prompt("Introduce el nombre del nodo de destino:");

    // Filtrar la lista de aristas para eliminar la arista que conecta los nodos especificados
    aristas = aristas.filter(arista =>
        !(arista.source.nombre === nodoOrigen && arista.target.nombre === nodoDestino)
    );

    // Actualizar el grafo
    updateGraph();
});

// Funcionalidad del botón editar arista
document.getElementById("editarArista").addEventListener("click", function() {
    // Obtener nombres de los nodos de origen y destino de la arista a editar
    let nodoOrigen = prompt("Introduce el nombre del nodo de origen:");
    let nodoDestino = prompt("Introduce el nombre del nodo de destino:");

    // Buscar la arista que conecta los nodos especificados
    let arista = aristas.find(arista => arista.source.nombre === nodoOrigen && arista.target.nombre === nodoDestino);
    
    if (arista) {
        // Solicitar un nuevo nombre para la arista (opcional)
        let nuevoNombre = prompt("Introduce el nuevo nombre para la arista (opcional):");
        if (nuevoNombre) {
            // Actualizar el nombre de la arista
            arista.nombre = nuevoNombre;
        }
    } else {
        alert("No se encontró una arista que conecte los nodos especificados.");
    }

    // Actualizar el grafo
    updateGraph();
});

//Funcionalidad del boton ruta minima 
document.getElementById("encontrarRutaMinima").addEventListener("click", function() {
    let nodoOrigen = prompt("Introduce el nombre del nodo de origen:");
    let nodoDestino = prompt("Introduce el nombre del nodo de destino:");

    // Llamar a la función que calculará la ruta mínima
    encontrarRutaMinima(nodoOrigen, nodoDestino);
});

// Función para encontrar la ruta mínima entre dos nodos
function encontrarRutaMinima(nodoOrigen, nodoDestino) {
    // Crear un conjunto para almacenar los nodos visitados
    let visitados = {};

    // Crear un objeto para almacenar las distancias mínimas desde el nodoOrigen a cada nodo
    let distancias = {};
    nodos.forEach(nodo => {
        distancias[nodo.nombre] = Infinity; // Inicializar todas las distancias como infinito
    });
    distancias[nodoOrigen] = 0; // La distancia desde el nodoOrigen a sí mismo es 0

    // Crear un objeto para almacenar los nodos anteriores en la ruta mínima
    let previos = {};

    // Mientras haya nodos sin visitar
    while (Object.keys(visitados).length < nodos.length) {
        // Encontrar el nodo no visitado con la distancia mínima
        let nodoActual = null;
        let distanciaMinima = Infinity;
        Object.keys(distancias).forEach(nodo => {
            if (!visitados[nodo] && distancias[nodo] < distanciaMinima) {
                nodoActual = nodo;
                distanciaMinima = distancias[nodo];
            }
        });

        // Si no se encontró ningún nodo disponible, salir del bucle
        if (nodoActual === null) break;

        // Marcar el nodo actual como visitado
        visitados[nodoActual] = true;

        // Obtener los vecinos del nodo actual
        let vecinos = [];
        aristas.forEach(arista => {
            if (arista.source.nombre === nodoActual) {
                vecinos.push({ nombre: arista.target.nombre, costo: arista.costo });
            } else if (arista.target.nombre === nodoActual) {
                vecinos.push({ nombre: arista.source.nombre, costo: arista.costo });
            }
        });

        // Actualizar las distancias a los vecinos
        vecinos.forEach(vecino => {
            let nuevaDistancia = distancias[nodoActual] + parseFloat(vecino.costo);
            if (nuevaDistancia < distancias[vecino.nombre]) {
                distancias[vecino.nombre] = nuevaDistancia;
                previos[vecino.nombre] = nodoActual;
            }
        });
    }

    // Reconstruir la ruta mínima desde el nodo destino hacia atrás
    let ruta = [];
    let nodoActual = nodoDestino;
    while (nodoActual !== undefined && nodoActual !== null && nodoActual !== nodoOrigen) {
        ruta.unshift(nodoActual);
        nodoActual = previos[nodoActual];
    }

    // Verificar si se encontró una ruta mínima
    if (nodoActual === undefined || nodoActual === null) {
        alert("No hay ruta disponible desde " + nodoOrigen + " hasta " + nodoDestino);
    } else {
        ruta.unshift(nodoOrigen);
        alert("Ruta mínima: " + ruta.join(" -> "));
        // Resaltar la ruta mínima en el grafo
        resaltarRutaMinima(ruta);
    }
}

// Función para resaltar la ruta mínima gráficamente
function resaltarRutaMinima(ruta) {
    // Remover la clase de resaltado de todas las aristas
    svg.selectAll(".arista").classed("ruta-minima", false);
    
    // Iterar sobre las aristas que forman parte de la ruta mínima y resaltarlas
    for (let i = 0; i < ruta.length - 1; i++) {
        let nodoOrigen = ruta[i];
        let nodoDestino = ruta[i + 1];
        
        // Seleccionar la arista que conecta los nodos de la ruta mínima
        let aristaSeleccionada = svg.selectAll(".arista")
            .filter(function(d) {
                return (d.source.nombre === nodoOrigen && d.target.nombre === nodoDestino) ||
                       (d.source.nombre === nodoDestino && d.target.nombre === nodoOrigen);
            });
        
        // Resaltar la arista seleccionada
        aristaSeleccionada.classed("ruta-minima", true);
    }
}


// Función para encontrar la ruta crítica entre dos nodos
function encontrarRutaCritica(nodoOrigen, nodoDestino) {
    // Crear un objeto para almacenar las distancias máximas desde el nodoOrigen a cada nodo
    let distanciasMaximas = {};
    nodos.forEach(nodo => {
        distanciasMaximas[nodo.nombre] = nodo.nombre === nodoOrigen ? 0 : -Infinity;
    });

    // Crear un objeto para almacenar los nodos anteriores en el camino más largo
    let previos = {};

    // Mientras haya nodos sin visitar
    while (Object.keys(distanciasMaximas).length > 0) {
        // Encontrar el nodo no visitado con la distancia máxima
        let nodoActual = null;
        let distanciaMaxima = -Infinity;
        Object.keys(distanciasMaximas).forEach(nodo => {
            if (distanciasMaximas[nodo] > distanciaMaxima) {
                nodoActual = nodo;
                distanciaMaxima = distanciasMaximas[nodo];
            }
        });

        // Si no se encontró ningún nodo disponible, salir del bucle
        if (nodoActual === null) break;

        // Eliminar el nodo actual de la lista de nodos sin visitar
        delete distanciasMaximas[nodoActual];

        // Obtener los vecinos del nodo actual
        let vecinos = [];
        aristas.forEach(arista => {
            if (arista.source.nombre === nodoActual) {
                vecinos.push({ nombre: arista.target.nombre, costo: arista.costo });
            }
        });

        // Actualizar las distancias máximas a los vecinos
        vecinos.forEach(vecino => {
            let nuevaDistancia = distanciaMaxima + parseFloat(vecino.costo);
            if (nuevaDistancia > distanciasMaximas[vecino.nombre]) {
                distanciasMaximas[vecino.nombre] = nuevaDistancia;
                previos[vecino.nombre] = nodoActual;
            }
        });
    }

    // Reconstruir la ruta más larga desde el nodo destino hacia atrás
    let rutaMasLarga = [];
    let nodoActual = nodoDestino;
    while (nodoActual !== undefined && nodoActual !== null && nodoActual !== nodoOrigen) {
        rutaMasLarga.unshift(nodoActual);
        nodoActual = previos[nodoActual];
    }

    // Verificar si se encontró una ruta más larga
    if (nodoActual === undefined || nodoActual === null) {
        alert("No hay ruta disponible desde " + nodoOrigen + " hasta " + nodoDestino);
    } else {
        rutaMasLarga.unshift(nodoOrigen);
        alert("Ruta más larga: " + rutaMasLarga.join(" -> "));
    }
}


function resaltarRutaCritica(rutaCritica) {
    // Remover la clase de resaltado de todos los nodos y aristas
    svg.selectAll(".node").classed("ruta-critica", false);
    svg.selectAll(".link").classed("ruta-critica", false);

    // Iterar sobre los nodos de la ruta crítica y resaltarlos
    rutaCritica.forEach(nombreNodo => {
        svg.select(node-$,{nombreNodo}).classed("ruta-critica", true);
    });

    // Iterar sobre las aristas de la ruta crítica y resaltarlas
    for (let i = 0; i < rutaCritica.length - 1; i++) {
        let nodoOrigen = rutaCritica[i];
        let nodoDestino = rutaCritica[i + 1];
        svg.select(link-$,{nodoOrigen}-$,{nodoDestino}).classed("ruta-critica", true);
    }
}

document.getElementById("encontrarRutaCritica").addEventListener("click", function() {
    console.log("Evento de clic disparado");
    let nodoOrigen = prompt("Introduce el nombre del nodo de origen:");
    let nodoDestino = prompt("Introduce el nombre del nodo de destino:");
    encontrarRutaCritica(nodoOrigen, nodoDestino);
});


function cargarGrafo(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    
    lector.onload = function(e) {
        const contenido = e.target.result;
        const grafo = JSON.parse(contenido);

        nodos = grafo.nodos;
        aristas = grafo.aristas;

        // Actualiza el grafo en la visualización
        updateGraph();
    };

    lector.readAsText(archivo);
}

document.getElementById('inputFile').addEventListener('change', cargarGrafo);


function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
// Función para actualizar el grafo
function updateGraph() {
    console.log("Actualizando el grafo...");
    
    // Actualizar los nodos en el grafo
    node = node.data(nodos);
    
    let nodeEnter = node.enter().append("g") 
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Añadir círculo para representar el nodo
    nodeEnter.append("circle")
        .attr("r", 30)
        .style("fill", getRandomColor()); 

    // Añadir texto con el nombre del nodo 
    nodeEnter.append("text")
        .text(function(d) { return d.nombre; })
        .attr("text-anchor", "middle")
        .attr("dy", 5)
        .style("font-size", "12px");

    // Fusionar los nodos existentes y los recién creados
    node = nodeEnter.merge(node);

    // Actualizar las aristas en el grafo
    link = svg.selectAll(".link").data(aristas);
    
    link.enter().append("line")
        .attr("class", "link")
        .attr("stroke", "black") // Color de las líneas de conexión
        .attr("stroke-width", 2)
        .merge(link)
        .attr("x1", function(d) { return d.source.x; }) // Coordenada x del nodo de origen
        .attr("y1", function(d) { return d.source.y; }) // Coordenada y del nodo de origen
        .attr("x2", function(d) { return d.target.x; }) // Coordenada x del nodo de destino
        .attr("y2", function(d) { return d.target.y; }); // Coordenada y del nodo de destino

    // Actualizar la simulación de la fuerza
    force.nodes(nodos);
    force.alpha(0.3).restart();

    const adjacencyMatrix = getAdjacencyMatrix(nodos, aristas);
    const incidenceMatrix = getIncidenceMatrix(nodos, aristas);

    showMatrices(adjacencyMatrix, incidenceMatrix);

    // Listener para el evento "tick" de la simulación de fuerza
    force.on("tick", function() {
        // Actualizar la posición de los nodos en el gráfico
        node.attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; 
        });
        
        // Actualizar la posición de las líneas de conexión entre los nodos
        svg.selectAll(".link")
            .attr("x1", function(d) { return d.source.x; }) 
            .attr("y1", function(d) { return d.source.y; }) 
            .attr("x2", function(d) { return d.target.x; }) 
            .attr("y2", function(d) { return d.target.y; }); 

        // Actualizar el texto del costo de la conexión
        updateCostoConexionText();
    });
}

// Función para actualizar el texto del costo de la conexión
function updateCostoConexionText() {
    // Seleccionar todos los textos de costo de conexión y enlazarlos con los datos de las aristas
    let costoText = svg.selectAll(".costo-text").data(aristas);

    // Agregar texto para cada arista
    costoText.enter().append("text")
        .attr("class", "costo-text")
        .attr("text-anchor", "middle")
        .attr("dy", -10)
        .text(function(d) { return d.costo; }); // Mostrar el costo de la arista 

    // Fusionar los textos existentes y los recién creados
    costoText = costoText.merge(costoText);

    // Actualizar la posición de los textos de costo de conexión
    costoText.attr("x", function(d) { return (d.source.x + d.target.x) / 2; })
        .attr("y", function(d) { return (d.source.y + d.target.y) / 2; });
}

function getAdjacencyMatrix(nodos, aristas) {
    const matrix = {};

    // Inicializar la matriz con ceros
    nodos.forEach(nodo => {
        matrix[nodo.nombre] = {};
        nodos.forEach(innerNodo => {
            matrix[nodo.nombre][innerNodo.nombre] = 0;
        });
    });

    // Llenar la matriz con las conexiones
    aristas.forEach(arista => {
        matrix[arista.source.nombre][arista.target.nombre] = 1;
        // Si el grafo es no dirigido, añadir también la conexión inversa
        // matrix[arista.target.nombre][arista.source.nombre] = 1;
    });

    return matrix;
}

function getIncidenceMatrix(nodos, aristas) {
    const matrix = {};

    // Inicializar la matriz con ceros
    nodos.forEach(nodo => {
        matrix[nodo.nombre] = {};
        aristas.forEach(arista => {
            matrix[nodo.nombre][arista.nombre] = 0;
        });
    });

    // Llenar la matriz con las conexiones
    aristas.forEach(arista => {
        matrix[arista.source.nombre][arista.nombre] = -1;
        matrix[arista.target.nombre][arista.nombre] = 1;
    });

    return matrix;
}

function showMatrices(adjacencyMatrix, incidenceMatrix) {
    const matricesDiv = document.getElementById("matrices");

    matricesDiv.innerHTML = `
        <h3>Matriz de Adyacencia</h3>
        <pre>${JSON.stringify(adjacencyMatrix, null, 2)}</pre>
        <h3>Matriz de Incidencia</h3>
        <pre>${JSON.stringify(incidenceMatrix, null, 2)}</pre>
    `;
}
function showMatrices(adjacencyMatrix, incidenceMatrix) {
    const matricesDiv = document.getElementById("matrices");

    matricesDiv.innerHTML = `
        <h4>Matriz de Adyacencia</h4>
        <pre>${JSON.stringify(adjacencyMatrix, null, 2)}</pre>
        <h4>Matriz de Incidencia</h4>
        <pre>${JSON.stringify(incidenceMatrix, null, 2)}</pre>
    `;
}

document.getElementById("showMatrices").addEventListener("click", function() {
    const adjacencyMatrix = getAdjacencyMatrix(nodos, aristas);
    const incidenceMatrix = getIncidenceMatrix(nodos, aristas);

    showMatrices(adjacencyMatrix, incidenceMatrix);
});


document.getElementById("showMatrices").addEventListener("click", function() {
    const adjacencyMatrix = getAdjacencyMatrix(nodos, aristas);
    const incidenceMatrix = getIncidenceMatrix(nodos, aristas);

    showMatrices(adjacencyMatrix, incidenceMatrix);
});

document.getElementById("showMatrices").addEventListener("click", function() {
    const adjacencyMatrix = getAdjacencyMatrix(nodos, aristas);
    const incidenceMatrix = getIncidenceMatrix(nodos, aristas);

    // Mostrar matrices en el div con id "matrices"
    document.getElementById("matrices").innerHTML = `
        <h3>Matriz de Adyacencia</h3>
        <pre>${JSON.stringify(adjacencyMatrix, null, 2)}</pre>
        <h3>Matriz de Incidencia</h3>
        <pre>${JSON.stringify(incidenceMatrix, null, 2)}</pre>
    `;
});


function updateLinks() {
    // Actualiza las coordenadas 'x1' y 'y1' del punto inicial de cada enlace ('source')
    links.attr("x1", function(d) { return d.source.x; })
         .attr("y1", function(d) { return d.source.y; })
         // Actualiza las coordenadas 'x2' y 'y2' del punto final de cada enlace ('target')
         .attr("x2", function(d) { return d.target.x; })
         .attr("y2", function(d) { return d.target.y; });
}

// Establecer un listener para el evento "tick" en la simulación de fuerza
force.on("tick", function() {
    // Actualizar la posición de los nodos en el gráfico
    node.attr("transform", function(d) { 
        // La función "translate" traslada los nodos a las coordenadas (x, y) calculadas por la simulación de fuerza
        return "translate(" + d.x + "," + d.y + ")"; 
    });
    
    // Actualizar la posición de las líneas de conexión entre los nodos
    svg.selectAll(".link")
        .attr("x1", function(d) { return d.source.x; }) 
        .attr("y1", function(d) { return d.source.y; }) 
        .attr("x2", function(d) { return d.target.x; }) 
        .attr("y2", function(d) { return d.target.y; }); 
});