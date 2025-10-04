const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let clavos = [];
let conexiones = [];

// Distribuir clavos en círculo
function generarClavos(n) {
  const radio = Math.min(canvas.width, canvas.height) / 2 - 20;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  clavos = [];
  for (let i = 0; i < n; i++) {
    const ang = 2 * Math.PI * i / n;
    clavos.push({
      x: cx + radio * Math.cos(ang),
      y: cy + radio * Math.sin(ang)
    });
  }
}

// Simular conexiones (ejemplo: cada clavo con el opuesto)
function generarConexiones(n) {
  conexiones = [];
  for (let i = 0; i < n; i++) {
    conexiones.push([i, (i + Math.floor(n/2)) % n]);
  }
}

// Dibujar clavos + hilos
function drawPattern() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Clavos
  ctx.fillStyle = "black";
  clavos.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 2, 0, 2*Math.PI);
    ctx.fill();
  });

  // Hilos
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  conexiones.forEach(par => {
    let [i, j] = par;
    ctx.beginPath();
    ctx.moveTo(clavos[i].x, clavos[i].y);
    ctx.lineTo(clavos[j].x, clavos[j].y);
    ctx.stroke();
  });
}

// Botón generar
document.getElementById('generar').onclick = () => {
  const n = parseInt(document.getElementById('numClavos').value);
  generarClavos(n);
  generarConexiones(n);
  drawPattern();

  // Mostrar conexiones
  let txt = "";
  conexiones.forEach(c => {
    txt += (c[0]+1) + " → " + (c[1]+1) + "\n";
  });
  document.getElementById('conexiones').value = txt;
};

// Botón PDF
document.getElementById('pdfBtn').onclick = () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(16);
  pdf.text("Plantilla de String Art", 20, 20);

  // Dibujar círculo con clavos numerados
  clavos.forEach((c, i) => {
    const x = 100 + 80 * Math.cos(2*Math.PI*i/clavos.length);
    const y = 150 + 80 * Math.sin(2*Math.PI*i/clavos.length);
    pdf.circle(x, y, 0.8, "F");
    pdf.setFontSize(6);
    pdf.text((i+1).toString(), x+1, y+1);
  });

  // Lista de conexiones
  pdf.setFontSize(10);
  let y = 250;
  conexiones.forEach((c) => {
    pdf.text((c[0]+1) + " → " + (c[1]+1), 20, y);
    y += 5;
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.save("string_art.pdf");
};
