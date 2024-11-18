const graphContainer = document.getElementById("graph-container");
const actionsList = document.getElementById("actions-list");
const sequenceList = document.getElementById("sequence-list");

let nodes = [];
let edges = [];
let selectedNode = null;

const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.innerHTML = `
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z"></path>
    </marker>
  </defs>
`;
graphContainer.appendChild(svg);

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

function createNode(x, y, name) {
  const node = document.createElement("div");
  node.classList.add("node");
  node.style.left = `${x - 25}px`;
  node.style.top = `${y - 25}px`;
  node.textContent = name;

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

sequenceList.addEventListener("drop", (e) => {
  e.preventDefault();
});
