const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const Discord = require('discord.js');


const fs = require('fs');
const config = require("./Config.json");

var TimeStamp = (new Date().toISOString().replace(/.+T/, '[').replace(/\..+/, ']'));

const bot = new Discord.Client({
  fetchAllMembers: true
});


app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/news', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});


require('./Util/EventLoader')(bot, app);

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

fs.readdir('./CommandDir/', (err, folders) => {
  if (err) throw err;
  for (const folder of folders) {
    fs.readdir(`./CommandDir/${folder}/`, (err, files) => {
      if (err) console.error(err);
      files.forEach(f => {
        let props = require(`./CommandDir/${folder}/${f}`);
        bot.commands.set(props.conf.name, props);
        props.conf.aliases.forEach(alias => {
          bot.aliases.set(alias, props.conf.name);
        });
      });
      console.log(`${TimeStamp} Loaded a total of ${files.length} commands From ${folder}.`);
    });
  }
});

bot.elevation = (message) => {
  let permlvl = 1
  if (message.author.id === config.Dev) permlvl = 5;
  return permlvl;
};

process.on("unhandledRejection", err => {
  console.error("Uncaught Promise Error: \n" + err.stack);
});

bot.login(config.BotToken);

app.listen(config.Port, () => {
  console.log(`Server has started on Port: ${config.Port}`);
});
