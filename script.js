const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");
let conexiones = [];
let clavos = [];
let imagenData;

// Calcular clavos en círculo
function calcularClavos(n) {
  const r = canvas.width / 2 - 20;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const coords = [];
  for (let i = 0; i < n; i++) {
    const ang = (2 * Math.PI * i) / n;
    coords.push({
      x: cx + r * Math.cos(ang),
      y: cy + r * Math.sin(ang)
    });
  }
  return coords;
}

// Procesar imagen y generar conexiones
function procesarImagen() {
  const archivo = document.getElementById("imagen").files[0];
  const n = parseInt(document.getElementById("clavos").value);
  const iteraciones = parseInt(document.getElementById("iteraciones").value);

  if (!archivo) {
    alert("Subí una imagen primero.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Poner imagen en canvas auxiliar en escala de grises
      const aux = document.createElement("canvas");
      aux.width = 200;
      aux.height = 200;
      const auxCtx = aux.getContext("2d");
      auxCtx.drawImage(img, 0, 0, aux.width, aux.height);
      const data = auxCtx.getImageData(0, 0, aux.width, aux.height);
      imagenData = data;

      // Calcular clavos
      clavos = calcularClavos(n);

      // Algoritmo greedy simplificado
      conexiones = [];
      let actual = 0;
      for (let k = 0; k < iteraciones; k++) {
        let mejor = null;
        let mejorScore = -Infinity;
        for (let j = 0; j < n; j++) {
          if (j === actual) continue;
          const score = evaluarLinea(clavos[actual], clavos[j], data);
          if (score > mejorScore) {
            mejorScore = score;
            mejor = j;
          }
        }
        if (mejor !== null) {
          conexiones.push([actual, mejor]);
          actual = mejor;
        }
      }

      dibujarPreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(archivo);
}

// Evaluar línea sobre la imagen (simplificado)
function evaluarLinea(a, b, data) {
  let score = 0;
  const pasos = 50;
  for (let i = 0; i <= pasos; i++) {
    const x = Math.floor(((a.x + (b.x - a.x) * i / pasos) / canvas.width) * data.width);
    const y = Math.floor(((a.y + (b.y - a.y) * i / pasos) / canvas.height) * data.height);
    const idx = (y * data.width + x) * 4;
    score += 255 - data.data[idx]; // cuanto más oscuro, mejor
  }
  return score;
}

// Dibujar preview
function dibujarPreview() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 0.3;

  conexiones.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(clavos[a].x, clavos[a].y);
    ctx.lineTo(clavos[b].x, clavos[b].y);
    ctx.stroke();
  });

  // Dibujar clavos
  ctx.fillStyle = "red";
  clavos.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
}

// Descargar plantilla de clavos (PDF en A4)
function descargarPlantilla() {
  const { jsPDF } = window.jspdf;
  const diametro = parseInt(document.getElementById("diametro").value);
  const n = parseInt(document.getElementById("clavos").value);

  const pdf = new jsPDF({ orientation: "portrait", unit: "cm", format: "a4" });
  const anchoHoja = 21;
  const altoHoja = 29.7;

  const radioCm = diametro / 2;
  const paginasX = Math.ceil(diametro / anchoHoja);
  const paginasY = Math.ceil(diametro / altoHoja);

  const centro = { x: (paginasX * anchoHoja) / 2, y: (paginasY * altoHoja) / 2 };

  for (let py = 0; py < paginasY; py++) {
    for (let px = 0; px < paginasX; px++) {
      if (px !== 0 || py !== 0) pdf.addPage();

      const offsetX = px * anchoHoja;
      const offsetY = py * altoHoja;

      for (let i = 0; i < n; i++) {
        const ang = (2 * Math.PI * i) / n;
        const x = centro.x + radioCm * Math.cos(ang);
        const y = centro.y + radioCm * Math.sin(ang);

        if (x >= offsetX && x < offsetX + anchoHoja &&
            y >= offsetY && y < offsetY + altoHoja) {
          pdf.circle(x - offsetX, y - offsetY, 0.05, "F");
          pdf.text(String(i + 1), x - offsetX + 0.1, y - offsetY + 0.1);
        }
      }
      pdf.text(`Guía clavos - Página ${py * paginasX + px + 1}`, 1, altoHoja - 1);
    }
  }

  pdf.save("plantilla_string_art.pdf");
}

// Descargar conexiones en PDF
function descargarConexiones() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.setFontSize(12);
  pdf.text("Conexiones de hilo (orden generado)", 10, 10);

  let y = 20;
  conexiones.forEach(([a, b], idx) => {
    pdf.text(`${idx + 1}: ${a + 1} → ${b + 1}`, 10, y);
    y += 7;
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.save("conexiones_string_art.pdf");
}
