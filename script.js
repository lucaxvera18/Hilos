const numClavos = 450;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const connectionsBox = document.getElementById("connections");
let imageData;

// Función: dibujar clavos en círculo
function drawPins(radius = 350) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, radius, 0, Math.PI*2);
  ctx.stroke();

  const pins = [];
  for (let i = 0; i < numClavos; i++) {
    let angle = 2 * Math.PI * i / numClavos;
    let x = canvas.width/2 + radius * Math.cos(angle);
    let y = canvas.height/2 + radius * Math.sin(angle);
    pins.push({x, y});
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI*2);
    ctx.fill();
  }
  return pins;
}

// Cargar imagen
document.getElementById("upload").addEventListener("change", function(e) {
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };
  img.src = URL.createObjectURL(e.target.files[0]);
});

// Algoritmo muy simplificado (demo)
document.getElementById("generate").addEventListener("click", () => {
  const pins = drawPins();
  let seq = [];
  let current = 0;

  for (let step = 0; step < 1000; step++) {
    let next = (current + Math.floor(Math.random() * (numClavos-1))) % numClavos;
    ctx.beginPath();
    ctx.moveTo(pins[current].x, pins[current].y);
    ctx.lineTo(pins[next].x, pins[next].y);
    ctx.stroke();
    seq.push(`${current+1} → ${next+1}`);
    current = next;
  }

  connectionsBox.textContent = seq.join("\n");
});
