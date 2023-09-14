let resultElement = document.querySelector('.result');
let mainContainer = document.querySelector('.main-container');
let rowId = 1;
let word = '';
let timer;
let gameEnded = false; // Variable para rastrear si el juego ha terminado

// CONEXIÓN A LA API
const API = 'https://random-word-api.herokuapp.com/word?lang=es&length=5';

fetch(API)
  .then((response) => response.json())
  .finally(() => {
    let loadingElement = document.querySelector('.loading')
    loadingElement.style.display = 'none';
  })
  .then((response) => {
    word = response[0].toUpperCase();
    console.log(word);
    startGame(); // Llama a la función para iniciar el juego después de obtener la palabra.
  });

function startGame() {
  let wordArray = word.toUpperCase().split('');
  let actualRow = document.getElementById('1'); // Cambia el selector para obtener la primera fila

  drawSquares(actualRow);
  listenInput(actualRow);
  addFocus(actualRow);

  // Agregar temporizador de 5 minutos
  let startTime = Date.now();
  let endTime = startTime + 5 * 60 * 1000; // 5 minutos en milisegundos
  updateTimer();

  function updateTimer() {
    if (gameEnded) {
      return; // No actualices el temporizador si el juego ha terminado
    }

    let currentTime = Date.now();
    let remainingTime = Math.max(0, endTime - currentTime);
    let minutes = Math.floor(remainingTime / 60000);
    let seconds = Math.floor((remainingTime % 60000) / 1000);
    resultElement.innerHTML = `
      <p class='time'>Tiempo restante: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}</p>`;

    if (remainingTime > 0) {
      timer = setTimeout(updateTimer, 1000);
    } else {
      showResult(`Se acabó el tiempo. La respuesta correcta era '${word.toUpperCase()}'`);
    }
  }

  function listenInput(actualRow) {
    if (gameEnded) {
      return; // No escuches la entrada si el juego ha terminado
    }

    let squares = actualRow.querySelectorAll('.square');
    squares = [...squares];
    let userInput = [];

    squares.forEach((element) => {
      element.addEventListener('input', (event) => {
        if (event.inputType !== 'deleteContentBackward') {
          // Capturar letras
          userInput.push(event.target.value.toUpperCase());
          if (event.target.nextElementSibling) {
            event.target.nextElementSibling.focus();
          } else {
            // Borrado y cambiado de letras
            let squaresFilled = document.querySelectorAll('.square');
            squaresFilled = [...squaresFilled];
            let lastFiveSquaresFilled = squaresFilled.slice(-word.length); // Cambia a las últimas letras llenas
            let finalUserInput = [];
            lastFiveSquaresFilled.forEach((element) => {
              finalUserInput.push(element.value.toUpperCase());
            });
            // Si las letras correctas no están en la posición correcta
            let existIndexArray = existLetter(wordArray, finalUserInput);
            existIndexArray.forEach((element) => {
              squares[element].classList.add('gold');
            });
            // Comparar letras para cambiar colores
            let rightIndex = compareArrays(wordArray, finalUserInput);
            rightIndex.forEach((element) => {
              squares[element].classList.add('green');
            });
            // Si las letras son correctas
            if (rightIndex.length === wordArray.length) {
              clearTimeout(timer); // Detener el temporizador
              gameEnded = true; // El juego ha terminado
              showResult('FELICITACIONES GANASTE!!🎊');
              return;
            }
            // Generar una nueva línea
            let newRow = createRow();
            if (!newRow) {
              return;
            }
            drawSquares(newRow);
            listenInput(newRow);
            addFocus(newRow);
          }
        } else {
          userInput.pop();
        }
      });
    });
  }

  function compareArrays(array1, array2) {
    let equalsIndex = [];
    array1.forEach((element, index) => {
      if (element === array2[index]) {
        equalsIndex.push(index);
      }
    });
    return equalsIndex;
  }

  function existLetter(array1, array2) {
    let existIndexArray = [];
    array2.forEach((element, index) => {
      if (array1.includes(element)) {
        existIndexArray.push(index);
      }
    });
    return existIndexArray;
  }

  function createRow() {
    rowId++;
    if (rowId <= 5) {
      let newRow = document.createElement('div');
      newRow.classList.add('row');
      newRow.setAttribute('id', rowId);
      mainContainer.appendChild(newRow);
      return newRow;
    } else {
      clearTimeout(timer); // Detener el temporizador
      gameEnded = true; // El juego ha terminado
      showResult(`Inténtalo de nuevo, la respuesta correcta era '${word.toUpperCase()}'`);
    }
  }

  function drawSquares(actualRow) {
    wordArray.forEach((item, index) => {
      if (index === 0) {
        actualRow.innerHTML += `<input type='text' maxlength='1' class='square focus'>`;
      } else {
        actualRow.innerHTML += `<input type='text' maxlength='1' class='square'>`;
      }
    });
  }

  function addFocus(actualRow) {
    let focusElement = actualRow.querySelector('.focus');
    focusElement.focus();
  }

  function showResult(textMsg) {
    resultElement.innerHTML = `
        <p>${textMsg}</p>
        <button class='button'>Reiniciar</button>`;
    let resetBtn = document.querySelector('.button');
    resetBtn.addEventListener('click', () => {
      location.reload();
    });

    // Habilitar el reinicio al presionar Enter
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        location.reload();
      }
    });
  }
}
