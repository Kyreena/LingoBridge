/**
 * ASL Library - Maps common English words to ASL video signs
 * 
 * Note: This is a demonstration library. In a production system, you would:
 * 1. Store actual ASL video files
 * 2. Use a video hosting service or CDN
 * 3. Have a much larger vocabulary database
 * 4. Include multiple variations of signs
 */

const ASL_LIBRARY = {
    // Common greetings
    "hello": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22411.mp4",
        description: "Hello greeting sign"
    },
    "hi": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22411.mp4",
        description: "Hello greeting sign"
    },
    "goodbye": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21298.mp4",
        description: "Goodbye sign"
    },
    "bye": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21298.mp4",
        description: "Goodbye sign"
    },
    
    // Common words
    "please": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26786.mp4",
        description: "Please sign"
    },
    "thank": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22134.mp4",
        description: "Thank you sign"
    },
    "thanks": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22134.mp4",
        description: "Thank you sign"
    },
    "you": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27691.mp4",
        description: "You sign"
    },
    "yes": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26352.mp4",
        description: "Yes sign"
    },
    "no": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24755.mp4",
        description: "No sign"
    },
    
    // Classroom words
    "teacher": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22091.mp4",
        description: "Teacher sign"
    },
    "student": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21800.mp4",
        description: "Student sign"
    },
    "learn": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23790.mp4",
        description: "Learn sign"
    },
    "learning": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23790.mp4",
        description: "Learn sign"
    },
    "book": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21108.mp4",
        description: "Book sign"
    },
    "read": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26825.mp4",
        description: "Read sign"
    },
    "reading": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26825.mp4",
        description: "Read sign"
    },
    "write": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27676.mp4",
        description: "Write sign"
    },
    "writing": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27676.mp4",
        description: "Write sign"
    },
    "class": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21356.mp4",
        description: "Class sign"
    },
    "classroom": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21356.mp4",
        description: "Class sign"
    },
    "school": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27004.mp4",
        description: "School sign"
    },
    
    // Question words
    "what": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27584.mp4",
        description: "What sign"
    },
    "where": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27601.mp4",
        description: "Where sign"
    },
    "when": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27597.mp4",
        description: "When sign"
    },
    "who": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27619.mp4",
        description: "Who sign"
    },
    "why": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27629.mp4",
        description: "Why sign"
    },
    "how": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22469.mp4",
        description: "How sign"
    },
    
    // Basic actions
    "help": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22367.mp4",
        description: "Help sign"
    },
    "understand": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22294.mp4",
        description: "Understand sign"
    },
    "know": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23678.mp4",
        description: "Know sign"
    },
    "think": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22138.mp4",
        description: "Think sign"
    },
    "want": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27540.mp4",
        description: "Want sign"
    },
    "need": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24716.mp4",
        description: "Need sign"
    },
    "like": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23882.mp4",
        description: "Like sign"
    },
    
    // Time words
    "today": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22189.mp4",
        description: "Today sign"
    },
    "tomorrow": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22212.mp4",
        description: "Tomorrow sign"
    },
    "yesterday": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27700.mp4",
        description: "Yesterday sign"
    },
    "now": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24824.mp4",
        description: "Now sign"
    },
    "later": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23764.mp4",
        description: "Later sign"
    },
    
    // Numbers 1-10
    "one": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24854.mp4",
        description: "Number one sign"
    },
    "two": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22267.mp4",
        description: "Number two sign"
    },
    "three": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22141.mp4",
        description: "Number three sign"
    },
    "four": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21962.mp4",
        description: "Number four sign"
    },
    "five": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21897.mp4",
        description: "Number five sign"
    },
    "six": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27135.mp4",
        description: "Number six sign"
    },
    "seven": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27047.mp4",
        description: "Number seven sign"
    },
    "eight": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21672.mp4",
        description: "Number eight sign"
    },
    "nine": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24743.mp4",
        description: "Number nine sign"
    },
    "ten": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22102.mp4",
        description: "Number ten sign"
    },
    
    // Common adjectives
    "good": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22234.mp4",
        description: "Good sign"
    },
    "bad": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21036.mp4",
        description: "Bad sign"
    },
    "big": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21083.mp4",
        description: "Big sign"
    },
    "small": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27176.mp4",
        description: "Small sign"
    },
    "happy": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22326.mp4",
        description: "Happy sign"
    },
    "sad": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26969.mp4",
        description: "Sad sign"
    }
};

/**
 * Get ASL video information for a word
 * @param {string} word - The word to look up
 * @returns {object|null} Video information or null if not found
 */
function getASLSign(word) {
    const normalizedWord = word.toLowerCase().trim();
    return ASL_LIBRARY[normalizedWord] || null;
}

/**
 * Check if a word has an ASL sign available
 * @param {string} word - The word to check
 * @returns {boolean} True if sign is available
 */
function hasASLSign(word) {
    const normalizedWord = word.toLowerCase().trim();
    return normalizedWord in ASL_LIBRARY;
}

/**
 * Get all available words in the ASL library
 * @returns {string[]} Array of available words
 */
function getAvailableWords() {
    return Object.keys(ASL_LIBRARY);
}

/**
 * Get count of available signs
 * @returns {number} Number of signs in library
 */
function getSignCount() {
    return Object.keys(ASL_LIBRARY).length;
}
