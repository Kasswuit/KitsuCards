export function generateColumns(vocabularyList, minPostCat, minColBox) {
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

    let remainingColumns = numColumns;

    // Distribute categories and words to columns
    for (let catIndex = 0; catIndex < categories.length; catIndex++) 
    {
        let category = categories[catIndex];
        let wordsInCategory = vocabularyList.filter(word => word.Category === category);
        let numWords = wordsInCategory.length;

        let boxesPerColumn = Math.ceil((numWords + 1) / remainingColumns); // +1 for the category box
        if (boxesPerColumn < minPostCat + 1) 
        { // minPostCat+1 for the category box
            boxesPerColumn = minPostCat + 1;
        }

        let wordIndex = 0;

        while (wordIndex < numWords && remainingColumns > 0) 
        {
            // Place category in the current column
            columnData[numColumns - remainingColumns].push({type: "category", data: category});

            // Distribute words in the current category
            for (let i = 0; i < boxesPerColumn - 1 && wordIndex < numWords; i++) { // -1 for the category box
                // Place word in the current column
                columnData[numColumns - remainingColumns].push({type: "word", data: wordsInCategory[wordIndex]});
                wordIndex++;
            }

            remainingColumns--;
        }
    }

    return columnData;
}