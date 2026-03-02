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
    },
    
    // Pronouns and common words
    "i": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22520.mp4",
        description: "I/Me sign"
    },
    "me": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22520.mp4",
        description: "I/Me sign"
    },
    "we": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27561.mp4",
        description: "We sign"
    },
    "us": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27561.mp4",
        description: "We/Us sign"
    },
    "he": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22356.mp4",
        description: "He sign"
    },
    "she": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27084.mp4",
        description: "She sign"
    },
    "they": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22144.mp4",
        description: "They sign"
    },
    "it": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22545.mp4",
        description: "It sign"
    },
    "this": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22150.mp4",
        description: "This sign"
    },
    "that": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22117.mp4",
        description: "That sign"
    },
    
    // Common verbs
    "eat": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21659.mp4",
        description: "Eat sign"
    },
    "drink": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21610.mp4",
        description: "Drink sign"
    },
    "sit": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27143.mp4",
        description: "Sit sign"
    },
    "stand": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27270.mp4",
        description: "Stand sign"
    },
    "walk": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27534.mp4",
        description: "Walk sign"
    },
    "run": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26953.mp4",
        description: "Run sign"
    },
    "come": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21397.mp4",
        description: "Come sign"
    },
    "go": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22230.mp4",
        description: "Go sign"
    },
    "see": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27021.mp4",
        description: "See sign"
    },
    "look": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23942.mp4",
        description: "Look sign"
    },
    "hear": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22358.mp4",
        description: "Hear sign"
    },
    "listen": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23904.mp4",
        description: "Listen sign"
    },
    "talk": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22082.mp4",
        description: "Talk sign"
    },
    "speak": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27227.mp4",
        description: "Speak sign"
    },
    "say": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26993.mp4",
        description: "Say sign"
    },
    "tell": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22098.mp4",
        description: "Tell sign"
    },
    "ask": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21007.mp4",
        description: "Ask sign"
    },
    "answer": {
        video: "https://www.signingsavvy.com/media/mp4-ld/20/20983.mp4",
        description: "Answer sign"
    },
    "give": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22216.mp4",
        description: "Give sign"
    },
    "take": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22078.mp4",
        description: "Take sign"
    },
    "make": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24102.mp4",
        description: "Make sign"
    },
    "do": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21588.mp4",
        description: "Do sign"
    },
    "work": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27668.mp4",
        description: "Work sign"
    },
    "play": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26780.mp4",
        description: "Play sign"
    },
    "stop": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27299.mp4",
        description: "Stop sign"
    },
    "start": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27275.mp4",
        description: "Start sign"
    },
    "finish": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21890.mp4",
        description: "Finish sign"
    },
    "open": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24858.mp4",
        description: "Open sign"
    },
    "close": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21367.mp4",
        description: "Close sign"
    },
    
    // Family and relationships
    "mother": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24647.mp4",
        description: "Mother sign"
    },
    "mom": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24647.mp4",
        description: "Mother sign"
    },
    "father": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21843.mp4",
        description: "Father sign"
    },
    "dad": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21843.mp4",
        description: "Father sign"
    },
    "parent": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24953.mp4",
        description: "Parent sign"
    },
    "parents": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24953.mp4",
        description: "Parents sign"
    },
    "sister": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27145.mp4",
        description: "Sister sign"
    },
    "brother": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21179.mp4",
        description: "Brother sign"
    },
    "family": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21832.mp4",
        description: "Family sign"
    },
    "friend": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21990.mp4",
        description: "Friend sign"
    },
    "boy": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21136.mp4",
        description: "Boy sign"
    },
    "girl": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22220.mp4",
        description: "Girl sign"
    },
    "man": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24130.mp4",
        description: "Man sign"
    },
    "woman": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27653.mp4",
        description: "Woman sign"
    },
    "baby": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21022.mp4",
        description: "Baby sign"
    },
    "child": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21334.mp4",
        description: "Child sign"
    },
    "people": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26730.mp4",
        description: "People sign"
    },
    
    // Colors
    "color": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21385.mp4",
        description: "Color sign"
    },
    "red": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26845.mp4",
        description: "Red sign"
    },
    "blue": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21099.mp4",
        description: "Blue sign"
    },
    "green": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22278.mp4",
        description: "Green sign"
    },
    "yellow": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27694.mp4",
        description: "Yellow sign"
    },
    "orange": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24890.mp4",
        description: "Orange sign"
    },
    "purple": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26811.mp4",
        description: "Purple sign"
    },
    "pink": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26762.mp4",
        description: "Pink sign"
    },
    "black": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21093.mp4",
        description: "Black sign"
    },
    "white": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27607.mp4",
        description: "White sign"
    },
    "brown": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21182.mp4",
        description: "Brown sign"
    },
    
    // Food and drink
    "food": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21927.mp4",
        description: "Food sign"
    },
    "water": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27554.mp4",
        description: "Water sign"
    },
    "milk": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24507.mp4",
        description: "Milk sign"
    },
    "juice": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23636.mp4",
        description: "Juice sign"
    },
    "coffee": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21374.mp4",
        description: "Coffee sign"
    },
    "tea": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22093.mp4",
        description: "Tea sign"
    },
    "bread": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21151.mp4",
        description: "Bread sign"
    },
    "apple": {
        video: "https://www.signingsavvy.com/media/mp4-ld/20/20989.mp4",
        description: "Apple sign"
    },
    "banana": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21045.mp4",
        description: "Banana sign"
    },
    "cookie": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21424.mp4",
        description: "Cookie sign"
    },
    "cake": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21216.mp4",
        description: "Cake sign"
    },
    "candy": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21237.mp4",
        description: "Candy sign"
    },
    
    // Educational terms
    "homework": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22447.mp4",
        description: "Homework sign"
    },
    "test": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22113.mp4",
        description: "Test sign"
    },
    "quiz": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26818.mp4",
        description: "Quiz sign"
    },
    "exam": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21781.mp4",
        description: "Exam sign"
    },
    "study": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27330.mp4",
        description: "Study sign"
    },
    "practice": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26788.mp4",
        description: "Practice sign"
    },
    "question": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26815.mp4",
        description: "Question sign"
    },
    "problem": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26796.mp4",
        description: "Problem sign"
    },
    "math": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24236.mp4",
        description: "Math sign"
    },
    "science": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27009.mp4",
        description: "Science sign"
    },
    "english": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21731.mp4",
        description: "English sign"
    },
    "history": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22432.mp4",
        description: "History sign"
    },
    "art": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21000.mp4",
        description: "Art sign"
    },
    "music": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24677.mp4",
        description: "Music sign"
    },
    "computer": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21403.mp4",
        description: "Computer sign"
    },
    "paper": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24952.mp4",
        description: "Paper sign"
    },
    "pencil": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26721.mp4",
        description: "Pencil sign"
    },
    "pen": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26718.mp4",
        description: "Pen sign"
    },
    "desk": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21557.mp4",
        description: "Desk sign"
    },
    "chair": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21323.mp4",
        description: "Chair sign"
    },
    
    // More emotions and states
    "angry": {
        video: "https://www.signingsavvy.com/media/mp4-ld/20/20972.mp4",
        description: "Angry sign"
    },
    "mad": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24073.mp4",
        description: "Mad sign"
    },
    "excited": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21798.mp4",
        description: "Excited sign"
    },
    "surprised": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27363.mp4",
        description: "Surprised sign"
    },
    "tired": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22181.mp4",
        description: "Tired sign"
    },
    "sick": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27111.mp4",
        description: "Sick sign"
    },
    "hurt": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22509.mp4",
        description: "Hurt sign"
    },
    "pain": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24933.mp4",
        description: "Pain sign"
    },
    "afraid": {
        video: "https://www.signingsavvy.com/media/mp4-ld/20/20933.mp4",
        description: "Afraid sign"
    },
    "scared": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/26999.mp4",
        description: "Scared sign"
    },
    "worry": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27669.mp4",
        description: "Worry sign"
    },
    "sorry": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27217.mp4",
        description: "Sorry sign"
    },
    "excuse": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21799.mp4",
        description: "Excuse me sign"
    },
    
    // Common objects and places
    "house": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22468.mp4",
        description: "House sign"
    },
    "home": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22443.mp4",
        description: "Home sign"
    },
    "car": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21249.mp4",
        description: "Car sign"
    },
    "bus": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21200.mp4",
        description: "Bus sign"
    },
    "train": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22228.mp4",
        description: "Train sign"
    },
    "phone": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26746.mp4",
        description: "Phone sign"
    },
    "door": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21594.mp4",
        description: "Door sign"
    },
    "window": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27637.mp4",
        description: "Window sign"
    },
    "table": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22070.mp4",
        description: "Table sign"
    },
    "bed": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21060.mp4",
        description: "Bed sign"
    },
    "bathroom": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21053.mp4",
        description: "Bathroom sign"
    },
    "kitchen": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23677.mp4",
        description: "Kitchen sign"
    },
    "store": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27300.mp4",
        description: "Store sign"
    },
    "library": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23860.mp4",
        description: "Library sign"
    },
    "hospital": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22461.mp4",
        description: "Hospital sign"
    },
    
    // Days and time
    "day": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21533.mp4",
        description: "Day sign"
    },
    "night": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24744.mp4",
        description: "Night sign"
    },
    "week": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27572.mp4",
        description: "Week sign"
    },
    "month": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24627.mp4",
        description: "Month sign"
    },
    "year": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27689.mp4",
        description: "Year sign"
    },
    "time": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22177.mp4",
        description: "Time sign"
    },
    "hour": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22463.mp4",
        description: "Hour sign"
    },
    "minute": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24539.mp4",
        description: "Minute sign"
    },
    "morning": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24640.mp4",
        description: "Morning sign"
    },
    "afternoon": {
        video: "https://www.signingsavvy.com/media/mp4-ld/20/20935.mp4",
        description: "Afternoon sign"
    },
    "evening": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21775.mp4",
        description: "Evening sign"
    },
    "monday": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24618.mp4",
        description: "Monday sign"
    },
    "tuesday": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22258.mp4",
        description: "Tuesday sign"
    },
    "wednesday": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27571.mp4",
        description: "Wednesday sign"
    },
    "thursday": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22166.mp4",
        description: "Thursday sign"
    },
    "friday": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21986.mp4",
        description: "Friday sign"
    },
    "saturday": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26989.mp4",
        description: "Saturday sign"
    },
    "sunday": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27342.mp4",
        description: "Sunday sign"
    },
    
    // More numbers
    "eleven": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21686.mp4",
        description: "Number eleven sign"
    },
    "twelve": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22262.mp4",
        description: "Number twelve sign"
    },
    "thirteen": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22145.mp4",
        description: "Number thirteen sign"
    },
    "fourteen": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21961.mp4",
        description: "Number fourteen sign"
    },
    "fifteen": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21868.mp4",
        description: "Number fifteen sign"
    },
    "sixteen": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27136.mp4",
        description: "Number sixteen sign"
    },
    "seventeen": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27048.mp4",
        description: "Number seventeen sign"
    },
    "eighteen": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21673.mp4",
        description: "Number eighteen sign"
    },
    "nineteen": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24749.mp4",
        description: "Number nineteen sign"
    },
    "twenty": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22263.mp4",
        description: "Number twenty sign"
    },
    "hundred": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22481.mp4",
        description: "Hundred sign"
    },
    "thousand": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22156.mp4",
        description: "Thousand sign"
    },
    
    // More adjectives
    "new": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24735.mp4",
        description: "New sign"
    },
    "old": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24838.mp4",
        description: "Old sign"
    },
    "young": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27707.mp4",
        description: "Young sign"
    },
    "hot": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22465.mp4",
        description: "Hot sign"
    },
    "cold": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21378.mp4",
        description: "Cold sign"
    },
    "warm": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27545.mp4",
        description: "Warm sign"
    },
    "cool": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21425.mp4",
        description: "Cool sign"
    },
    "fast": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21837.mp4",
        description: "Fast sign"
    },
    "slow": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27173.mp4",
        description: "Slow sign"
    },
    "easy": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21656.mp4",
        description: "Easy sign"
    },
    "hard": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22331.mp4",
        description: "Hard sign"
    },
    "difficult": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21570.mp4",
        description: "Difficult sign"
    },
    "right": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26910.mp4",
        description: "Right/Correct sign"
    },
    "wrong": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27680.mp4",
        description: "Wrong sign"
    },
    "correct": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21431.mp4",
        description: "Correct sign"
    },
    "same": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26974.mp4",
        description: "Same sign"
    },
    "different": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21571.mp4",
        description: "Different sign"
    },
    "more": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24636.mp4",
        description: "More sign"
    },
    "less": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23830.mp4",
        description: "Less sign"
    },
    "many": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24149.mp4",
        description: "Many sign"
    },
    "much": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24663.mp4",
        description: "Much sign"
    },
    "little": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23913.mp4",
        description: "Little sign"
    },
    "few": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21862.mp4",
        description: "Few sign"
    },
    "all": {
        video: "https://www.signingsavvy.com/media/mp4-ld/20/20952.mp4",
        description: "All sign"
    },
    "some": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27209.mp4",
        description: "Some sign"
    },
    "every": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21777.mp4",
        description: "Every sign"
    },
    "none": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24769.mp4",
        description: "None sign"
    },
    
    // More useful words
    "ready": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26840.mp4",
        description: "Ready sign"
    },
    "wait": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27529.mp4",
        description: "Wait sign"
    },
    "again": {
        video: "https://www.signingsavvy.com/media/mp4-ld/20/20937.mp4",
        description: "Again sign"
    },
    "repeat": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26864.mp4",
        description: "Repeat sign"
    },
    "remember": {
        video: "https://www.signingsavvy.com/media/mp4-ld/26/26860.mp4",
        description: "Remember sign"
    },
    "forget": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21944.mp4",
        description: "Forget sign"
    },
    "important": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22522.mp4",
        description: "Important sign"
    },
    "try": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22254.mp4",
        description: "Try sign"
    },
    "use": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27480.mp4",
        description: "Use sign"
    },
    "share": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27081.mp4",
        description: "Share sign"
    },
    "turn": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22261.mp4",
        description: "Turn sign"
    },
    "change": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21326.mp4",
        description: "Change sign"
    },
    "keep": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23652.mp4",
        description: "Keep sign"
    },
    "stay": {
        video: "https://www.signingsavvy.com/media/mp4-ld/27/27284.mp4",
        description: "Stay sign"
    },
    "leave": {
        video: "https://www.signingsavvy.com/media/mp4-ld/23/23803.mp4",
        description: "Leave sign"
    },
    "arrive": {
        video: "https://www.signingsavvy.com/media/mp4-ld/20/20999.mp4",
        description: "Arrive sign"
    },
    "nice": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24742.mp4",
        description: "Nice sign"
    },
    "great": {
        video: "https://www.signingsavvy.com/media/mp4-ld/22/22275.mp4",
        description: "Great sign"
    },
    "fine": {
        video: "https://www.signingsavvy.com/media/mp4-ld/21/21885.mp4",
        description: "Fine sign"
    },
    "ok": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24835.mp4",
        description: "OK sign"
    },
    "okay": {
        video: "https://www.signingsavvy.com/media/mp4-ld/24/24835.mp4",
        description: "OK sign"
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
