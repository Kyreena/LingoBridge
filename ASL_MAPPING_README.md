# ASL Mapping File Documentation

## Overview

The `asl_mapping.json` file provides a mapping of English vocabulary words to their corresponding ASL (American Sign Language) video file identifiers. This file is designed to work with local video datasets, allowing you to use your own video files instead of streaming from external sources.

## File Format

```json
{
  "word": {
    "video_id": "12345",
    "file": "12345.mp4"
  }
}
```

### Fields

- **word** (string): The English vocabulary word in lowercase
- **video_id** (string): The unique identifier for the ASL video sign
- **file** (string): The video filename (video_id + .mp4 extension)

## Usage

### With Local Video Dataset

1. **Download Videos**: Download the ASL sign videos for each video_id
2. **Organize Files**: Place video files in your dataset directory named as `{video_id}.mp4`
3. **Load Mapping**: Use this JSON file to map words to your local video files

Example directory structure:
```
dataset/
  asl_videos/
    22411.mp4  (hello, hi)
    21298.mp4  (goodbye, bye)
    26786.mp4  (please)
    ...
```

### Code Integration

**JavaScript Example:**
```javascript
// Load the mapping
const aslMapping = require('./asl_mapping.json');

// Get video file for a word
function getVideoFile(word) {
  const mapping = aslMapping[word.toLowerCase()];
  if (mapping) {
    return `dataset/asl_videos/${mapping.file}`;
  }
  return null;
}

// Usage
const videoPath = getVideoFile('hello');
// Returns: "dataset/asl_videos/22411.mp4"
```

**Python Example:**
```python
import json

# Load the mapping
with open('asl_mapping.json', 'r') as f:
    asl_mapping = json.load(f)

# Get video file for a word
def get_video_file(word):
    mapping = asl_mapping.get(word.lower())
    if mapping:
        return f"dataset/asl_videos/{mapping['file']}"
    return None

# Usage
video_path = get_video_file('hello')
# Returns: "dataset/asl_videos/22411.mp4"
```

## Statistics

- **Total Vocabulary**: 261 words
- **Video Source**: Signing Savvy video IDs
- **Format**: MP4 video files

## Categories Covered

The mapping includes ASL signs for:

- **Greetings & Courtesy** (10 words): hello, hi, goodbye, bye, please, thank, thanks, yes, no, you
- **Pronouns** (10 words): I, me, we, us, he, she, they, it, this, that
- **Common Verbs** (30+ words): eat, drink, sit, stand, walk, run, come, go, see, look, hear, listen, talk, speak, say, tell, ask, answer, give, take, make, do, work, play, stop, start, finish, open, close
- **Family & Relationships** (17 words): mother, father, sister, brother, family, friend, boy, girl, man, woman, baby, child, people, parent, mom, dad
- **Colors** (11 words): color, red, blue, green, yellow, orange, purple, pink, black, white, brown
- **Food & Drink** (13 words): food, water, milk, juice, coffee, tea, bread, apple, banana, cookie, cake, candy
- **Educational Terms** (18 words): homework, test, quiz, exam, study, practice, question, problem, math, science, english, history, art, music, computer, paper, pencil, pen, desk, chair
- **Classroom** (5 words): teacher, student, learn, book, read, write, class, school
- **Emotions & States** (13 words): happy, sad, angry, mad, excited, surprised, tired, sick, hurt, pain, afraid, scared, worry, sorry, excuse
- **Places & Objects** (16 words): house, home, car, bus, train, phone, door, window, table, bed, bathroom, kitchen, store, library, hospital
- **Time** (19 words): today, tomorrow, yesterday, now, later, day, night, week, month, year, time, hour, minute, morning, afternoon, evening, monday, tuesday, wednesday, thursday, friday, saturday, sunday
- **Numbers** (22 words): one through twenty, hundred, thousand
- **Questions** (6 words): what, where, when, who, why, how
- **Actions** (7 words): help, understand, know, think, want, need, like
- **Adjectives** (40+ words): good, bad, big, small, new, old, young, hot, cold, warm, cool, fast, slow, easy, hard, difficult, right, wrong, correct, same, different, more, less, many, much, little, few, all, some, every, none, nice, great, fine, ok, okay

## Notes

1. **Duplicate IDs**: Some words share the same video_id because they use the same ASL sign (e.g., "hello" and "hi" both use video 22411)
2. **Video Source**: Original video IDs are from Signing Savvy (signingsavvy.com)
3. **File Naming**: Videos should be named exactly as `{video_id}.mp4` for the mapping to work correctly

## Updating the Mapping

To add or modify entries:

1. Edit the `asl_mapping.json` file
2. Follow the same format: `"word": { "video_id": "ID", "file": "ID.mp4" }`
3. Ensure video files exist for any new video_id entries

## Alternative: Using with Original asl-library.js

If you prefer to use the original JavaScript library format, see `asl-library.js` which uses direct URLs to Signing Savvy videos. The `asl_mapping.json` file is provided as an alternative for users who want to:

- Host videos locally
- Work offline
- Have better control over video loading
- Use their own video files

## Support

For questions or issues with the mapping file:
1. Verify JSON syntax is valid
2. Check that video_id values are correct
3. Ensure video files exist in your dataset directory
4. Refer to the main README.md for additional help

## Version

- **Current Version**: 1.1.0
- **Last Updated**: 2026-03-02
- **Vocabulary Count**: 261 words
