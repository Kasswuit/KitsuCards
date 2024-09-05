
// Constants Declarations

const MIN_POST_CAT = 2; // Minimum number of boxes after a category box
const MIN_COL_BOX = 5; // Minimum number of boxes in a column
const MAX_COLS = 3; // Maximum number of columns



// Data Fetching and Parsing

/**
 * 
 * @param {string} url - The url to fetch data from
 * @returns - The data fetched from the url
 */
function fetchData(url)  // Fetches data from the url
{
    return fetch(url) // Fetch data from the url
    .then(response => response.json()) // Convert the response to JSON
    .then(data => data) // Return the data
    .catch(error => console.error(error)); // Log any errors
}

/**
 * 
 * @returns - The chapter number from the url
 */
function getChapterNumber() // Gets the chapter number from the url
{
    const urlParams = new URLSearchParams(window.location.search); // Get the url parameters
    return urlParams.get('chapter'); // Return the chapter number
}

// Data Manipulation

/**
 * 
 * @param {*} a - The first item to compare 
 * @param {*} b - The second item to compare
 * @returns - The result of the comparison
 */
function sortByCategory(a,b) // Sorts the data by category
{
    if (a.Category < b.Category) return -1; // If a's category is less than b's category, return -1
    if (a.Category > b.Category) return 1; // If a's category is greater than b's category, return 1
    return 0; // If a's category is equal to b's category, return 0
}

/**
 * 
 * @param {string[]} categoryList - The list of categories 
 * @param {string[]} vocabularyList - The list of vocabulary words
 * @param {string[]} columnData  - Columns that will be returned
 * @param {number} minPostCat - The minimum number of boxes after a category box
 * @param {number} numColumns - The number of columns
 * @param {number} totalCount - The total number of boxes
 */
function distrubuteWords(categoryList, vocabularyList, columnData, minPostCat, numColumns, totalCount) // Distributes the words into columns
{
    let columnIndex = 0; // The current column index
    let boxesInCurrentColumn = 0; // The number of boxes in the current column
    let colIdealSize = Math.ceil(totalCount / numColumns); // The ideal size of the column
    // Distribute categories and words to columns
    for (let catIndex = 0; catIndex < categoryList.length; catIndex++) // For each category
    {
        let category = categoryList[catIndex]; // Get the category
        let wordsInCategory = vocabularyList.filter(word => word.Category === category); // Get the words in the category
        let numWords = wordsInCategory.length; // Get the number of words in the category

        // Check if adding the category and words would exceed colIdealSize
        if (boxesInCurrentColumn + numWords + 1 > colIdealSize && columnIndex < numColumns - 1 && boxesInCurrentColumn >= minPostCat + 1)
        {
            columnIndex++;
            boxesInCurrentColumn = 0;
        }

        // Place category in the current column
        columnData[columnIndex].push({type: "category", data: category});
        boxesInCurrentColumn++;

        // Distribute words in the current category
        for (let wordIndex = 0; wordIndex < numWords; wordIndex++)
        {
            let remainingWords = numWords - wordIndex;

            // Check if the category is about to end and has less than minPostCat boxes remaining
            if (remainingWords < minPostCat && boxesInCurrentColumn + remainingWords + 1 > colIdealSize && columnIndex < numColumns - 1)
            {
                columnIndex++;
                boxesInCurrentColumn = 0;
            }

            columnData[columnIndex].push({type: "word", data: wordsInCategory[wordIndex]});
            boxesInCurrentColumn++;

            // Check if the current column is full or almost full
            if ((boxesInCurrentColumn >= colIdealSize || boxesInCurrentColumn + 1 >= colIdealSize) && columnIndex < numColumns - 1)
            {
                columnIndex++;
                boxesInCurrentColumn = 0;
            }
        }
    }
    console.log(columnData); // Log the columns with the words distributed
    return columnData; // Return the columns with the words distributed
}

/**
 * 
 * @param {*} columnData - The columns to be post-processed
 * @param {*} minPostCat - The minimum number of boxes after a category box
 */
