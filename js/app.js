let preguntas = [];
let indiceActual = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let modo = "";
let tiempoRestante = 2700;
let temporizadorInterval;
let usuarioActual = "";

fetch("preguntas_con_respuestas.json")
  .then((res) => res.json())
  .then((data) => {
    preguntas = data;
  });

function iniciarSesion() {
  const nombre = document.getElementById("usuario").value.trim();
  if (!nombre) return alert("Ingresa un nombre de usuario");
  usuarioActual = nombre;
  localStorage.setItem("usuario", nombre);
  document.getElementById("login-container").style.display = "none";
  document.getElementById("modo-container").style.display = "block";
}

function cerrarSesion() {
  localStorage.removeItem("usuario");
  location.reload();
}

function iniciarExamen() {
  modo = "examen";
  indiceActual = 0;
  preguntas = preguntas.sort(() => Math.random() - 0.5);
  document.getElementById("modo-container").style.display = "none";
  document.getElementById("pregunta-container").style.display = "block";
  document.getElementById("btnFinalizarExamen").style.display = "inline-block";
  iniciarTemporizador();
  renderPregunta(indiceActual);
}

function iniciarTemporizador() {
  temporizadorInterval = setInterval(() => {
    tiempoRestante--;
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    document.getElementById("temporizador").innerText = `⏱ ${minutos}:${
      segundos < 10 ? "0" : ""
    }${segundos}`;
    if (tiempoRestante <= 0) {
      clearInterval(temporizadorInterval);
      mostrarResultadosFinales();
    }
  }, 1000);
}

function renderPregunta(index) {
  const p = preguntas[index];
  const contenedor = document.getElementById("pregunta-container");
  contenedor.innerHTML = "";

  const letras = ["a)", "b)", "c)", "d)", "e)", "f)", "g)", "h)", "i)", "j)"];
  const cantidad = p.respuestaCorrecta.length;

  let instruccion = "Marque la respuesta correcta:";
  if (cantidad === 2) instruccion = "Marque 2 respuestas correctas:";
  else if (cantidad > 2) instruccion = "Marque la(s) respuesta(s) correcta(s):";

  const preguntaHTML = `
    <div style="text-align:center">
      <h2>${p.texto}</h2>
      <p class="instruccion">${instruccion}</p>
      ${
        p.imagen
          ? `<img src="${p.imagen}" alt="Imagen de la pregunta" class="imagen-pregunta">`
          : ""
      }
    </div>
    <form id="formulario" style="margin-top:1em">
      ${p.opciones
        .map(
          (op, i) => `
        <label style="display:block; margin: 0.5em 0">
          ${letras[i]} <input type="${
            cantidad > 1 ? "checkbox" : "radio"
          }" name="respuesta" value="${i}"> ${op}
        </label>
      `
        )
        .join("")}
    </form>
    <button id="btnResponder" onclick="evaluar(${index})" disabled style="margin-top:1em">Responder</button>
    <div id="feedback"></div>
    <div class="navegacion">
      <button onclick="anteriorPregunta()">Anterior</button>
      <button onclick="siguientePregunta()">Siguiente</button>
    </div>
    <div style="text-align:center; margin-top:1em">
      <button onclick="volverAlModo()">Volver al menú</button>
    </div>
  `;

  contenedor.innerHTML = preguntaHTML;

  document.querySelectorAll("input[name='respuesta']").forEach((input) => {
    input.addEventListener("change", () => {
      const seleccionados = document.querySelectorAll(
        "input[name='respuesta']:checked"
      );
      document.getElementById("btnResponder").disabled =
        seleccionados.length === 0;
    });
  });
}

function evaluar(index) {
  const seleccionados = Array.from(
    document.querySelectorAll("input[name='respuesta']:checked")
  ).map((el) => parseInt(el.value));
  const correcta = preguntas[index].respuestaCorrecta.sort().join(",");
  const usuario = seleccionados.sort().join(",");
  const esCorrecta = correcta === usuario;

  const feedback = document.getElementById("feedback");
  feedback.innerHTML = esCorrecta
    ? `<span class="correcto">✅ Correcto</span>`
    : `<span class="incorrecto">❌ Incorrecto</span>`;

  if (esCorrecta) respuestasCorrectas++;
  else respuestasIncorrectas++;
}

