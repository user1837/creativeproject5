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

// bcrypt setup
let bcrypt = require('bcrypt');
const saltRounds = 10;


//let flashcards = []; //array of flashcard objects
//let id = 0;

//if server gets a GET request at this URL it sends the array of items
app.get('/api/users/:id/flashcards', (req, res) => {
  let id = parseInt(req.params.id);
  db('cards').where('user_id',id).select('id','front_text','back_text','card_header','memorized').then(cards => {
    res.status(200).send(cards);
  }).catch(error => {
    //console.log(error);
    res.status(500).json({ error });
  });
});

//if server gets POST request at this URL it reates and returns item
app.post('/api/users/:id/flashcards', (req, res) => {
  let id = parseInt(req.params.id);
  db('users').where('id',id).first().then(user => {
    return db('cards').insert({front_text:req.body.front_text, back_text:req.body.back_text, card_header:req.body.card_header, memorized:req.body.memorized, user_id:id});
  }).then(ids => {
    return db('cards').where('id',ids[0]).first();
  }).then(card => {
    res.status(200).send({id:card.id,front_text:card.front_text, back_text:card.back_text, card_header:card.card_header, memorized:card.memorized});
    return;
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
  //id = id + 1;
  //let flashcard = {id:id, frontText:req.body.frontText, backText:req.body.backText, memorized:req.body.memorized, cardHeader:req.body.cardHeader};
  //flashcards.push(flashcard);
  //res.send(flashcard);
});

//updates item
app.put('/api/users/:id/flashcards/:card_id', (req, res) => { //colon means that there is number following it
  let id = parseInt(req.params.id);
  let card_id = parseInt(req.params.card_id);
  db('cards').where('id', card_id).update({front_text:req.body.front_text, back_text:req.body.back_text, card_header:req.body.card_header,memorized:req.body.memorized, user_id:id}).then(cards => {
    res.status(200).json({cards:cards});
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

app.delete('/api/users/:id/flashcards/:card_id', (req, res) => {
  let id = parseInt(req.params.id);
  let card_id = parseInt(req.params.card_id);
  db('cards').where('id', card_id).del().then(cards => {
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

app.post('/api/register', (req, res) => {
  if (!req.body.username || !req.body.password)
    return res.status(400).send("Missing username or password.");
  db('users').where('username', req.body.username).first().then(user => {
    if (user !== undefined) {
      res.status(403).send("Username already exists.");
      throw new Error('abort');
    }
    return bcrypt.hash(req.body.password, saltRounds);
  }).then(hash => {
    return db('users').insert({hash: hash, username: req.body.username});
  }).then(ids => {
    return db('users').where('id', ids[0]).first().select('id', 'username');
  }).then(user => {
    res.status(200).send({id:user.id, username:user.username});
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  })
});

app.post('/api/login', (req, res) => {
  if (!req.body.username || !req.body.password)
    return res.status(400).send("Missing username or password");
  db('users').where('username', req.body.username).first().then(user => {
    if (user === undefined) {
      res.status(403).send("Invalid credentials");
      throw new Error('abort');
    }
    return [bcrypt.compare(req.body.password, user.hash), user];
  }).spread((result, user) => {
    if (result)
      res.status(200).send({id:user.id, username:user.username});
    else
      res.status(403).send("Invalid credentials");
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  })
});

//Change port number for different apps
app.listen(3002, () => console.log('Server listening on port 3002!'))