function postProcessingList(columnData, minPostCat) // Post-processing step to handle minPostCat constraint for categories split between columns
{
    // Post-processing step to handle minPostCat constraint for categories split between columns
    for (let columnIndex = 1; columnIndex < columnData.length; columnIndex++)
    {
        let currentColumn = columnData[columnIndex];
        let previousColumn = columnData[columnIndex - 1];
        let tailCategoryBoxCount = 0;
        let tailCategoryIndex = -1;

        // Check if there is a partial category at the top of the current column
        for (let rowIndex = 0; rowIndex < currentColumn.length; rowIndex++)
        {
            let row = currentColumn[rowIndex];
            if (row.type === "category")
            {
                tailCategoryIndex = rowIndex;
                break;
            }
            tailCategoryBoxCount++;
        }

        // If there is a partial category and it has less than minPostCat boxes
        if (tailCategoryIndex > 0 && tailCategoryBoxCount < minPostCat)
        {
            // If there are less than half of minPostCat boxes, delete them and append them to the previous column
            if (tailCategoryBoxCount <= Math.ceil(minPostCat / 2))
            {
                for (let i = 0; i < tailCategoryBoxCount; i++)
                {
                    previousColumn.push(currentColumn.shift());
                }
            }
            // If there are more than or equal to half of minPostCat boxes, remove boxes from the end of the previous column and append them to the top of the current column
            else
            {
                let removedBoxes = [];
                for (let i = 0; i < minPostCat - tailCategoryBoxCount; i++)
                {
                    removedBoxes.unshift(previousColumn.pop());
                }

                // Check if the top of the current column is a category box
                if (currentColumn[0].type !== "category")
                {
                    // Insert removed boxes at the top of the current column
                    columnData[columnIndex] = removedBoxes.concat(currentColumn);
                }
            }
        }
    }
    return columnData;
}

/**
 * The most valuable function in the entire program
 * 
 * @param {string[]} vocabularyList - The list of vocabulary to be sorted
 * @param {constant} minPostCat - The minimum number of boxes after a category box
 * @param {constant} minColBox - The minimum number of boxes in a column
 * @return {string[][]} - returns MAX_COLS number of columns, each containing a list of vocabulary
 */
function generateColumns(vocabularyList, minPostCat, minColBox)
{
    // This is the list of columns that will be returned
    let returnVocabularyList = [];
    // This is the list of vocabulary that will be used to generate the columns
    let columnData = [];
    // Variable Declarations
    let wordCount = vocabularyList.length;
    let categoryList = [...new Set(vocabularyList.map(word => word.Category))];
    let categoryCount = categoryList.length;
    let totalCount = wordCount + categoryCount;

    // Determine the number of columns
    let numColumns;
    for (let i = 1; i <= MAX_COLS; i++) 
    {
        if (totalCount <= minColBox * i) 
        {
            numColumns = i;
            break;
        }
    }
    if (!numColumns) 
    {
        numColumns = MAX_COLS;
    }

    // Create empty columns
    for (let i = 0; i < numColumns; i++)
    {
        columnData.push([]);
    }
    columnData = distrubuteWords(categoryList, vocabularyList, columnData, minPostCat, numColumns, totalCount);
    columnData = postProcessingList(columnData, minPostCat);
    
    console.log(columnData);
    return columnData;
}

// HTML Generation
function createCategoryElement(categoryName)
{
    let categoryElement = document.createElement("div");
    categoryElement.className = "category";
    
    let categoryText = document.createElement("span");
    categoryText.textContent = categoryName;
    categoryElement.appendChild(categoryText);

    let dropdownIcon = document.createElement("i");
    dropdownIcon.className = "fa-solid fa-arrow-left";
    dropdownIcon.style.marginLeft = "8px"; // Space between text and icon
    categoryElement.appendChild(dropdownIcon);

    return categoryElement;
}
function createWordElement(word)
{
    let wordElement = document.createElement("div");
    wordElement.className = "word";
    wordElement.innerText = word;
    return wordElement;
}
function functioncreateColumnElement(columnData)
{
    let columnElement = document.createElement("div");
    columnElement.className = "column";
    for (let i = 0; i < columnData.length; i++)
    {
        let row = columnData[i];
        if (row.type === "category")
        {
            columnElement.appendChild(createCategoryElement(row.data));
        }
        else if (row.type === "word")
        {
            columnElement.appendChild(createWordElement(row.data.Word));
        }
    }
    return columnElement;
}
function createContainerElement()
{
    let containerElement = document.createElement("div");
    containerElement.className = "container";
    return containerElement;
}

// UI Rendering
function renderCategory(category, container) {
    // Create category element
    let categoryElement = document.createElement("div");
    categoryElement.className = "category";
    categoryElement.innerText = category;
    
    // Append category element to container
    container.appendChild(categoryElement);
}

function createCheckboxElement(isCategory = false, categoryName = '') {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.className = isCategory ? "category-checkbox" : "item-checkbox";
    if (!isCategory) {
        checkbox.dataset.category = categoryName;
    }
    return checkbox;
}

