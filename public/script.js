var app = new Vue({
	el: '#app',
	data: {
		username: '',
		password: '',
		baseWord: '',
		smWord: '',
		nmWord: '',
		amWord: '',
		flashcards: [],
		currentCard: {},
		showCards: false,
		showFront: true,
		endOfCards: true,
		currentIndex: 0,
		loggedIn: false,
		currentUser: {},
		id: 0
	},
	/*created: function() {
    	this.getFlashcards();
  	},*/
  	watch: {
    	flashcards: function(value,oldvalue) {
      		this.startQuiz();
    	}
  	},
  	computed: {
  		frontText: function() {
  			if (!this.endOfCards) {
  				if (this.showFront) {
  				  return this.currentCard.card_header + this.currentCard.front_text;
  				} else {
  				  return this.currentCard.back_text;
  				}
  			} else {
  				return "No cards left in the deck. Add cards to start or click 'Start Flashcards' to start over.";
  			}
  		}
  	},
	methods: {
		softlyMutate: function() {
			this.baseWord = this.baseWord.toLowerCase();
			var firstChar = this.baseWord.charAt(0);
			var secondChar = this.baseWord.charAt(1);
			if (firstChar === 'p' && secondChar !== 'h') {
				this.smWord = this.baseWord.replace('p', 'b');
			} else if (firstChar === 't' && secondChar !== 'h') {
				this.smWord = this.baseWord.replace('t', 'd');
			} else if (firstChar === 'c' && secondChar !== 'h') {
				this.smWord = this.baseWord.replace('c', 'g');
			} else if (firstChar === 'b') {
				this.smWord = this.baseWord.replace('b', 'f');
			} else if (firstChar === 'm' && secondChar !== 'h') {
				this.smWord = this.baseWord.replace('m', 'f');
			} else if (firstChar === 'd' && secondChar !== 'd') {
				this.smWord = this.baseWord.replace('d', 'dd');
			} else if (firstChar === 'l' && secondChar === 'l') {
				this.smWord = this.baseWord.substr(1);
			} else if (firstChar === 'r' && secondChar === 'h') {
				this.smWord = this.baseWord.substr(0, 1) + this.baseWord.substr(2);
			} else if (firstChar === 'g') {
				this.smWord = this.baseWord.substr(1);
			} else {
				this.smWord = "The word " + this.baseWord + " does not mutate softly.";
			}
		},
		nasallyMutate: function() {
			this.baseWord = this.baseWord.toLowerCase();
			var firstChar = this.baseWord.charAt(0);
			var secondChar = this.baseWord.charAt(1);
			if (firstChar === 'p' && secondChar !== 'h') {
				this.nmWord = this.baseWord.replace('p', 'mh');
			} else if (firstChar === 't' && secondChar !== 'h') {
				this.nmWord = this.baseWord.replace('t', 'nh');
			} else if (firstChar === 'c' && secondChar !== 'h') {
				this.nmWord = this.baseWord.replace('c', 'ngh');
			} else if (firstChar === 'b') {
				this.nmWord = this.baseWord.replace('b', 'm');
			} else if (firstChar === 'd' && secondChar !== 'd') {
				this.nmWord = this.baseWord.replace('d', 'n');
			} else if (firstChar === 'g') {
				this.nmWord = this.baseWord.replace('g', 'ng');
			} else {
				this.nmWord = "The word " + this.baseWord + " does not mutate nasally.";
			}
		},
		aspiratelyMutate: function() {
			this.baseWord = this.baseWord.toLowerCase();
			var firstChar = this.baseWord.charAt(0);
			var secondChar = this.baseWord.charAt(1);
			if (firstChar === 'p' && secondChar !== 'h') {
				this.amWord = this.baseWord.replace('p', 'ph');
			} else if (firstChar === 't' && secondChar !== 'h') {
				this.amWord = this.baseWord.replace('t', 'th');
			} else if (firstChar === 'c' && secondChar !== 'h') {
				this.amWord = this.baseWord.replace('c', 'ch');
			} else {
				this.amWord = "The word " + this.baseWord + " does not mutate aspirately."
			}
		},
		getFlashcards: function() {
      		axios.get("http://localhost:3002/api/flashcards").then(response => {
						this.flashcards = response.data; //sends GET request to the URL and assigns the array in the response to items
						return true;
      		}).catch(err => {
      		});
    	},
    	clearAnswers: function() {
    		this.smWord = '';
    		this.nmWord = '';
    		this.amWord = '';
    	},
		startQuiz: function() {
			this.clearAnswers();
			this.showCards = true;
			this.showFront = true;
			if (this.flashcards.length > 0) {
				this.endOfCards = false;
				this.currentIndex = 0;
				this.currentCard = this.flashcards[this.currentIndex];
			} else {
				this.endOfCards = true;
			}
		},
		addSMCard: function() {
			this.softlyMutate();
			axios.post("http://localhost:3002/api/flashcards", {
				front_text: this.baseWord,
				back_text: this.smWord,
				card_header: "Soft Mutation of: ",
				memorized: false,
				user_id: this.id
			}).then(response => {
				this.getFlashcards();
				return true;
			}).catch(err => {
			});
		},
		addNMCard: function() {
			this.nasallyMutate();
			axios.post("http://localhost:3002/api/flashcards", {
				front_text: this.baseWord,
				back_text: this.nmWord,
				card_header: "Nasal Mutation of ",
				memorized: false,
				user_id: this.id
			}).then(response => {
				this.getFlashcards();
				return true;
			}).catch(err => {
			});
		},
		addAMCard: function() {
			this.aspiratelyMutate();
			axios.post("http://localhost:3002/api/flashcards", {
				front_text: this.baseWord,
				back_text: this.amWord,
				card_header: "Aspirate Mutation of ",
				memorized: false,
				user_id: this.id
			}).then(response => {
				this.getFlashcards();
				return true;
			}).catch(err => {
			});
		},
		addFlashcards: function() {
			this.addSMCard();
			this.addNMCard();
			this.addAMCard();
		},
		memorizeCard: function() {
			axios.put("http://localhost:3002/api/flashcards/" + this.currentCard.id, {
				memorized: !this.currentCard.memorized,
			}).then(response => {
				this.getFlashcards();
				return true;
			}).catch(err => {
			});
		},
		deleteMemorized: function() {
			this.flashcards.forEach(card => {
				if (card.memorized) {
					this.deleteCard(card);
				}
			});
		},
		deleteCard: function(card) {
			axios.delete("http://localhost:3002/api/flashcards/" + card.id).then(response => {
				this.getFlashcards();
				return true;
			}).catch(err => {
			});
		},
		flip: function() {
			this.showFront = !this.showFront;
		},
		getLast: function() {
			this.showFront = true;
			this.currentIndex = this.currentIndex - 1;
			if (this.currentIndex < 0) {
				this.currentIndex = 0;
			}
			this.currentCard = this.flashcards[this.currentIndex];
		},
		getNext: function() {
			this.showFront = true;
			this.currentIndex = this.currentIndex + 1;
			if (this.currentIndex >= this.flashcards.length) {
				this.endOfCards = true;
			} else {
				this.currentCard = this.flashcards[this.currentIndex];
			}
		},
		register: function() {
			axios.post("http://localhost:3002/api/users", {
				username: this.username,
				password: this.password
			}).then(response => {
				this.currentUser = response.data;
				this.loggedIn = true;
				this.getFlashcards();
				return true;
			}).catch(err => {
			});
		}
	}
});
