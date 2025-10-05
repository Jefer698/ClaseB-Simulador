let preguntas = [];
let indiceActual = 0;

fetch("preguntas_con_respuestas.json")
  .then(res => res.json())
  .then(data => {
    preguntas = data;
    renderPregunta(indiceActual);
  });

function renderPregunta(index) {
  const p = preguntas[index];
  const contenedor = document.getElementById("pregunta-container");

  const letras = ["a)", "b)", "c)", "d)", "e)", "f)", "g)", "h)", "i)", "j)"];
  const cantidad = p.respuestaCorrecta.length;

  let instruccion = "Marque la respuesta correcta:";
  if (cantidad === 2) instruccion = "Marque 2 respuestas correctas:";
  else if (cantidad > 2) instruccion = "Marque la(s) respuesta(s) correcta(s):";

  contenedor.innerHTML = `
    <h2>${index + 1}) ${p.texto}</h2>
    <p class="instruccion">${instruccion}</p>
    ${p.imagen ? `<img src="${p.imagen}" alt="Imagen de la pregunta" class="imagen-pregunta">` : ""}
    <form id="formulario">
      ${p.opciones.map((op, i) => `
        <label>
          ${letras[i]} <input type="${cantidad > 1 ? 'checkbox' : 'radio'}" name="respuesta" value="${i}">
          ${op}
        </label><br>
      `).join("")}
    </form>
    <button id="btnResponder" onclick="evaluar(${index})" disabled>Responder</button>
    <div id="feedback"></div>
  `;

  document.querySelectorAll("input[name='respuesta']").forEach(input => {
    input.addEventListener("change", () => {
      const seleccionados = document.querySelectorAll("input[name='respuesta']:checked");
      document.getElementById("btnResponder").disabled = seleccionados.length === 0;
    });
  });
}

function evaluar(index) {
  const seleccionados = Array.from(document.querySelectorAll("input[name='respuesta']:checked"))
    .map(el => parseInt(el.value));
  const correcta = preguntas[index].respuestaCorrecta.sort().join(",");
  const usuario = seleccionados.sort().join(",");
  const esCorrecta = correcta === usuario;

  const feedback = document.getElementById("feedback");
  feedback.innerHTML = esCorrecta
    ? `<span class="correcto">✅ Correcto</span>`
    : `<span class="incorrecto">❌ Incorrecto</span>`;
}

function siguientePregunta() {
  if (indiceActual < preguntas.length - 1) {
    indiceActual++;
    renderPregunta(indiceActual);
  }
}

function anteriorPregunta() {
  if (indiceActual > 0) {
    indiceActual--;
    renderPregunta(indiceActual);
  }
}

function cambiarTema() {
  const actual = document.body.dataset.tema;
  const nuevo = actual === "claro" ? "oscuro" : "claro";
  document.body.dataset.tema = nuevo;
}