// Main Function
function loadContent(chapterNumber, showRomanji)
{
    // Get container element
    var container = document.querySelector(".container");
    // Create Div with row
    var row = document.createElement("div");
    row.className = "row";
    container.appendChild(row);
    colData = [];
    fetchData(`Vocabulary/Chapter${chapterNumber}.json`)
    .then(data => {
        // data here is the PromiseResult array
        
        // If you want to generate columns here with the data,
        // pass 'data' instead of 'colData'
        colData = generateColumns(data, MIN_POST_CAT, MIN_COL_BOX);
        console.log("Data fetched in fetch: ", colData);
        for (let colIndex = 0; colIndex < colData.length; colIndex++) 
    {
        var col = document.createElement("div");
        col.className = "col mx-2";
        row.appendChild(col);

        for (let itemIndex = 0; itemIndex < colData[colIndex].length; itemIndex++) 
        {
            var item = colData[colIndex][itemIndex];

            if (item.type === "category") 
            {
                var details = document.createElement("details");

                var detailsHeader = document.createElement("summary");
                detailsHeader.className = "category-header";

                var categoryName = document.createElement("span");
                categoryName.textContent = item.data;
                detailsHeader.appendChild(categoryName);

                //let dropdownIcon = document.createElement("i");
                //dropdownIcon.className = "drop-down-icon fa-solid fa-caret-down";
                //detailsHeader.appendChild(dropdownIcon);

                let checkbox = createCheckboxElement(true);
                checkbox.addEventListener('change', handleCategoryCheckboxChange);
                detailsHeader.appendChild(checkbox);

                details.appendChild(detailsHeader);
                col.appendChild(details);
            } 
            else if (item.type === "word") 
            {
                var label = document.createElement("label");
                label.className = "word";

                var englishWord = document.createElement("span");
                englishWord.className = "english";
                englishWord.textContent = item.data.English;
                label.appendChild(englishWord);

                if (!showRomanji) {
                    var hiraganaWord = document.createElement("span");
                    hiraganaWord.className = "hiragana";
                    hiraganaWord.textContent = item.data.Hiragana;
                    label.appendChild(hiraganaWord);
                } else {
                    var RomanjiWord = document.createElement("span");
                    RomanjiWord.className = "romanji";
                    RomanjiWord.textContent = item.data.Romanji;
                    label.appendChild(RomanjiWord);
                }
                let checkbox = createCheckboxElement(false, item.data.Category);
                checkbox.addEventListener('change', handleItemCheckboxChange);
                label.appendChild(checkbox);

                col.appendChild(label);
            }
        }
    }
        })
        .catch(error => {
        console.error("Error fetching data: ", error);
    });

}

let selectedWords = [];

function handleCategoryCheckboxChange(event) {
    console.log('Category checkbox changed');
    const col = event.target.closest('.col');
    const isChecked = event.target.checked;
    const allItems = col.querySelectorAll('.item-checkbox[data-category="' + event.target.parentElement.querySelector('span').textContent + '"]');

    allItems.forEach(item => {
        item.checked = isChecked;
    });

    updateSelectedWords();
}

function handleItemCheckboxChange(event) {
    console.log('Item checkbox changed');
    const col = event.target.closest('.col');
    const categoryName = event.target.dataset.category;
    const allItems = col.querySelectorAll(`.item-checkbox[data-category="${categoryName}"]`);
    const allChecked = Array.from(allItems).every(item => item.checked);

    // Find the category checkbox based on the category name
    const categoryCheckbox = Array.from(col.querySelectorAll('.category-checkbox')).find(checkbox => {
        return checkbox.parentElement.querySelector('span').textContent === categoryName;
    });

    if (categoryCheckbox) {
        categoryCheckbox.checked = allChecked;
    }

    updateSelectedWords();
}

function updateSelectedWords() {
    selectedWords = [];
    const allItemCheckboxes = document.querySelectorAll('.item-checkbox:checked');
    allItemCheckboxes.forEach(checkbox => {
        selectedWords.push(checkbox.parentElement.querySelector('.english').textContent);
    });
    console.log(selectedWords);
    if (selectedWords.length <= 0) {
        document.getElementById('continueButton').classList.add('disabled');
    } else {
        document.getElementById('continueButton').classList.remove('disabled');
    }
}

// continue button
document.getElementById('continueButton').addEventListener('click', () => {
    console.log('Continue button clicked');
    const selectedWordsString = selectedWords.join(',');
    console.log(selectedWordsString);
    sessionStorage.setItem('selectedWords', selectedWordsString);
    sessionStorage.setItem('chapter', getChapterNumber());
    window.location.href = 'quiz.html';
});

// Dropdown Functionality
document.getElementById('view-dropdown').addEventListener('change', (event) => {
    const view = event.target.value;
    if (view === 'collapsed') {
        collapseCategories();
    } else {
        expandCategories();
    }
});

function collapseCategories() {
    // Merge categories and items
    let mergedData = mergeCategoriesAndItems();
    // Generate columns with merged data
    let newColData = generateColumns(mergedData, MIN_POST_CAT, MIN_COL_BOX);
    // Update the DOM with new columns
    updateDOM(newColData);
}

function expandCategories() {
    // Generate columns with original data
    let newColData = generateColumns(colData, MIN_POST_CAT, MIN_COL_BOX);
    // Update the DOM with new columns
    updateDOM(newColData);
}







