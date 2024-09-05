async function fetchData() {
    const response = await fetch("Vocabulary/chapter6.json");
      const jsonData = await response.json();
      return jsonData;
    }
    
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    
    async function quiz(jsonData) {
      while (jsonData.length > 0) {
        shuffle(jsonData);
        for (let i = 0; i < jsonData.length; i++) {
          console.log(jsonData[i].English);
          const answer = await new Promise((resolve) => {
            window.addEventListener('keydown', function keydownHandler(e) {
              if (e.key === 'y' || e.key === 'Y') {
                resolve('Y');
                window.removeEventListener('keydown', keydownHandler);
              } else if (e.key === 'n' || e.key === 'N') {
                resolve('N');
                window.removeEventListener('keydown', keydownHandler);
              } else if (e.key === 't' || e.key === 'T') {
                console.log(jsonData[i].Hiragana);
                resolve('T');
                window.removeEventListener('keydown', keydownHandler);
              }
            });
          });
    
          if (answer === 'Y') {
            jsonData.splice(i, 1);
            i--;
          }
        }
      }
    
      console.log("Quiz completed!");
    }
    
    fetchData().then(jsonData => quiz(jsonData));