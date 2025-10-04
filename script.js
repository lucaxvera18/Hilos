const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let clavos = [];
let conexiones = [];

// Constantes PDF
const cmToPt = 28.35; // 1 cm = 28.35 puntos PDF
const A4_WIDTH = 595; // puntos (210 mm)
const A4_HEIGHT = 842; // puntos (297 mm)

// Generar clavos en círculo
function generarClavos(n, anchoCm, altoCm) {
  const anchoPts = anchoCm * cmToPt;
  const altoPts = altoCm * cmToPt;
  const cx = anchoPts / 2;
  const cy = altoPts / 2;
  const radio = Math.min(anchoPts, altoPts) / 2 - 20;

  clavos = [];
  for (let i = 0; i < n; i++) {
    const ang = 2 * Math.PI * i / n;
    clavos.push({
      x: cx + radio * Math.cos(ang),
      y: cy + radio * Math.sin(ang)
    });
  }
}

// Generar conexiones (ejemplo simple: opuestos)
function generarConexiones(n) {
  conexiones = [];
  for (let i = 0; i < n; i++) {
    conexiones.push([i, (i + Math.floor(n/2)) % n]);
  }
}

// Dibujar patrón en canvas (solo preview)
function drawPattern() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Clavos
  ctx.fillStyle = "black";
  clavos.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x * (canvas.width / (49 * cmToPt)), 
            c.y * (canvas.height / (40 * cmToPt)), 
            2, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Hilos
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  conexiones.forEach(par => {
    let [i, j] = par;
    ctx.beginPath();
    ctx.moveTo(clavos[i].x * (canvas.width / (49 * cmToPt)), 
               clavos[i].y * (canvas.height / (40 * cmToPt)));
    ctx.lineTo(clavos[j].x * (canvas.width / (49 * cmToPt)), 
               clavos[j].y * (canvas.height / (40 * cmToPt)));
    ctx.stroke();
  });
}

// Botón generar patrón
document.getElementById('generar').onclick = () => {
  const n = parseInt(document.getElementById('numClavos').value);
  const ancho = parseFloat(document.getElementById('ancho').value);
  const alto = parseFloat(document.getElementById('alto').value);

  generarClavos(n, ancho, alto);
  generarConexiones(n);
  drawPattern();

  let txt = "";
  conexiones.forEach(c => {
    txt += (c[0]+1) + " → " + (c[1]+1) + "\n";
  });
  document.getElementById('conexiones').value = txt;
};

// Botón PDF plantilla de clavos
document.getElementById('pdfPlantilla').onclick = () => {
  const ancho = parseFloat(document.getElementById('ancho').value);
  const alto = parseFloat(document.getElementById('alto').value);

  const anchoPts = ancho * cmToPt;
  const altoPts = alto * cmToPt;

  const pagesX = Math.ceil(anchoPts / A4_WIDTH);
  const pagesY = Math.ceil(altoPts / A4_HEIGHT);

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });

  clavos.forEach((c, i) => {
    const pageX = Math.floor(c.x / A4_WIDTH);
    const pageY = Math.floor(c.y / A4_HEIGHT);
    const pageIndex = pageY * pagesX + pageX;

    while (pdf.getNumberOfPages() <= pageIndex) {
      pdf.addPage();
    }
    pdf.setPage(pageIndex + 1);

    const offsetX = c.x - pageX * A4_WIDTH;
    const offsetY = c.y - pageY * A4_HEIGHT;

    pdf.circle(offsetX, offsetY, 1, "F");
    pdf.setFontSize(6);
    pdf.text((i+1).toString(), offsetX+2, offsetY+2);
  });

  pdf.save("plantilla_clavos.pdf");
};

// Botón PDF conexiones
document.getElementById('pdfConexiones').onclick = () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(16);
  pdf.text("Lista de Conexiones - String Art", 20, 20);

  pdf.setFontSize(10);
  let y = 40;
  conexiones.forEach(c => {
    pdf.text((c[0]+1) + " → " + (c[1]+1), 20, y);
    y += 10;
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.save("conexiones.pdf");
};
