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
        // Retrieve selected words from session storage
        console.log(sessionStorage.getItem('selectedWords'));
        const selectedWordsString = sessionStorage.getItem('selectedWords');
        const selectedWords = selectedWordsString ? selectedWordsString.split(',') : [];
        
        // Randomize the selected words
        selectedWords.sort(() => Math.random() - 0.5);


        // Fetch the JSON file
        fetch('Vocabulary/Chapter1.json')
            .then(response => response.json())
            .then(data => {
                // Filter the words based on the selected words
                const filteredWords = data.filter(wordOject => selectedWords.includes(wordOject.English));
                // Store the filtered words
                words = filteredWords;

                // Randomize the words
                words.sort(() => Math.random() - 0.5);

                // Display the first word or a message if there are no words
                if (words.length > 0) {
                    document.getElementById("wordDisplay").textContent = words[currentIndex].English;
                } else {
                    document.getElementById("wordDisplay").textContent = "No words to display";
                }
            })
            .catch(error => {
                console.error('Error loading the JSON file:', error);
            });
    }

    // Function to display the next word
    function displayNextWord() {
        if (words.length > 0) {
            document.getElementById("wordDisplay").textContent = words[currentIndex].English;
            currentIndex = (currentIndex + 1);
            if (currentIndex >= words.length) {
                displaySelfAssessment();
            }
        }
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
