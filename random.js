let tags = [
    '#hashtag1', '#hashtag2', '#hashtag3', '#hashtag4', '#hashtag5', '#hashtag6'
    , '#hashtag7', '#hashtag8', '#hashtag9', '#hashtag10'
];


const generateHashtag = async (times = 15) => {
    let generatedValues = [];
    let values = [...tags];
    let text = "";
    for (let i = 0; i < times; i++) {
        let randomIndex = Math.floor(Math.random() * values.length);
        generatedValues.push(values[randomIndex]);
        values.splice(randomIndex, 1);
    }

    generatedValues.forEach(element => {
        text = text + element + " "
    });

    return text;
}

const randomItem = async (items) => {
    let random = items[Math.floor(Math.random() * items.length)];
    var index = items.indexOf(random);
    if (index !== -1) {
        items.splice(index, 1);
    }
    return [random, items];
}


module.exports = { generateHashtag, randomItem };
