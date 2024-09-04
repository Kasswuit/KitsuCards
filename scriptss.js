// URL of JSON file
var url = "Vocabulary/Chapter1.json";
var MAX_COLS = 3;
// Function to fetch JSON data from URL
function fetchData(url) {
    return fetch(url)
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error(error));
}
// Function to sort data by category
function sortByCategory(a,b) {
    if (a.Category < b.Category) return -1; 
    if (a.Category > b.Category) return 1; 
    return 0; 
}
function getCatPerCol(maxCols, numCategories) 
{
    let catPerCol = new Array(maxCols).fill(0);
    let numFullCols = numCategories % maxCols;
    let numCatsPerFullCol = Math.floor(numCategories / maxCols);
    for (let i = 0; i < numFullCols; i++) 
    {
      catPerCol[i] = numCatsPerFullCol + 1;
    }
    for (let i = numFullCols; i < maxCols; i++) 
    {
      catPerCol[i] = numCatsPerFullCol;
    }
    return catPerCol;
  }
// Function to create and display word list
function createWordListdep(colData) {
    // Get container element
    var container = document.querySelector(".container");
    // Create Div with row
    var row = document.createElement("div");
    row.className = "row";
    container.appendChild(row);

    for (let colIndex = 0; colIndex < colData.length; colIndex++) {
        var col = document.createElement("div");
        col.className = "col mx-2";
        row.appendChild(col);

        for (let itemIndex = 0; itemIndex < colData[colIndex].length; itemIndex++) {
            var item = colData[colIndex][itemIndex];

            if (item.type === "category") {
                var details = document.createElement("details");
                details.className = "mx-2";

                var detailsHeader = document.createElement("summary");
                detailsHeader.className = "category-header";

                var categoryName = document.createElement("span");
                categoryName.textContent = item.data;
                detailsHeader.appendChild(categoryName);

                details.appendChild(detailsHeader);
                col.appendChild(details);
            } else if (item.type === "word") {
                var label = document.createElement("label");
                label.className = "word";

                var englishWord = document.createElement("span");
                englishWord.className = "english";
                englishWord.textContent = item.data.English;
                label.appendChild(englishWord);

                var hiraganaWord = document.createElement("span");
                hiraganaWord.className = "hiragana";
                hiraganaWord.textContent = item.data.Hiragana;
                label.appendChild(hiraganaWord);

                col.appendChild(label);
            }
        }
    }
}
function generateColumns(vocabularyList, minPostCat, minColBox)
{
    let totalWords = vocabularyList.length;

    // Extract unique categories
    let categories = [...new Set(vocabularyList.map(word => word.Category))];
    let totalCategories = categories.length;
    let totalBoxes = totalWords + totalCategories;

    let columnData = [];

    // Determine the number of columns
    let numColumns;
    if (totalBoxes <= minColBox)
    {
        numColumns = 1;
    }
    else if (totalBoxes <= minColBox * 2)
    {
        numColumns = 2;
    }
    else
    {
        numColumns = 3;
    }

    // Create empty columns
    for (let i = 0; i < numColumns; i++)
    {
        columnData.push([]);
    }

    let columnIndex = 0;
    let boxesInCurrentColumn = 0;
    let colIdealSize = Math.ceil(totalBoxes / numColumns);

    // Distribute categories and words to columns
    for (let catIndex = 0; catIndex < categories.length; catIndex++)
    {
        let category = categories[catIndex];
        let wordsInCategory = vocabularyList.filter(word => word.Category === category);
        let numWords = wordsInCategory.length;

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
    console.log(columnData);
    return columnData;
}
function createWordList(data)
{
    //data.sort(sortByCategory);
    console.log(data);
    colData = generateColumns(data,2,5);
    createWordListdep(colData);
}
fetchData(url).then(data => createWordList(data));