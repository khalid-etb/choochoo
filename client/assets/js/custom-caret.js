const input = document.getElementById("input-box");
const caret = document.getElementById("custom-caret");
const ruler = document.getElementById("text-ruler");

function updateCaret() {
  ruler.textContent = input.value;

  const textWidth = ruler.getBoundingClientRect().width + 5;
  caret.style.left = `${textWidth}px`;
}

input.addEventListener('input', updateCaret);
input.addEventListener('keyup', updateCaret);
input.addEventListener('click', updateCaret);

updateCaret();