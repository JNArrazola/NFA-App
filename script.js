const graphContainer = document.getElementById("graph-container");
const actionsList = document.getElementById("actions-list");
const sequenceList = document.getElementById("sequence-list");
const verifyButton = document.getElementById("verify-button");

let nodes = [];
let edges = [];
let selectedNode = null;
let initialState = null;

const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.innerHTML = `
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z"></path>
    </marker>
  </defs>
`;
graphContainer.appendChild(svg);

// Context menu setup
const contextMenu = document.createElement("ul");
contextMenu.id = "context-menu";
contextMenu.style.position = "absolute";
contextMenu.style.display = "none";
contextMenu.style.listStyle = "none";
contextMenu.style.padding = "5px";
contextMenu.style.backgroundColor = "#fff";
contextMenu.style.border = "1px solid #ddd";
contextMenu.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
document.body.appendChild(contextMenu);

const options = [
  "Marcar/Desmarcar como estado inicial",
  "Marcar/Desmarcar como estado final",
  "Cambiar nombre",
  "Borrar nodo"
];

options.forEach((optionText, index) => {
  const option = document.createElement("li");
  option.textContent = optionText;
  option.style.cursor = "pointer";
  option.style.padding = "5px";
  option.addEventListener("click", () => handleContextMenuOption(index));
  contextMenu.appendChild(option);
});

let contextMenuTargetNode = null;

graphContainer.addEventListener("dblclick", (e) => {
  if (e.target === graphContainer) {
    const name = prompt("Enter node name:", `Node ${nodes.length}`);
    if (name) {
      createNode(e.clientX, e.clientY, name);
    }
  }
});

graphContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("node")) {
    handleNodeClick(e.target);
  }
});

graphContainer.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("node")) {
    contextMenuTargetNode = e.target;
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.style.display = "block";
  } else {
    contextMenu.style.display = "none";
    contextMenuTargetNode = null;
  }
});

document.addEventListener("click", () => {
  contextMenu.style.display = "none";
  contextMenuTargetNode = null;
});

function createNode(x, y, name) {
  const node = document.createElement("div");
  node.classList.add("node");
  node.style.left = `${x - 25}px`;
  node.style.top = `${y - 25}px`;
  node.textContent = name;

  node.dataset.isInitial = "false";
  node.dataset.isFinal = "false";

  graphContainer.appendChild(node);
  nodes.push({ element: node, name });
}

function handleNodeClick(node) {
  if (!selectedNode) {
    selectedNode = node;
    node.style.border = "2px solid #2ecc71"; // Resaltar nodo seleccionado
  } else if (selectedNode === node) {
    // Doble clic en el mismo nodo: crear autolazo
    const edgeName = prompt("Enter self-loop name:", "Loop");
    if (edgeName) {
      createEdge(node, node, edgeName); // Autolazo
    }
    selectedNode.style.border = "none"; // Quitar resaltado
    selectedNode = null;
  } else {
    const edgeName = prompt("Enter edge name:", "Edge");
    if (edgeName) {
      createEdge(selectedNode, node, edgeName); // Arista normal
    }
    selectedNode.style.border = "none"; // Quitar resaltado
    selectedNode = null;
  }
}


function createEdge(from, to, name) {
  const isSelfLoop = from === to;

  if (isSelfLoop) {
    const fromX = from.offsetLeft + 25;
    const fromY = from.offsetTop + 25;

    const existingLoops = edges.filter(edge => edge.from === from && edge.to === to).length;
    const offset = 20 + existingLoops * 10;

    const loop = document.createElementNS("http://www.w3.org/2000/svg", "path");
    loop.setAttribute(
      "d",
      `M ${fromX - offset} ${fromY - offset} 
         C ${fromX - offset * 1.5} ${fromY - offset * 1.5}, 
           ${fromX + offset * 1.5} ${fromY - offset * 1.5}, 
           ${fromX + offset} ${fromY - offset}`
    );
    loop.setAttribute("fill", "none");
    loop.setAttribute("stroke", "#000");
    loop.setAttribute("stroke-width", "2");
    loop.setAttribute("marker-end", "url(#arrow)");

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", fromX + offset);
    label.setAttribute("y", fromY - offset - 10);
    label.textContent = name;

    svg.appendChild(loop);
    svg.appendChild(label);

    edges.push({ from, to, path: loop, label, name });
  } else {
    const fromX = from.offsetLeft + 25;
    const fromY = from.offsetTop + 25;
    const toX = to.offsetLeft + 25;
    const toY = to.offsetTop + 25;

    const existingEdges = edges.filter(edge => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)).length;
    const offset = (existingEdges % 2 === 0 ? 1 : -1) * Math.ceil(existingEdges / 2) * 10;

    const angle = Math.atan2(toY - fromY, toX - fromX);
    const adjustedFromX = fromX + 20 * Math.cos(angle) + offset * Math.sin(angle);
    const adjustedFromY = fromY + 20 * Math.sin(angle) - offset * Math.cos(angle);
    const adjustedToX = toX - 20 * Math.cos(angle) + offset * Math.sin(angle);
    const adjustedToY = toY - 20 * Math.sin(angle) - offset * Math.cos(angle);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", adjustedFromX);
    line.setAttribute("y1", adjustedFromY);
    line.setAttribute("x2", adjustedToX);
    line.setAttribute("y2", adjustedToY);
    line.setAttribute("stroke", "#000");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("marker-end", "url(#arrow)");

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", (adjustedFromX + adjustedToX) / 2 + offset * 0.5);
    label.setAttribute("y", (adjustedFromY + adjustedToY) / 2 - offset * 0.5);
    label.textContent = name;

    svg.appendChild(line);
    svg.appendChild(label);

    edges.push({ from, to, line, label, name });
  }

  addAction(name);
}