function siguientePregunta() {
  if (indiceActual < preguntas.length - 1) {
    indiceActual++;
    renderPregunta(indiceActual);
  } else {
    mostrarResultadosFinales();
  }
}

function anteriorPregunta() {
  if (indiceActual > 0) {
    indiceActual--;
    renderPregunta(indiceActual);
  }
}

function mostrarResultadosFinales() {
  clearInterval(temporizadorInterval);
  document.getElementById("pregunta-container").style.display = "none";
  document.getElementById("btnFinalizarExamen").style.display = "none";
  const resultado = document.getElementById("resultado-container");
  resultado.innerHTML = `
    <h2>Resultado Final</h2>
    <p>✅ Correctas: ${respuestasCorrectas}</p>
    <p>❌ Incorrectas: ${respuestasIncorrectas}</p>
    <button onclick="reiniciar()">Volver a empezar</button>
  `;
  resultado.style.display = "block";
  guardarEstadisticaPorFecha();
}

function verEstadisticas() {
  document.getElementById("modo-container").style.display = "none";
  const stats = JSON.parse(
    localStorage.getItem("estadisticasPorFecha") || "{}"
  );
  const contenedor = document.getElementById("usuariosBotones");
  contenedor.innerHTML = "";
  if (Object.keys(stats).length === 0) {
    contenedor.innerHTML = "<p>No hay usuarios registrados aún.</p>";
  } else {
    Object.keys(stats).forEach((usuario) => {
      const btn = document.createElement("button");
      btn.textContent = usuario;
      btn.onclick = function () {
        mostrarGraficoPorFecha(usuario);
      };
      contenedor.appendChild(btn);
    });
  }
  document.getElementById("graficoUsuario").innerHTML = "";
  document.getElementById("estadisticas-container").style.display = "block";
}

function guardarEstadisticaPorFecha() {
  const hoy = new Date().toISOString().slice(0, 10);
  const stats = JSON.parse(
    localStorage.getItem("estadisticasPorFecha") || "{}"
  );
  if (!stats[usuarioActual]) stats[usuarioActual] = {};
  if (!stats[usuarioActual][hoy]) stats[usuarioActual][hoy] = [];
  stats[usuarioActual][hoy].push({
    correctas: respuestasCorrectas,
    incorrectas: respuestasIncorrectas,
  });
  localStorage.setItem("estadisticasPorFecha", JSON.stringify(stats));
}

function mostrarGraficoPorFecha(usuario) {
  const datos = JSON.parse(localStorage.getItem("estadisticasPorFecha"))[usuario];
  let html = `<h3>${usuario}</h3>`;
  Object.keys(datos).forEach(fecha => {
    html += `<strong>${fecha}</strong><br>`;
    datos[fecha].forEach((intento, i) => {
      const total = intento.correctas + intento.incorrectas;
      html += `Intento ${i + 1}: ${intento.correctas} correctas, ${intento.incorrectas} incorrectas de ${total} preguntas respondidas de un total de ${preguntas.length} preguntas<br>`;
    });
    html += `<br>`;
  });
  document.getElementById("graficoUsuario").innerHTML = html;
}


function reiniciar() {
  respuestasCorrectas = 0;
  respuestasIncorrectas = 0;
  tiempoRestante = 2700;
  document.getElementById("resultado-container").style.display = "none";
  document.getElementById("modo-container").style.display = "block";
}

function cambiarTema() {
  const actual = document.body.dataset.tema;
  const nuevo = actual === "claro" ? "oscuro" : "claro";
  document.body.dataset.tema = nuevo;
}

function iniciarPractica() {
  modo = "practica";
  indiceActual = 0;
  document.getElementById("modo-container").style.display = "none";
  document.getElementById("pregunta-container").style.display = "block";
  document.getElementById("btnFinalizarExamen").style.display = "none";
  renderPregunta(indiceActual);
}

function volverAlModo() {
  document.getElementById("estadisticas-container").style.display = "none";
  document.getElementById("pregunta-container").style.display = "none";
  document.getElementById("modo-container").style.display = "block";
}
