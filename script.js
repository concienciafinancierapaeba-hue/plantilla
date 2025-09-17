const FRASES = [
  "¡Hoy es un buen día para dar un paso hacia tu meta de ahorro!",
  "Ahorra en Soles, disfruta en grande.",
  "Ahorra hoy, disfruta mañana.",
  "Pequeños ahorros, grandes logros.",
  "El éxito financiero empieza con un pequeño hábito."
];

let montos = [];
let marcados = [];

function obtenerFraseAleatoria() {
  return FRASES[Math.floor(Math.random() * FRASES.length)];
}

function generarCasillas() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  const total = parseFloat(document.getElementById('goal').value);
  const metaTexto = document.getElementById('meta').value;
  let numCasillas = parseInt(document.getElementById('numCasillas').value);

  if (isNaN(numCasillas) || numCasillas < 1 || numCasillas > 100) {
    alert('Por favor, ingresa un número de casillas entre 1 y 100.');
    return;
  }
  if (isNaN(total) || total < 1) {
    alert('Por favor, ingresa un monto total mayor o igual a 1.');
    return;
  }

  const seleccionados = Array.from(document.querySelectorAll('.monto:checked')).map(cb => Number(cb.value));
  if (seleccionados.length === 0) {
    alert('Selecciona al menos un monto para usar.');
    return;
  }

  // Validar monto máximo posible
  const maxPosible = numCasillas * Math.max(...seleccionados);
  if (total > maxPosible) {
    alert(`Monto total máximo posible con estos valores y casillas es S/ ${maxPosible}. Por favor ajusta monto, casillas o montos.`);
    return;
  }

  document.getElementById('metaTexto').innerText = 'Meta: ' + (metaTexto || '(sin especificar)');
  document.getElementById('montoTotal').innerText = 'Monto total a ahorrar: S/ ' + total;

  const columnas = 10;
  const filas = Math.ceil(numCasillas / columnas);

  montos = distribuirMontos(total, numCasillas, seleccionados);
  marcados = Array(numCasillas).fill(false); // Ninguna marcada inicialmente

  for (let r = 0; r < filas; r++) {
    const row = document.createElement('tr');
    for (let c = 0; c < columnas; c++) {
      const index = r * columnas + c;
      const td = document.createElement('td');
      td.className = 'cell';
      if (index < numCasillas) {
        td.innerText = montos[index];
        td.onclick = () => toggle(index, td);
      } else {
        td.innerText = '';
      }
      row.appendChild(td);
    }
    grid.appendChild(row);
  }

  // Variable CSS para alto de celdas
  document.documentElement.style.setProperty('--filas', filas);

  actualizarResumen();

  const fraseImp = document.getElementById('fraseImpresion');
  fraseImp.innerText = obtenerFraseAleatoria();
  fraseImp.style.display = 'none'; // solo visible en impresión
}

function distribuirMontos(total, cantidad, valoresPosibles) {
  let montos = [];
  let suma = 0;
  while (montos.length < cantidad) {
    let restante = total - suma;
    let minValor = Math.min(...valoresPosibles);
    let posibles = valoresPosibles.filter(
      v => v <= restante && (restante - v) >= (cantidad - montos.length - 1) * minValor
    );

    if (montos.length === cantidad - 1) {
      if (valoresPosibles.includes(restante)) {
        montos.push(restante);
        suma += restante;
        break;
      }
    }

    if (posibles.length === 0) break;

    let val = posibles[Math.floor(Math.random() * posibles.length)];
    montos.push(val);
    suma += val;
  }
  if (montos.length !== cantidad || suma !== total) {
    return distribuirMontos(total, cantidad, valoresPosibles);
  }
  return montos.sort(() => Math.random() - 0.5);
}

function toggle(index, td) {
  marcados[index] = !marcados[index];
  td.classList.toggle('saved');
  actualizarResumen();
}

function actualizarResumen() {
  const total = montos.reduce((acc, val, i) => acc + (marcados[i] ? val : 0), 0);
  const objetivo = parseFloat(document.getElementById('goal').value);
  document.getElementById('ahorrado').innerText = 'S/ ' + total;
  document.getElementById('progreso').innerText = Math.round(100 * total / objetivo) + '%';
}

window.onbeforeprint = () => document.getElementById('fraseImpresion').style.display = 'block';

window.onafterprint = () => document.getElementById('fraseImpresion').style.display = 'none';
