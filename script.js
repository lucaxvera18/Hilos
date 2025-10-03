const numClavos = 450;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const connectionsBox = document.getElementById("connections");
let imgData = null;

// Dibujar clavos en círculo
function drawPins(radius = 350) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const pins = [];
  for (let i = 0; i < numClavos; i++) {
    let angle = 2 * Math.PI * i / numClavos;
    let x = canvas.width / 2 + radius * Math.cos(angle);
    let y = canvas.height / 2 + radius * Math.sin(angle);
    pins.push({x, y});
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  return pins;
}

// Cargar imagen y pasar a escala de grises
document.getElementById("upload").addEventListener("change", function(e) {
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Escala de grises invertida (zonas oscuras = mayor densidad de hilos)
    for (let i = 0; i < image.data.length; i += 4) {
      let avg = (image.data[i] + image.data[i+1] + image.data[i+2]) / 3;
      let inverted = 255 - avg;
      image.data[i] = image.data[i+1] = image.data[i+2] = inverted;
    }
    ctx.putImageData(image, 0, 0);
    imgData = image;
  };
  img.src = URL.createObjectURL(e.target.files[0]);
});

// Función para evaluar oscuridad de una línea
function lineScore(x0, y0, x1, y1, data, width) {
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;
  let score = 0, count = 0;

  while (true) {
    if (x0 >= 0 && y0 >= 0 && x0 < width && y0 < width) {
      let idx = (y0 * width + x0) * 4;
      score += data[idx];
      count++;
    }
    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return score / (count || 1);
}

// Generar patrón de conexiones
document.getElementById("generate").addEventListener("click", () => {
  if (!imgData) {
    alert("Primero subí una foto.");
    return;
  }

  const pins = drawPins();
  let seq = [];
  let current = 0;

  ctx.lineWidth = 0.3;
  ctx.strokeStyle = "black";

  for (let step = 0; step < 2000; step++) {
    let bestScore = -1;
    let bestPin = null;

    for (let j = 0; j < numClavos; j++) {
      if (j === current) continue;
      let score = lineScore(
        Math.round(pins[current].x), Math.round(pins[current].y),
        Math.round(pins[j].x), Math.round(pins[j].y),
        imgData.data, canvas.width
      );
      if (score > bestScore) {
        bestScore = score;
        bestPin = j;
      }
    }

    ctx.beginPath();
    ctx.moveTo(pins[current].x, pins[current].y);
    ctx.lineTo(pins[bestPin].x, pins[bestPin].y);
    ctx.stroke();

    seq.push(`${current+1} → ${bestPin+1}`);
    current = bestPin;
  }

  connectionsBox.textContent = seq.join("\n");
});
