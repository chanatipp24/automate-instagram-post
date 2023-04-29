const express = require('express')
const app = express();
const cron = require('node-cron');
const Bluebird = require('bluebird');
const inquirer = require('inquirer');
const { readFile } = require('fs');
const winston = require('winston');
const { promisify } = require('util');
var moment = require('moment')
var { generateHashtag, randomItem } = require('./random.js')

const readFileAsync = promisify(readFile);
const { IgApiClient, IgCheckpointError } = require('instagram-private-api');
require("dotenv").config();

const fs = require('fs').promises;
let arr_items = [];

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});

const caption = `Caption want to post`;


async function scan(directoryName = './images', results = []) {
    let files = await fs.readdir(directoryName);
    for (let f of files) {
        results.push(f);
    }
    return results;
}


const postToInsta = async (item, hashtags = "") => {
    const ig = new IgApiClient();
    ig.state.generateDevice(process.env.IG_USERNAME);

    Bluebird.try(async () => {
        const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

        const path = './images/' + item;
        const imageBuffer2 = await readFileAsync(path)

        const publish = await ig.publish.photo({
            file: imageBuffer2,
            caption: caption + hashtags,
        });

        console.log("pulish status:" + publish.status);

    }).catch(IgCheckpointError, async () => {
        console.log("Checkpoint 1 : " + ig.state.checkpoint); // Checkpoint info here
        await ig.challenge.auto(true);
        console.log("Checkpoint 2 : " + ig.state.checkpoint); // Challenge info here
        const { code } = await inquirer.prompt([
            {
                type: 'input',
                name: 'code',
                message: 'Enter code',
            },
        ]);
        console.log(await ig.challenge.sendSecurityCode(code));
    }).catch(e =>
        logger.error(e.stack)
    );
}

async function prePost() {
    try {
        if (arr_items.length == 0) {
            arr_items = await scan();
        }
        console.log("Items: " + arr_items.length);

        var hashtags = await generateHashtag();
        var [value, new_item] = await randomItem(arr_items)
        console.log("Random Image: " + value);
        console.log(new_item);
        console.log(hashtags);
        await postToInsta(value, hashtags);

    } catch (error) {
        console.log('case error', error.code);
    }
}

cron.schedule('0 12,15,18,21 * * *', (now) => {
    console.log('Running Cron Job');
    console.log(moment(now).format('MMMM D YYYY, h:mm:ss a'));
    prePost();
});


app.get("/", (req, res, next) => {
    res.json({
        message: "Hello My Automate-Instagram"
    });
})

// Middleware to log errors
app.use(function (err, req, res, next) {
    logger.error(err.stack);
    next(err);
});



const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`)


    process.env.TZ = 'Asia/Bangkok';
    var currentDate = new Date();
    console.log("Time in Bangkok: " + currentDate);

    var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("Timezone: " + timezone);

    var currentDate = new Date();
    console.log("Current date: " + currentDate.getMonth() + "/" + currentDate.getDate() + "/" + currentDate.getFullYear());
    console.log("Current time: " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds());
})

module.exports = app