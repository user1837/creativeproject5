//always include the following 6 lines in Node server
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
//for accepting incoming POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//sets up director called "public" that is served by web server
app.use(express.static('public'))

// Knex Setup
const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];
const db = require('knex')(config);

//let flashcards = []; //array of flashcard objects
//let id = 0;

//if server gets a GET request at this URL it sends the array of items
app.get('/api/flashcards', (req, res) => {
  db('cards').select().from('cards').then(cards => {
    res.send(cards);
  }).catch(error => {
    //console.log(error);
    res.status(500).json({ error });
  });
});

//if server gets POST request at this URL it reates and returns item
app.post('/api/flashcards', (req, res) => {
  db('cards').insert({front_text:req.body.front_text, back_text:req.body.back_text, card_header:req.body.card_header, memorized:req.body.memorized, user_id:req.body.user_id}).then(cards => {
    res.status(200).json({id:cards[0]});
    return;
  }).catch(error => {
    //console.log(error);
    res.status(500).json({ error });
  });
  //id = id + 1;
  //let flashcard = {id:id, frontText:req.body.frontText, backText:req.body.backText, memorized:req.body.memorized, cardHeader:req.body.cardHeader};
  //flashcards.push(flashcard);
  //res.send(flashcard);
});

//updates item
app.put('/api/flashcards/:id', (req, res) => { //colon means that there is number following it
  let id = parseInt(req.params.id);
  db('cards').where('id', id).update({memorized:req.body.memorized}).then(cards => {
    res.status(200).json({id:cards[0]});
    return;
  }).catch(error => {
    //conosle.log(error);
    res.status(500).json({ error });
  });
  /*let flashcardsMap = flashcards.map(flashcard => { return flashcard.id; });
  let index = flashcardsMap.indexOf(id);
  let flashcard = flashcards[index];
  flashcard.memorized = req.body.memorized;
  flashcard.frontText = req.body.frontText;
  flashcard.backText = req.body.backText;
  flashcard.cardHeader = req.body.cardHeader;
  res.send(item);*/
});

app.delete('/api/flashcards/:id', (req, res) => {
  let id = parseInt(req.params.id);
  db('cards').where('id', id).del().then(cards => {
    res.sendStatus(200);
  }).catch(error => {
    res.status(500).json({ error });
  });
  /*let removeIndex = flashcards.map(flashcard => { return flashcard.id; }).indexOf(id); //gets index of id
  if (removeIndex === -1) {
    res.status(404).send("Sorry, that item doesn't exist"); //sends error code
    return;
  }
  flashcards.splice(removeIndex, 1);
  res.sendStatus(200);*/
});

//Change port number for different apps
app.listen(3002, () => console.log('Server listening on port 3002!'))
