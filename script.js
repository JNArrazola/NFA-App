const graphContainer = document.getElementById("graph-container");
const actionsList = document.getElementById("actions-list");
const sequenceList = document.getElementById("sequence-list");

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
    node.style.border = "2px solid #2ecc71";
  } else if (selectedNode === node) {
    selectedNode.style.border = "none";
    selectedNode = null;
  } else {
    const edgeName = prompt("Enter edge name:", "Edge");
    if (edgeName) {
      createEdge(selectedNode, node, edgeName);
    }
    selectedNode.style.border = "none";
    selectedNode = null;
  }
}

function createEdge(from, to, name) {
  const fromX = from.offsetLeft + 25;
  const fromY = from.offsetTop + 25;
  const toX = to.offsetLeft + 25;
  const toY = to.offsetTop + 25;

  const angle = Math.atan2(toY - fromY, toX - fromX);
  const adjustedFromX = fromX + 20 * Math.cos(angle);
  const adjustedFromY = fromY + 20 * Math.sin(angle);
  const adjustedToX = toX - 20 * Math.cos(angle);
  const adjustedToY = toY - 20 * Math.sin(angle);

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", adjustedFromX);
  line.setAttribute("y1", adjustedFromY);
  line.setAttribute("x2", adjustedToX);
  line.setAttribute("y2", adjustedToY);
  line.setAttribute("marker-end", "url(#arrow)");

  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", (adjustedFromX + adjustedToX) / 2);
  label.setAttribute("y", (adjustedFromY + adjustedToY) / 2 - 5);
  label.textContent = name;

  svg.appendChild(line);
  svg.appendChild(label);
  edges.push({ from, to, line, label, name });

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
          svg.removeChild(edge.line);
          svg.removeChild(edge.label);
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
