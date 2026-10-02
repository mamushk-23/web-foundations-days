let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// searchNotes(word) 
function searchNotes(word) {
  return notes.filter(function (note) {
    return note.text.toLowerCase().includes(word.toLowerCase());
  });
}

// longestNote
function longestNote() {
  if (notes.length === 0) {
    return null;
  }
  let longest = notes[0];
  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i];
    }
  }
  return longest;
}

// countByCategory
function countByCategory() {
  const counts = { personal: 0, work: 0, study: 0 };
  for (let i = 0; i < notes.length; i++) {
    counts[notes[i].category]++;
  }
  return counts;
}

// getSummary
function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const word = total === 1 ? "note" : "notes";

  const parts = [];
  for (const cat in counts) {
    parts.push(counts[cat] + " " + cat);
  }

  return total + " " + word + ": " + parts.join(", ") + ".";
}

// isDuplicate
function isDuplicate(text) {
  const normalised = text.trim().toLowerCase();
  return notes.some(function (note) {
    return note.text.trim().toLowerCase() === normalised;
  });
}

// addNote
function addNote(text, category) {
  const allowed = ["personal", "work", "study"];

  if (text.length < 1 || text.length > 200) {
    console.log("Not added: text must be between 1 and 200 characters.");
    return false;
  }

  if (!allowed.includes(category)) {
    console.log("Not added: category must be personal, work or study.");
    return false;
  }

  if (isDuplicate(text)) {
    console.log("Not added: a note with that text already exists.");
    return false;
  }

  const nextId = notes.length === 0 ? 1 : notes[notes.length - 1].id + 1;
  notes.push({ id: nextId, text: text, category: category });
  console.log("Added: \"" + text + "\"");
  return true;
}

// TESTS 

// searchNotes tests
console.log(searchNotes("milk"));              // [{ id: 1, text: "Buy milk and bread", category: "personal" }]
console.log(searchNotes("NOT"));               // []
console.log(longestNote());                    // { id: 3, text: "Email the project report to Grace", category: "work" }

console.log(countByCategory());                // { personal: 2, study: 2, work: 1 }

console.log(getSummary());                     // "5 notes: 2 personal, work, 2 study."

console.log(isDuplicate("buy milk and bread"));  // true
console.log(isDuplicate("pick up rice"));      // false

console.log(addNote("Meeting at 3pm", "work"));       // true
console.log(addNote("", "personal"));                 // false
console.log(addNote("buy milk and bread", "personal")); // false
console.log(addNote("Too long...".repeat(50), "study")); // false