// Assume your JSON looks like this:
// [
//     { "English": "College/University", "Romaji": "Daigaku", "Hiragana": "だいがく", "Kanji": "大学", "Category": "Nouns" },
//     ...
// ]

document.addEventListener('DOMContentLoaded', (event) => {
    let currentIndex = 0;
    let words = [];

    // Function to load the words from the JSON file based on stored words from session storage
    function loadWords() {

            // Get words from session storage
            words = JSON.parse(sessionStorage.getItem('words'));
            // Get chapter number from session storage
            const chapterNumber = sessionStorage.getItem('chapterNumber');

            // Display the first word or a message if there are no words
            if (words.length > 0) {
                if (!words[0].learned) {
                    document.getElementById("wordDisplay").textContent = words[currentIndex].English;
                } else {
                    displayNextWord();
                }
            } else {
                document.getElementById("wordDisplay").textContent = "No words to display";
            }
    }

    // Function to display the next word
    function displayNextWord() {
        console.log(words);
        console.log(currentIndex);
        let attempts = 0; // To prevent an infinite loop
        const maxAttempts = words.length; // Maximum attempts equal to the array size

        do {
            currentIndex = (currentIndex + 1) % words.length; // Wrap around using modulo
            attempts++;

            if (attempts > maxAttempts) { // Check for infinite loop risk
                console.log("All words have been learned.");
                break;
            }

            if (currentIndex === 0) {
                displaySelfAssessment(); // Display self-assessment when looping back to start
            }
        } while (words[currentIndex].learned);

        document.getElementById("wordDisplay").textContent = words[currentIndex].English;
    }
    // Function to display self-assessment page
    function displaySelfAssessment() {
        window.location.href = "selfAssessment.html";
    }

    // Load words from the JSON file
    loadWords();

    // Add event listener to the button
    document.getElementById("nextButton").addEventListener("click", displayNextWord);
});
