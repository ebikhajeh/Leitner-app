# Leitner Language Learning App

---

## 🧠 Problem

Learning a new language is difficult due to the following key challenges:

### 1. Vocabulary Retention
- Users forget words quickly after learning them  
- There is no structured review system  
- Review is random instead of scheduled  
- Users don’t know when to revisit words  

---

### 2. Inability to Use Words in Context
- Users recognize words but cannot use them in sentences  
- Grammar is learned passively but not applied  
- Learning is based on recognition, not production  

---

### 3. Low Motivation and Inconsistency
- Users lose consistency after a few days  
- No clear sense of progress  
- No feedback loop to reinforce learning  

---

## 💡 Solution

Build a smart learning system based on the Leitner method, enhanced with modern techniques:

- Use a Leitner-based system for spaced repetition  
- Enforce active recall instead of passive recognition  
- Encourage sentence creation for real usage  
- Provide feedback (simulated or AI-based)  

---

## 🚀 Features

### 🟢 Core Features

#### 1. Leitner Review System
- Flashcards organized into 5 boxes  
- Review intervals per box:
  - Box 1 → every day  
  - Box 2 → every 2 days  
  - Box 3 → every 4 days  
  - Box 4 → every 7 days  
  - Box 5 → every 14 days  
- Cards move based on user performance:
  - Hard → move to Box 1  
  - Medium → move down one box  
  - Easy → move up one box  
- All new words start in Box 1  

---

#### 2. Active Recall Review Flow
- Show only the word initially  
- Reveal meaning on user action  
- Show:
  - Meaning  
  - Example sentence  
- User selects difficulty:
  - Hard / Medium / Easy  

---

#### 3. Flashcard Structure
Each card includes:
- Word (source language)  
- Meaning (target language)  
- Example sentence  

The app is language-agnostic — users can learn any language.  

---

#### 4. Sentence Practice (AI-Based)
- User writes a sentence using a word  
- AI evaluates the sentence and returns:
  - Corrected sentence  
  - Improved version  
  - Explanation  

---

#### 5. Add New Word
- Input:
  - Word  
  - Meaning  
  - Example sentence  
- Daily new word limit is configurable in settings  
- The system respects this limit when introducing new cards  

---

#### 6. Progress Tracking
- Words learned  
- Cards due  
- Streak  
- XP / Level  

---

#### 7. Statistics
- Total words  
- Mastered words  
- Retention rate  
- Cards per Leitner box  

---

### 🟡 Engagement Features

#### 8. Gamification
- XP earned per reviewed card  
- Bonus XP for completing a full review session  
- Bonus XP for maintaining a streak  
- Levels based on accumulated XP  
- Daily streak: maintained by reviewing at least 1 card per day  

---

#### 9. Daily Goals
- Number of cards to review  
- Number of new words  

---

### 🔵 Learning Enhancements

#### 10. Example-Based Learning
- Each word includes a sentence for context  

---

#### 11. Recognition to Recall Transition
- Encourage users to actively recall and produce answers  

---

### 🔴 Advanced Features (Future)

#### 12. AI Feedback
- Correct user sentences  
- Provide explanations  

---

#### 13. Smart Content Generation
- Suggest new words  
- Generate sentences and quizzes  

---

#### 14. Active Recall Input Mode
- User types meaning before seeing answer  

---

#### 15. Challenge Mode
- Fill in the blank  
- Translation exercises  

---

#### 16. Sync & Cloud
- Save and sync progress across devices  

---

## 🖥️ Platform

- **Version 1:** Web application  

---

## 🚀 Onboarding

- Users start with an empty deck  
- All words are added manually by the user  