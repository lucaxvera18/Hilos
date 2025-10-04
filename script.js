// Configuración
const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

// Calcular coordenadas de clavos en círculo
function calcularClavos(diametro, n) {
  const r = (canvas.width / 2) - 20;
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

// Generar vista previa básica
function generarVista() {
  const diametro = parseInt(document.getElementById("diametro").value);
  const n = parseInt(document.getElementById("clavos").value);
  const clavos = calcularClavos(diametro, n);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2 - 20, 0, 2*Math.PI);
  ctx.strokeStyle = "#000";
  ctx.stroke();

  ctx.fillStyle = "red";
  clavos.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 2, 0, 2*Math.PI);
    ctx.fill();
  });
}

// Descargar PDF con plantilla en varias hojas A4
function descargarPlantilla() {
  const { jsPDF } = window.jspdf;
  const diametro = parseInt(document.getElementById("diametro").value);
  const n = parseInt(document.getElementById("clavos").value);

  const pdf = new jsPDF({ orientation: "portrait", unit: "cm", format: "a4" });
  const anchoHoja = 21;
  const altoHoja = 29.7;

  const escala = 0.2; // ajustar escala a cm reales
  const radioCm = diametro / 2;
  const paginasX = Math.ceil(diametro / anchoHoja);
  const paginasY = Math.ceil(diametro / altoHoja);

  const centro = { x: (paginasX * anchoHoja)/2, y: (paginasY * altoHoja)/2 };

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
          pdf.text(String(i+1), x - offsetX + 0.1, y - offsetY + 0.1);
        }
      }
      pdf.text(`Guía clavos - Página ${py*paginasX + px + 1}`, 1, altoHoja - 1);
    }
  }

  pdf.save("plantilla_string_art.pdf");
}

// Descargar PDF con conexiones numeradas
function descargarConexiones() {
  const { jsPDF } = window.jspdf;
  const n = parseInt(document.getElementById("clavos").value);
  const pdf = new jsPDF();
  pdf.setFontSize(12);
  pdf.text("Conexiones de hilo (orden recomendado)", 10, 10);

  let y = 20;
  let paso = 137; // paso primo para patrón pseudo-aleatorio
  for (let i = 0; i < n; i++) {
    const a = i;
    const b = (i * paso) % n;
    pdf.text(`${a+1} → ${b+1}`, 10, y);
    y += 7;
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }
  }

  pdf.save("conexiones_string_art.pdf");
}

// Cargar librería jsPDF
(function loadJsPDF() {
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  document.head.appendChild(script);
})();
