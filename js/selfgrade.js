// Create word label function
function createWordLabel(index, words, container)
{
    var label = document.createElement("label");
    label.className = "word";

    var englishWord = document.createElement("span");
    englishWord.className = "english";
    englishWord.textContent = words[index].English;
    label.appendChild(englishWord);

    var hiraganaWord = document.createElement("span");
    hiraganaWord.className = "hiragana";
    hiraganaWord.textContent = words[index].Hiragana;
    label.appendChild(hiraganaWord);

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    label.appendChild(checkbox);

    container.appendChild(label);
}


// Main Function
function loadContent()
{
    // Get container element
    var container = document.querySelector(".container");
    // Get sessionStorage.setItem('words', JSON.stringify(words));
    var words = JSON.parse(sessionStorage.getItem('words'));
    console.log(words);

    for (let i = 0; i < words.length; i++)
    {
        createWordLabel(i, words, container);
    }

}

loadContent();

// Continue Button
document.getElementById('continueButton').addEventListener('click', () => {
    // Under construction
});