function handleContextMenuOption(optionIndex) {
  if (!contextMenuTargetNode) return;
  const node = contextMenuTargetNode;

  switch (optionIndex) {
    case 0: // Mark/Unmark as initial state
      if (node.dataset.isInitial === "true") {
        node.dataset.isInitial = "false";
        updateNodeStyle(node);
        initialState = null;
      } else {
        if (initialState) {
          initialState.dataset.isInitial = "false";
          updateNodeStyle(initialState);
        }
        node.dataset.isInitial = "true";
        updateNodeStyle(node);
        initialState = node;
      }
      break;

    case 1: // Mark/Unmark as final state
      node.dataset.isFinal = node.dataset.isFinal === "true" ? "false" : "true";
      updateNodeStyle(node);
      break;

    case 2: // Rename node
      const newName = prompt("Enter new name:", node.textContent);
      if (newName) {
        node.textContent = newName;
        const nodeData = nodes.find((n) => n.element === node);
        if (nodeData) nodeData.name = newName;
      }
      break;

      case 3: // Delete node
      graphContainer.removeChild(node);
    
      nodes = nodes.filter((n) => n.element !== node);
    
      edges = edges.filter((edge) => {
        if (edge.from === node || edge.to === node) {
          if (edge.line) svg.removeChild(edge.line);
          if (edge.path) svg.removeChild(edge.path); 
          if (edge.label) svg.removeChild(edge.label);
          return false; 
        }
        return true; 
      });
    
      break;
    

    default:
      break;
  }

  contextMenu.style.display = "none";
  contextMenuTargetNode = null;
}

function updateNodeStyle(node) {
  const isInitial = node.dataset.isInitial === "true";
  const isFinal = node.dataset.isFinal === "true";

  if (isInitial && isFinal) {
    node.style.backgroundColor = "#f39c12"; // Both initial and final
  } else if (isInitial) {
    node.style.backgroundColor = "#2ecc71"; // Initial state
  } else if (isFinal) {
    node.style.backgroundColor = "#e74c3c"; // Final state
  } else {
    node.style.backgroundColor = "#3498db"; // Default state
  }
}

function addAction(name) {
  if ([...actionsList.children].some((item) => item.textContent === name)) return;

  const action = document.createElement("li");
  action.textContent = name;
  action.draggable = true;

  action.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", name);
  });

  action.addEventListener("click", () => {
    addToSequence(name);
  });

  actionsList.appendChild(action);
}

function addToSequence(name) {
  const action = document.createElement("li");
  action.textContent = name;
  action.draggable = true;

  action.addEventListener("dragstart", (e) => {
    action.classList.add("dragging");
    e.dataTransfer.setData("text/plain", name);
  });

  action.addEventListener("dragend", () => {
    action.classList.remove("dragging");
  });

  action.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    action.remove();
  });

  sequenceList.appendChild(action);
}

sequenceList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(sequenceList, e.clientY);
  const dragging = document.querySelector(".dragging");
  if (afterElement == null) {
    sequenceList.appendChild(dragging);
  } else {
    sequenceList.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

verifyButton.addEventListener("click", async () => {
  const sequence = [...sequenceList.children].map((item) => item.textContent);

  if (!initialState) {
    alert("No hay un estado inicial marcado.");
    return;
  }
  if (sequence.length === 0) {
    alert("La secuencia de acciones está vacía.");
    return;
  }

  resetNodeColors(); 
  const visitedNodes = new Set();

  const isValid = await dfs(initialState, sequence, visitedNodes);

  if (isValid) {
    alert("Secuencia válida: Se alcanzó un estado de aceptación.");
  } else {
    alert("Secuencia inválida: No se alcanzó un estado de aceptación.");
  }

  resetNodeColors(); 
});

async function dfs(currentNode, actions, visitedNodes) {
  await colorNode(currentNode, "#f1c40f"); 
  await sleep(500); 

  if (actions.length === 0) {
    if (currentNode.dataset.isFinal === "true") {
      await colorNode(currentNode, "#2ecc71"); 
      return true;
    } else {
      await colorNode(currentNode, "#e74c3c"); 
      return false;
    }
  }

  const currentAction = actions[0]; 
  const remainingActions = actions.slice(1); 

  const neighbors = edges.filter((edge) => edge.from === currentNode && edge.name === currentAction);

  for (const edge of neighbors) {
    const neighbor = edge.to;

    if (currentNode === neighbor) {
      const result = await dfs(currentNode, remainingActions, visitedNodes); 
      if (result) {
        await colorNode(currentNode, "#2ecc71"); 
        return true;
      }
    } else if (!visitedNodes.has(`${neighbor}-${remainingActions.join(",")}`)) {
      visitedNodes.add(`${neighbor}-${remainingActions.join(",")}`);
      const result = await dfs(neighbor, remainingActions, visitedNodes);
      visitedNodes.delete(`${neighbor}-${remainingActions.join(",")}`); 
      if (result) {
        await colorNode(currentNode, "#2ecc71"); 
        return true;
      }
    }
  }

  await colorNode(currentNode, "#e74c3c"); 
  return false;
}

async function colorNode(node, color) {
  node.style.backgroundColor = color;
}

function resetNodeColors() {
  nodes.forEach(({ element }) => updateNodeStyle(element));
}