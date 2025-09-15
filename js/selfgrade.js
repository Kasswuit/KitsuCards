// Create word label function
function createWordLabel(index, words, container, learned)
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

    if (!learned)
    {
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "form-check-input";
        label.appendChild(checkbox);

        container.appendChild(label);
    } else {
        container.appendChild(label);
    }
}


// Main Function
function loadContent()
{
    // Get container element
    var container = document.querySelector(".container");
    
    console.log(words);

    for (let i = 0; i < words.length; i++)
    {
        createWordLabel(i, words, container, words.learned);
    }

}
var words = JSON.parse(sessionStorage.getItem('words'));
loadContent();

// Continue Button
document.getElementById('continueButton').addEventListener('click', () => {
    // Under construction
    console.log("Continue button clicked");
    // Get all checkboxes
    var checkboxes = document.querySelectorAll("input[type='checkbox']");
    // Update checkedWords
    for (let i = 0; i < checkboxes.length; i++)
    {
        if (checkboxes[i].checked)
        {
            words[i].repititions -= 1;
            if (words[i].repititions === 0)
            {
                words[i].learned = true;
            }
            console.log("checked" + words[i].English);
        } else {
            words[i].repititions == 5;
            console.log("unchecked" + words[i].English);
        }
    }

    // Save words
    sessionStorage.setItem('words', JSON.stringify(words));
    // Redirect to quiz page
    window.location.href = "quiz.html";
});