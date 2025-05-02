
import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '@/entities/all';
// import { InvokeLLM } from '@/integrations/Core';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button"

// Import components
import FloatingCreature from '../Components/game/FloatingCreature';
import EmojiPanel from '../Components/game/EmojiPanel';
import ChatBox from '../Components/game/ChatBox';
import FloatingEmoji from '../Components/game/FloatingEmoji';
import GameControls from '../Components/game/GameControls';
import StartGameModal from '../Components/game/StartGameModal';
import VictoryModal from '../Components/game/VictoryModal';
import DefeatModal from '../Components/game/DefeatModal';
import AnimatedBackground from '../Components/game/AnimatedBackground';
import EmojiTabs from '../Components/game/EmojiTabs';




// Import history
import { saveBlobMessage, saveEatEvent, getBlobHistory, clearBlobHistory } from '@/GPT/history/historyManager';

// Import prompts
import { generateSystemPrompt as generatePromptEN } from "@/GPT/prompts/systemPrompt_en";
import { generateSystemPrompt as generatePromptHE } from "@/GPT/prompts/systemPrompt_he";

export default function GamePage() {
  // Add API key state
  const [apiKey, setApiKey] = useState('');
  const [isUsingGPT, setIsUsingGPT] = useState(false);
  
  // Game state
  const [gameState, setGameState] = useState(null);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showDefeatModal, setShowDefeatModal] = useState(false);
  const [language, setLanguage] = useState('he'); // 'en' or 'he'
  const [setEatenEmojiIds] = useState(new Set());
  const eatenEmojiIds = useRef(new Set());
  const [isCleanUpMode, setIsCleanUpMode] = useState(false);
  const [cleanedMessages] = useState([]);

  // מיקום הספארקל שיתופיע ברגע שהקיא נאפה
  const [showCleanSparkle, setShowCleanSparkle] = useState(false);
  const [sparklePos, setSparklePos] = useState(null);





  // Add new state variables
  const [moodLevel, setMoodLevel] = useState(8);
  const [activeBlob, setActiveBlob] = useState(null);
  const [blobs, setBlobs] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  const [moveDirection, setMoveDirection] = useState(null);
    
  // Add continuous movement state
  const [autoMovement, setAutoMovement] = useState({ angle: 0, distance: 0 });
  const [lastMoveTime, setLastMoveTime] = useState(Date.now());
  
  // Add state for available messages
  const [availableMessages, setAvailableMessages] = useState(1);

  // Add new state for game logs
  const [gameLogs, setGameLogs] = useState([]);
  const [logVisible, setLogVisible] = useState(true); // Toggle for logs panel

  // Add logging helper function
  const addGameLog = (action, details) => {
    const timestamp = new Date().toISOString();
    const newLog = {
      timestamp,
      action,
      details,
      position: creaturePosition ? { ...creaturePosition } : null
    };
    
    setGameLogs(prev => [...prev, newLog]);
    console.log(`📝 [GameLog] ${action}:`, details);
  };

  // English translations
  const enTranslations = {
    // Game General
    gameTitle: "E-MO-G",
    gameSubtitle: "Help Blob find something to eat!",
    genericHint: "I'm feeling hungry for something special!",
    gameInstruction: `How to Play?

    ${gameState?.creature_name} will hint which emoji it wants to eat.
    You need to drag or click an emoji and place it on the board.
    Ask questions to figure out what it’s looking for and guide it freely on the board.
    If you run out of questions – clear the board and get a fresh set of hints.
    ${gameState?.creature_name} must find 3 correct emojis to win!`,
    
    // Greeting
    greeting: "Hi! I'm {name}.",
    helpRequest: "Can you help me find it?",
    
    // Gameplay
    remainingEmojis: "emojis left",
    successCount: "Found",
    targetCount: "Need",
    clearEmojis: "Clear Emojis",
    newGame: "New Game",
    tryAgain: "Try Again",
    playAgain: "Play Again",
    
    // Chat
    chatWith: "Chat with",
    sendMessage: "Send",
    messagePlaceholder: `Tell ${gameState?.creature_name} where to look...`,
    noMessagePlaceholder: "Place emojis to ask more...",
    messagesLeft: "messages left",
    messageLeft: "message left",
    
    // Thought bubbles
    vomitAvoidance: "Eww, I can't go near that yucky puddle!",
    eatingCorrect: "Yummy! That's exactly what I wanted!",
    newEmojiSpotted: "I see something new! Let me check it out...",
    wrongEmoji: "Blegh! That's not what I wanted! 🤢",
    
    // Start Modal
    startTitle: "The Blob",
    nameLabel: "Name your Blob",
    namePlaceholder: "Enter a name...",
    emojiCountLabel: "Choose emoji count",
    hardDifficulty: "Hard",
    mediumDifficulty: "Medium",
    easyDifficulty: "Easy",
    startButton: "START GAME",
    helpText: "You'll have {count} emojis to use. Choose wisely!",
    blobDescription: "Help {name} find a specific emoji!",
    
    // Victory Modal
    victoryTitle: "Victory!",
    victoryText: "{name} is full and happy!",
    victorySubtext: "You successfully figured out what {name} wanted to eat!",
    
    // Defeat Modal
    defeatTitle: "Game Over!",
    defeatText: "{name} is still hungry!",
    defeatSubtext: "You ran out of emojis before {name} could find what it was looking for.",
    
    // Fallback
    fallbackResponse: "I'm not sure... but I'm still hungry!",

    progress: "Progress",
    targetsFound: "Targets Found",
    targetsNeeded: "Targets Needed",
    apiKeyLabel: "OpenAI API Key (optional)",
    apiKeyPlaceholder: "Enter your API key for ChatGPT interaction",
    selectEmoji: "Select Emoji",
    food: "Food & Drinks",
    flowers: "Nature & Flowers",
    celebrations: "Celebrations",
    animals: "Animals",
    things: "Objects",
    wantedEmoji: "Just wanted a little"
  };
  
  // Update Hebrew translations to ensure all strings are available
  const heTranslations = {
    // Game General
    gameTitle: "E-MO-G",
    gameSubtitle: "עזרו לבלוב למצוא משהו לאכול!",
    genericHint: "אני רעב למשהו מיוחד!",
    gameInstruction: `איך לשחק?

    ${gameState?.creature_name} ירמוז איזה אימוג’י הוא רוצה לאכול.
    יש לגרור או ללחוץ על אימוג’י והנח אותו על המגרש.
    שאל שאלות כדי להבין מה הוא מחפש וכדי לכוון אותו בחופשיות על המגרש.
    אם נגמרות השאלות – נקה את הלוח ותקבל סט חדש של רמזים.
    ${gameState?.creature_name} חייב למצוא 3 אימוג’ים נכונים כדי לנצח!`,
    
    // Greeting
    greeting: "היי! אני {name}",
    helpRequest: "תוכל לעזור לי למצוא את זה?",
    
    // Game UI
    clearEmojis: "ניקוי מגרש",
    newGame: "משחק חדש",
    remainingEmojis: "אימוג'ים נותרו",
    apiKeyLabel: "מפתח OpenAI (לא חובה)",
    apiKeyPlaceholder: "הכנס מפתח API לשימוש ב-ChatGPT",
    
    // Progress
    progress: "התקדמות",
    targetsFound: "נמצאו",
    targetsNeeded: "נדרש",
    
    // Start Modal
    startTitle: "הבלוב",
    nameLabel: "תן שם לבלוב שלך",
    namePlaceholder: "הכנס שם...",
    emojiCountLabel: "בחר כמות אימוג'ים",
    hardDifficulty: "קשה",
    mediumDifficulty: "בינוני",
    easyDifficulty: "קל",
    startButton: "התחל משחק",
    helpText: "יהיו לך {count} אימוג'ים לשימוש. בחר בחוכמה!",
    blobDescription: "עזור ל{name} למצוא אימוג'י מסוים!",
    
    // Chat
    chatWith: "צ'אט עם",
    sendMessage: "שלח",
    messagePlaceholder: `אמור ל${gameState?.creature_name} איפה לחפש`,
    noMessagePlaceholder: "הנח אימוג'י לשאול עוד...",
    messagesLeft: "הודעות זמינות",
    messageLeft: "הודעה זמינה",
    
    // Categories
    selectEmoji: "בחר אימוג'י",
    food: "אוכל ושתייה",
    flowers: "טבע ופרחים",
    celebrations: "חגיגות",
    animals: "חיות",
    things: "חפצים",
    
    // Game Messages
    eatingCorrect: "טעים! זה בדיוק מה שרציתי!",
    wrongEmoji: "בלאך! זה לא מה שרציתי! 🤢",
    newEmojiSpotted: "אני רואה משהו חדש! בוא נבדוק...",
    vomitAvoidance: "איכס, אני לא יכול להתקרב לשלולית הזאת!",
    fallbackResponse: "אני לא בטוח... אבל אני עדיין רעב!",
    
    // Victory/Defeat
    victoryTitle: "ניצחון!",
    victoryText: "{name} שבע ושמח!",
    victorySubtext: "הצלחת לגלות מה {name} רצה לאכול!",
    defeatTitle: "המשחק נגמר!",
    defeatText: "{name} עדיין רעב!",
    defeatSubtext: "נגמרו האימוג'ים לפני ש{name} מצא את מה שחיפש",
    playAgain: "שחק שוב",
    tryAgain: "נסה שוב",
    wantedEmoji: "רק רצה קצת",

    // Additional Messages
    emojiEaten: "יאמי! ה{emoji} הזה היה טעים! {isCompleted ? 'אני שבע עכשיו!' : 'אני עדיין רעב!'}",
    gameCompleted: "יש! מצאתי את כל מה שרציתי!",
    wrongEmojiEaten: "אוי, זה לא מה שרציתי... 🤢",
    moveLeft: "אזוז שמאלה...",
    moveRight: "אזוז ימינה...",
    moveUp: "אזוז למעלה...",
    moveDown: "אזוז למטה..."
  };
  
  const t = language === 'en' ? enTranslations : heTranslations;
  const isRtl = language === 'he';
  
  // Gameplay elements
  const [emojis, setEmojis] = useState([]);
  const [emojiPositions, setEmojiPositions] = useState({});
  const [messages, setMessages] = useState([]);
  const [creaturePosition, setCreaturePosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState(null);
  const [targetEmojiId, setTargetEmojiId] = useState(null);
  const [remainingEmojis, setRemainingEmojis] = useState(0);
  const [creatureMood, setCreatureMood] = useState('happy');
  const [specificTargetEmoji, setSpecificTargetEmoji] = useState(null);
  const [showForbiddenZone, setShowForbiddenZone] = useState(false);
  const [showWrongEmojiX, setShowWrongEmojiX] = useState(false);
  const [wrongEmojiPosition, setWrongEmojiPosition] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [vomitZones, setVomitZones] = useState([]);
  const [showThoughtBubble, setShowThoughtBubble] = useState(false);
  const [thoughtText, setThoughtText] = useState("");
  const [isMovingToEmoji, setIsMovingToEmoji] = useState(false);
  const [moveTarget, setMoveTarget] = useState(null);
  
  // Add eating state
  const [isEating, setIsEating] = useState(false);
  
  // References
  const gameAreaRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // All possible emojis
  const allEmojis = {
    food: [
      '🍔','🍕','🍓','🍉','🍇','🍫','🍩','🍪','🍡','🍦','🍰','🧁','🍭','🥧','🥨',
      '🍜','🍛','🍣','🍱','🌮','🌯','🥪','🍝','🍤','🍲'
    ],
    flowers: [
      '🌸','🌻','🌷','🍄','🌼','🍀','🌹','🌺','💐','🌵','🪴','🍂','🌱','🌿','🍃',
      '🍁','🏵️','🌾','🥀','🎋','🎍','🌴','🌳','🌲','🌾'
    ],
    celebrations: [
      '🎉','🎈','🎁','🎀','🌟','⭐','🎊','🎂','🏆','🥇','🎖️','🎗️','🎭','🎪','🎨',
      '🎬','🎤','🎧','🎫','🎟️','🎶','🥳','🍾','🥂','🪅'
    ],
    animals: [
      '🐶','🐱','🐰','🐻','🐼','🦊','🦁','🐯','🐨','🐸','🐢','🦄','🐝','🦋','🐠',
      '🐬','🐟','🦓','🦒','🦜','🐘','🐳','🦩','🦥','🦦'
    ],
    things: [
      '⚽','📱','🚗','✈️','🎮','📚','🧸','🎹','🧩','⌚','🔑','🧲','🧠','🧶','🎧',
      '💡','📷','🖼️','🕹️','🔨','🛏️','💻','📺','🖥️','📟'
    ]
  };
  
  // Emoji hints based on the specific emoji
  // Emoji hints based on the specific emoji
const emojiHints =
language === 'en'
  ? {
      '🍔': [
        "I'm feeling really hungry for something between bread!",
        "Hmm, I'm craving a fast food classic.",
        "Something round with layers would be tasty."
      ],
      '🍕': [
        "I want something cheesy and sliced!",
        "A round food that comes in triangles sounds good.",
        "I'm thinking Italian tonight!"
      ],
      '🍓': [
        "Something red and sweet with tiny seeds would be perfect.",
        "I'm in the mood for a berry good snack!",
        "This fruit is heart-shaped and juicy!"
      ],
      '🍉': [
        "I need something juicy with black seeds.",
        "A big green outside, red inside fruit sounds refreshing.",
        "It's hot, I need something that keeps you hydrated!"
      ],
      '🍇': [
        "I'm thinking of something that comes in small purple or green bunches.",
        "These sweet little balls grow on vines.",
        "They make this into a juice and wine!"
      ],
      '🍫': [
        "Something sweet and brown would hit the spot.",
        "I'm craving something that melts and is made from cocoa.",
        "A bar of something sweet would be perfect!"
      ],
      '🍩': [
        "I'd love something round with a hole in the middle!",
        "A sweet ring covered in glaze sounds delicious.",
        "It's a popular breakfast treat that goes with coffee!"
      ],
      '🍪': [
        "I'm craving something round, flat and baked.",
        "This sweet treat often has chocolate chips.",
        "Milk's favorite companion would be tasty!"
      ],

      '🌸': [
        "I'd love something pink and delicate with petals.",
        "This pretty flower blooms in spring.",
        "Cherry trees make these beautiful pink blooms!"
      ],
      '🌻': [
        "I'm looking for something tall, yellow and bright.",
        "This flower follows the sun during the day.",
        "It grows really tall and has seeds you can eat!"
      ],
      '🌷': [
        "A colorful spring bulb flower would be nice.",
        "This flower comes in many colors and is popular in the Netherlands.",
        "It grows from a bulb and has a single stem and bloom."
      ],
      '🌹': [
        "I'm in the mood for the queen of flowers.",
        "This romantic red flower has thorns on its stems.",
        "It's a symbol of love and comes in many colors!"
      ],

      '🎉': [
        "I want to celebrate with something that pops!",
        "This festive item shoots confetti when you pull it.",
        "You use this at parties when you want to make a surprise noise!"
      ],
      '🎈': [
        "Something that floats up would be fun!",
        "You fill this with air or helium for parties.",
        "This colorful party item can be twisted into animal shapes!"
      ],
      '🎁': [
        "I'd love something wrapped with a bow on top.",
        "This item contains a surprise inside!",
        "On birthdays, people give you these to unwrap!"
      ],
      '🎂': [
        "I'm craving something sweet with candles on top.",
        "You make a wish and blow out the candles on this.",
        "This sweet treat celebrates another year of life!"
      ],

      '🐶': [
        "I'd love to see a friendly animal that barks.",
        "Man's best friend would make me happy!",
        "This loyal pet wags its tail when excited."
      ],
      '🐱': [
        "I'm looking for a purring animal with whiskers.",
        "This animal says meow and likes to chase mice.",
        "This pet cleans itself and has nine lives supposedly!"
      ],
      '🐰': [
        "A cute animal with long ears would be adorable.",
        "This furry animal hops around and loves carrots.",
        "This animal is associated with Easter!"
      ],
      '🦄': [
        "I'd love to see a magical horse-like creature!",
        "This mythical animal has a single horn on its head.",
        "A magical rainbow horse would make me so happy!"
      ],

      '⚽': [
        "I'd like to play with something round that you kick.",
        "This ball is used in the world's most popular sport.",
        "This black and white ball is used in a game played with feet!"
      ],
      '📱': [
        "I'm looking for something you use to call and text people.",
        "This device fits in your pocket and has apps.",
        "You're probably reading this on one of these right now!"
      ],
      '🚗': [
        "I want to see something with wheels that takes you places.",
        "This vehicle has four wheels and a steering wheel.",
        "Most families own one of these to drive around!"
      ],
      '🧸': [
        "I'd love to cuddle something soft and stuffed.",
        "Children sleep with this soft toy in their beds.",
        "This cuddly toy is often shaped like a small animal!"
      ]
    }
  : {
      '🍔': [
        "בא לי משהו עסיסי בין שתי פרוסות לחם!",
        "מתחשק לי קלאסיקת פסט-פוד טעימה.",
        "משהו עגול עם שכבות יהיה מושלם!"
      ],
      '🍕': [
        "אני רוצה משהו גבינתי ומחולק למשולשים!",
        "מאכל עגול שמחולק למשולשים נשמע טוב.",
        "נראה לי ארוחה איטלקית הערב!"
      ],
      '🍓': [
        "משהו אדום ומתוק עם זרעים קטנים יהיה מושלם.",
        "בא לי נשנוש ברי טעים!",
        "הפרי הזה בצורת לב ועסיסי!"
      ],
      '🍉': [
        "אני צריך משהו עסיסי עם גרעינים שחורים.",
        "פרי ירוק מבחוץ ואדום מבפנים ירענן אותי.",
        "חם לי, אני צריך משהו שירווה!"
      ],
      '🍇': [
        "אני חושב על משהו שבא באשכולות קטנים סגולים או ירוקים.",
        "הכדורים המתוקים האלו גדלים על גפנים.",
        "מזה מכינים מיץ ויין!"
      ],
      '🍫': [
        "משהו חום ומתוק יעשה את העבודה.",
        "מתחשק לי משהו שנמס ומיוצר מקקאו.",
        "חפיסת מתוק תהיה מושלמת!"
      ],
      '🍩': [
        "הייתי שמח למשהו עגול עם חור באמצע!",
        "טבעת מתוקה מכוסה גלייז נשמעת מעולה.",
        "מאפה בוקר פופולרי לקפה!"
      ],
      '🍪': [
        "מתחשק לי משהו עגול, שטוח ואפוי.",
        "עוגייה מתוקה עם שבבי שוקולד אולי?",
        "החברה הכי טובה של החלב!"
      ],

      '🌸': [
        "בא לי משהו ורוד ועדין עם עלי כותרת.",
        "הפרח היפה הזה פורח באביב.",
        "עצים של דובדבן מפיקים את הפריחה הורודה הזו!"
      ],
      '🌻': [
        "מחפש משהו גבוה, צהוב ובהיר.",
        "הפרח הזה עוקב אחרי השמש במשך היום.",
        "הוא גודל גבוה ויש בו גרעינים שאפשר לאכול!"
      ],
      '🌷': [
        "פרח אביב צבעוני שגדל מבצל יהיה נחמד.",
        "הפרח הזה פופולרי בהולנד ובא במגוון צבעים.",
        "יש לו גבעול יחיד ופריחה אחת."
      ],
      '🌹': [
        "בא לי מלכת הפרחים.",
        "הפרח האדום הרומנטי הזה עם קוצים.",
        "סמל אהבה שמגיע בשלל צבעים!"
      ],

      '🎉': [
        "רוצה לחגוג עם משהו שמתפוצץ קונפטי!",
        "הפריט החגיגי הזה יורה קונפטי כשמושכים אותו.",
        "משתמשים בזה במסיבות להפתעה רועשת!"
      ],
      '🎈': [
        "משהו שמרחף באוויר יהיה כיף!",
        "ממלאים את זה באוויר או בהליום למסיבות.",
        "אפשר לעצב אותו לצורות של חיות!"
      ],
      '🎁': [
        "אשמח למשהו עטוף בסרט מלמעלה.",
        "הפריט הזה מכיל הפתעה בפנים!",
        "ביומולדת נותנים כאלה כדי לפתוח!"
      ],
      '🎂': [
        "מתחשק לי משהו מתוק עם נרות למעלה.",
        "מבקשים משאלה וכבים את הנרות על זה.",
        "המאפה המתוק הזה חוגג עוד שנה!"
      ],

      '🐶': [
        "אשמח לראות חיה ידידותית שנובחת.",
        "חברו הטוב של האדם ישמח אותי!",
        "החיה הנאמנה הזו מכשכשת בזנב כשהיא שמחה."
      ],
      '🐱': [
        "מחפש חיה שמגרגרת עם שפם.",
        "החיה הזו אומרת מיאו ואוהבת עכברים.",
        "אומרים שיש לה תשע נשמות!"
      ],
      '🐰': [
        "חיה חמודה עם אוזניים ארוכות תהיה נהדרת.",
        "הפרווה הזו מקפצת ואוהבת גזרים.",
        "החיה הזו קשורה לחג הפסחא!"
      ],
      '🦄': [
        "אשמח לראות יצור סוסי קסום!",
        "לחיה המיתית הזו יש קרן אחת על המצח.",
        "סוס קשת-ענן קסום יעשה אותי שמח!"
      ],

      '⚽': [
        "בא לי לשחק במשהו עגול שצריך לבעוט בו.",
        "הכדור הזה משמש בספורט הפופולרי בעולם.",
        "הכדור השחור-לבן הזה מיועד למשחק עם הרגליים!"
      ],
      '📱': [
        "מחפש משהו שמשתמשים בו לשיחות והודעות.",
        "המכשיר הזה נכנס בכיס ומריץ אפליקציות.",
        "כנראה שאתה קורא את זה עליו עכשיו!"
      ],
      '🚗': [
        "רוצה לראות משהו עם גלגלים שלוקח אותך ממקום למקום.",
        "לרכב הזה יש ארבעה גלגלים והגה.",
        "לרוב המשפחות יש אחד כזה לנסיעות!"
      ],
      '🧸': [
        "אשמח לחבק משהו רך וממולא.",
        "ילדים ישנים עם הצעצוע הרך הזה במיטה.",
        "הצעצוע החמוד הזה בדרך כלל בצורת חיה קטנה!"
      ]
    };


  // Helper function to get mood description
  const getMoodDescription = (level) => {
    const moods = {
      10: 'ecstatic',
      9: 'very happy',
      8: 'happy',
      7: 'neutral',
      6: 'slightly worried',
      5: 'anxious',
      4: 'sad',
      3: 'angry',
      2: 'very angry',
      1: 'crying'
    };
    return moods[level] || 'neutral';
  };

  // Update startGame to better initialize mood based on emoji count
  const startGame = async (creatureName, emojiCount, selectedLanguage) => {
    try {
      // Reset logs for new game
      setGameLogs([]);
      
      addGameLog('GAME_START', {
        creatureName,
        emojiCount,
        language: selectedLanguage
      });

      
      console.log('🎮 Starting new game...');
      
      // Update language if specified
      if (selectedLanguage) {
        setLanguage(selectedLanguage);
      }
      
      // Select random category and specific emoji FIRST
      const categories = Object.keys(allEmojis);
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const categoryEmojis = allEmojis[randomCategory];
      const randomEmoji = categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
      
      // Initialize with maximum happiness
      const initialMood = 10;
      console.log('🎭 Setting initial mood:', initialMood);
      setMoodLevel(initialMood);
      setCreatureMood('happy');
      
      // Now create game state with the already selected randomCategory
      const newGameState = await GameState.create({
        creature_name: creatureName,
        task_type: randomCategory,
        success_count: 0,
        target_count: 3,
        is_completed: false,
        initial_emoji_count: emojiCount,
        total_blobs: 1,
        mood_level: initialMood,
        isGPT: 'false',
        isRtl: isRtl,
        available_messages: 1
      });

      setGameState(newGameState);
      console.log('📊 Initial game state:', newGameState);
      
      // Initialize creature position in the center of game area
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const initialPosition = {
          x: rect.width / 2,
          y: rect.height / 2
        };
        console.log('🎯 Setting initial position:', initialPosition);
        setCreaturePosition(initialPosition);
      }
      
      // Select a random hint for the emoji
      const hints = emojiHints[randomEmoji] || [t.genericHint || "I'm feeling hungry for something special!"];
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      
      // Safe text replacement for greeting message
      const greeting = (t.greeting || "Hi! I'm {name}.").replace('{name}', creatureName);
      const helpRequest = t.helpRequest || "Can you help me find me?";
      
      // Add initial creature message with hint
      setMessages([{
        sender: 'creature',
        text: `${greeting} ${randomHint} ${helpRequest}`
      }]);

      saveBlobMessage(newGameState.id, `${greeting} ${randomHint} ${helpRequest}`);

      setRemainingEmojis(emojiCount);
      setSpecificTargetEmoji(randomEmoji);
      setAvailableMessages(1);
      setBlobs([]);
      setActiveBlob({
        id: Date.now(),
        name: creatureName,
        targetEmoji: randomEmoji,
        mood: 10
      });
      
      // Reset vomit zones when starting a new game
      setVomitZones([]);
      setIsMovingToEmoji(false);
      setMoveTarget(null);

      setAvailableMessages(1);
      
      setShowStartModal(false);
    } catch (error) {
      addGameLog('ERROR', { message: error.message });
      console.error("❌ Error starting game:", error);
    }
  };

  // Add emoji management functions
  const removeEmoji = (emojiId) => {
    setEmojis(prev => prev.filter(emoji => emoji.id !== emojiId));
    setEmojiPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[emojiId];
      return newPositions;
    });
  };

  const updateEmojiPosition = (emojiId, newPosition) => {
    setEmojiPositions(prev => ({
      ...prev,
      [emojiId]: newPosition
    }));
  };

  const clearEmojis = () => {
    setEmojis([]);
    setEmojiPositions({});
  };

  // Add message response functions
  const getResponseBasedOnMood = (message, currentMood, language) => {
    const responses = language === 'he' ? {
      happy: [
        "אני מרגיש נהדר! בוא נמצא את האוכל שלי!",
        "איזה כיף! אני מתרגש לחפש!",
        "יאללה, בוא נמצא משהו טעים!"
      ],
      neutral: [
        "אוקיי, אני אנסה ללכת לשם...",
        "בסדר, נראה מה יש שם",
        "אולי נמצא משהו בכיוון הזה"
      ],
      sad: [
        "אני לא בטוח... אבל אנסה",
        "אני קצת עצוב, אבל נמשיך לחפש",
        "אולי זה יעזור לי להרגיש יותר טוב"
      ]
    } : {
      happy: [
        "I feel great! Let's find my food!",
        "This is fun! I'm excited to search!",
        "Yay, let's find something tasty!"
      ],
      neutral: [
        "Okay, I'll try going there...",
        "Alright, let's see what's there",
        "Maybe we'll find something that way"
      ],
      sad: [
        "I'm not sure... but I'll try",
        "I'm a bit sad, but let's keep looking",
        "Maybe this will help me feel better"
      ]
    };

    const moodCategory = currentMood >= 7 ? 'happy' : currentMood >= 4 ? 'neutral' : 'sad';
    const moodResponses = responses[moodCategory];
    return moodResponses[Math.floor(Math.random() * moodResponses.length)];
  };

  const calculateAngleFromMessage = (message) => {
    message = message.toLowerCase();
    
    // Default random angle if no direction is found
    let angle = Math.random() * 360;

    // Check for directional words
    if (message.includes('right')) angle = 0;
    else if (message.includes('left')) angle = 180;
    else if (message.includes('up') || message.includes('top')) angle = 270;
    else if (message.includes('down') || message.includes('bottom')) angle = 90;
    else if (message.includes('topleft') || message.includes('top left')) angle = 225;
    else if (message.includes('topright') || message.includes('top right')) angle = 315;
    else if (message.includes('bottomleft') || message.includes('bottom left')) angle = 135;
    else if (message.includes('bottomright') || message.includes('bottom right')) angle = 45;

    // Add some randomness to the angle
    return angle + (Math.random() * 30 - 15);
  };

  const getMovementDescription = (message, language) => {
    message = message.toLowerCase();
    
    if (language === 'he') {
      if (message.includes('ימינה')) return 'הולך ימינה...';
      if (message.includes('שמאלה')) return 'הולך שמאלה...';
      if (message.includes('למעלה')) return 'הולך למעלה...';
      if (message.includes('למטה')) return 'הולך למטה...';
      return 'הולך לחפש...';
    } else {
      if (message.includes('right')) return 'Going right...';
      if (message.includes('left')) return 'Going left...';
      if (message.includes('up')) return 'Going up...';
      if (message.includes('down')) return 'Going down...';
      return 'Looking around...';
    }
  };

  const startSmoothMovementByAngle = (angle, thoughtBubble) => {
    if (!gameAreaRef.current) return;

    const radians = angle * (Math.PI / 180);
    const moveX = Math.cos(radians);
    const moveY = Math.sin(radians);

    setThoughtText(thoughtBubble);
    setShowThoughtBubble(true);
    setIsMoving(true);

    let moveInterval = setInterval(() => {
      setCreaturePosition(prev => {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const newX = prev.x + moveX * 2;
        const newY = prev.y + moveY * 2;

        return {
          x: Math.max(50, Math.min(rect.width - 50, newX)),
          y: Math.max(50, Math.min(rect.height - 50, newY))
        };
      });
    }, 16);

    setTimeout(() => {
      clearInterval(moveInterval);
      setIsMoving(false);
      setShowThoughtBubble(false);
    }, 2000 + Math.random() * 1000);
  };

  // Add the missing sendMessage function
  const sendMessage = async (messageText) => {
    if (availableMessages <= 0) {
      return;
    }

    // Log the user message
    addGameLog('USER_MESSAGE', {
      text: messageText
    });
    


    // Add user message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: messageText
    }]);

    // Decrease available messages
    setAvailableMessages(prev => Math.max(0, prev - 1));

    // Process the message for directional cues
    const angle = calculateAngleFromMessage(messageText);
    const movementDescription = getMovementDescription(messageText, language);
    const moodBasedResponse = getResponseBasedOnMood(messageText, moodLevel, language);

    const promptContext = {
      blobHistory: getBlobHistory(gameState?.id),
      targetEmoji: specificTargetEmoji,
      mood: moodLevel,
      position: creaturePosition,
      boardSize: {
        width: gameAreaRef.current?.offsetWidth || 800,
        height: gameAreaRef.current?.offsetHeight || 600
      },
      remainingEmojis: remainingEmojis,
      creatureName: gameState?.creature_name
    };
    

    // Start creature movement
    startSmoothMovementByAngle(angle, movementDescription);

    // Brief pause before blob response
    if (!isUsingGPT) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'creature',
          text: moodBasedResponse
        }]);
    
        addGameLog('BLOB_RESPONSE', {
          text: moodBasedResponse,
          mood: getMoodDescription(moodLevel),
          direction: angle
        });
      }, 1500);
    }

    // If using GPT, call AI response
    if (isUsingGPT && apiKey) {
      try {
        // AI response logic would go here
        console.log("✅ isUsingGPT:", isUsingGPT);
        const generateSystemPrompt = language === 'he' ? generatePromptHE : generatePromptEN;
        const systemPrompt = generateSystemPrompt(promptContext);

        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4",
            // model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: messageText }
            ]
          })
        });

        const data = await openaiResponse.json();
        console.log("OpenAI Response:", data);
        console.log('RAW: ', JSON.stringify(data.choices[0].message, null, 2));
        console.log('Full System Prompt:', systemPrompt);
        console.log('User Message:', messageText);

        if (data?.choices?.[0]?.message?.content) {
          const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            if (typeof parsed.angle === "number") {
              startSmoothMovementByAngle(parsed.angle, parsed.thoughtBubble || "Let's go!");
            }

            setMessages(prev => [...prev, {
              sender: 'creature',
              text: parsed.message || "Hmm...",
              built: true
            }]);

            addGameLog('BLOB_AI_RESPONSE', parsed);
            saveBlobMessage(gameState.id, parsed.message || "Hmm..."); 
          }
        }
      } catch (error) {
        console.error('Error with AI response:', error);
      }
    }
  };

  // Cleaning vomit mode
  useEffect(() => {
    if (isCleanUpMode) {
      document.body.style.cursor = 'url(/static/images/sponge_bob_holding_a_sponge.png), auto'; 
    } else {
      document.body.style.cursor = 'default';
    }
  }, [isCleanUpMode]);

  // Cleaning vomit mode mode off when no vomits
  useEffect(() => {
    if (isCleanUpMode && vomitZones.length === 0) {
      setIsCleanUpMode(false);
    }
  }, [vomitZones]);
  


  // Add mood tracking effect
  useEffect(() => {
    console.log('🎭 Mood Level Changed:', moodLevel, 'Description:', getMoodDescription(moodLevel));
  }, [moodLevel]);

  // Add position logging effect
  // useEffect(() => {
    // const logPositions = () => {
    //   console.log('🤖 Creature location:', {
    //     x: Math.round(creaturePosition.x),
    //     y: Math.round(creaturePosition.y)
    //   });
      
    //   // Log all emoji positions
    //   const emojiList = emojis.map(emoji => ({
    //     id: emoji.id,
    //     symbol: emoji.symbol,
    //     position: emojiPositions[emoji.id] ? {
    //       x: Math.round(emojiPositions[emoji.id].x),
    //       y: Math.round(emojiPositions[emoji.id].y)
    //     } : null
    //   }));
      
    //   console.log('📍 Current emojis:', emojiList);
    // };

    // const loggingInterval = setInterval(logPositions, 5000);
    
    // Log immediately on mount/changes
    // logPositions();
    
    // return () => clearInterval(loggingInterval);
  // }, [creaturePosition.x, creaturePosition.y, emojis, emojiPositions]);

  // Completely revamp collision detection
  const checkEmojiProximity = () => {
    if (!gameAreaRef.current || emojis.length === 0 || isEating) {
      // console.log('⚠️ Skipping collision check:', { 
      //   hasGameArea: !!gameAreaRef.current, 
      //   emojiCount: emojis.length, 
      //   isEating 
      // });
      return false;
    }
    
    // Much larger collision distance
    const collisionDistance = 100; // Increased significantly from 70
    
    // Debug current state
    // console.log('🔍 Checking collisions:', {
    //   blobX: Math.round(creaturePosition.x),
    //   blobY: Math.round(creaturePosition.y),
    //   emojiCount: emojis.length,
    //   isEating
    // });

    for (const emoji of emojis) {
      const emojiPos = emojiPositions[emoji.id];
      if (!emojiPos) {
        console.log('⚠️ Missing position for emoji:', emoji.id);
        continue;
      }
      
      const dx = creaturePosition.x - emojiPos.x;
      const dy = creaturePosition.y - emojiPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Detailed collision logging
      // console.log(`📏 Distance check for ${emoji.symbol}:`, {
      //   emojiId: emoji.id,
      //   distance: Math.round(distance),
      //   threshold: collisionDistance,
      //   blobPos: {
      //     x: Math.round(creaturePosition.x),
      //     y: Math.round(creaturePosition.y)
      //   },
      //   emojiPos: {
      //     x: Math.round(emojiPos.x),
      //     y: Math.round(emojiPos.y)
      //   }
      // });
      
      if (distance <= collisionDistance) {
        console.log('💥 COLLISION DETECTED!', {
          emoji: emoji.symbol,
          distance: Math.round(distance),
          position: emojiPos
        });

        // recordEvent({
        //   type: 'eat',
        //   name: gameState?.creature_name,
        //   emoji: eatenEmoji.symbol
        // });
        
        
        // Force immediate eating
        setTargetEmojiId(emoji.id);
        handleEatEmoji(emoji.id);
        return true;
      }
    }
    
    return false;
  };

  // Update handleEatEmoji to handle collision clearly
  

  // Modify movement effect to use requestAnimationFrame instead of setInterval
  useEffect(() => {
    if (!gameState || !gameAreaRef.current) return;

    let animationFrameId;
    let currentAngle = Math.random() * Math.PI * 2;
    const speed = 0.5;
    let lastLogTime = Date.now();
    let lastLoggedPosition = null;
    const positionChangeThreshold = 50; // Log every 50 pixels of movement

    const shouldLogPosition = (newPos) => {
      if (!lastLoggedPosition) return true;
      
      const dx = newPos.x - lastLoggedPosition.x;
      const dy = newPos.y - lastLoggedPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance >= positionChangeThreshold;
    };

    const updatePosition = () => {
      if (!isMoving && gameAreaRef.current) {
        const bounds = gameAreaRef.current.getBoundingClientRect();
        
        setCreaturePosition(prev => {
          const newX = prev.x + Math.cos(currentAngle) * speed;
          const newY = prev.y + Math.sin(currentAngle) * speed;

          const hitBoundary = 
            newX < 50 || 
            newX > bounds.width - 50 || 
            newY > bounds.height - 50 || 
            newY > bounds.height - 50;

          if (hitBoundary) {
            currentAngle = Math.random() * Math.PI * 2;
            addGameLog('BLOB_BOUNDARY_HIT', {
              position: { x: Math.round(newX), y: Math.round(newY) },
              newAngle: currentAngle
            });
          }

          const nextPosition = {
            x: Math.max(50, Math.min(bounds.width - 50, newX)),
            y: Math.max(50, Math.min(bounds.height - 50, newY))
          };

          if (shouldLogPosition(nextPosition)) {
            // addGameLog('BLOB_MOVED', {
            //   from: lastLoggedPosition,
            //   to: { x: Math.round(nextPosition.x), y: Math.round(nextPosition.y) }
            // });
            lastLoggedPosition = { ...nextPosition };
          }

          // Force collision check after position update
          setTimeout(checkEmojiProximity, 0);
          
          return nextPosition;
        });

        
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };
    
    // Start animation
    animationFrameId = requestAnimationFrame(updatePosition);
    
    // Direction changes
    const directionInterval = setInterval(() => {
      if (!isMoving) {
        currentAngle = Math.random() * Math.PI * 2;
      }
    }, 3000 + Math.random() * 2000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(directionInterval);
    };
  }, [gameState, isMoving]);
  
  // Check if position is within forbidden zone (Blob or vomit)
  const isInForbiddenZone = (x, y) => {
    // Check blob zone
    const dx = x - creaturePosition.x;
    const dy = y - creaturePosition.y;
    if (Math.sqrt(dx * dx + dy * dy) < 100) return true;
    
    // Check vomit zones
    for (const zone of vomitZones) {
      const vx = x - zone.x;
      const vy = x - zone.y;
      if (Math.sqrt(vx * vx + vy * vy) < 50) return true;
    }
    
    return false;
  };
  
  // Remove any other declarations of handleAddEmoji and keep only this one
  const handleAddEmoji = (emoji) => {
    if (!gameAreaRef.current || remainingEmojis <= 0) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const id = `emoji-${Date.now()}`;
    
    // Random position within game area, using relative coordinates
    const newX = 100 + Math.random() * (rect.width - 200);
    const newY = 100 + Math.random() * (rect.height - 200);
    
    addGameLog('EMOJI_PLACED', {
      id,
      emoji,
      position: { x: Math.round(newX), y: Math.round(newY) },
      remainingEmojis: remainingEmojis - 1
    });

    console.log('➕ Adding new emoji:', {
      id,
      symbol: emoji,
      position: { x: Math.round(newX), y: Math.round(newY) },
      gameArea: {
        width: rect.width,
        height: rect.height
      }
    });

    // Update both emojis and positions atomically
    setEmojis(prev => [...prev, { id, symbol: emoji }]);
    setEmojiPositions(prev => ({
      ...prev,
      [id]: { x: newX, y: newY }
    }));
    
    // Update remaining emojis and available messages
    setRemainingEmojis(prev => prev - 1);
    setAvailableMessages(prev => prev + 1);
  };
  
  // Single handleDragOver function
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
    
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDragPosition({ x, y });
      
      // Show forbidden zone if dragging over it
      setShowForbiddenZone(isInForbiddenZone(x, y));
    }
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setIsDraggingOver(false);
    setShowForbiddenZone(false);
  };
  
  // Modified handleDrop to ensure emoji state is properly updated
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setShowForbiddenZone(false);
    
    if (!gameAreaRef.current || remainingEmojis <= 0) return;
    
    try {
      const emoji = e.dataTransfer.getData('text/plain');
      if (!emoji) return;
      
      const rect = gameAreaRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;
      
      console.log('🎯 Dropping emoji at:', {
        x: Math.round(dropX),
        y: Math.round(dropY),
        symbol: emoji
      });
      
      // Check if drop position is in forbidden zone
      if (isInForbiddenZone(dropX, dropY)) {
        console.log('⛔ Drop location in forbidden zone');
        setWrongEmojiPosition({ x: dropX, y: dropY });
        setShowWrongEmojiX(true);
        setTimeout(() => setShowWrongEmojiX(false), 1000);
        return;
      }
      
      const id = `emoji-${Date.now()}`;
      
      // Update both emojis and positions atomically
      setEmojis(prev => [...prev, { id, symbol: emoji }]);
      setEmojiPositions(prev => ({
        ...prev,
        [id]: { x: dropX, y: dropY }
      }));
      
      setRemainingEmojis(prev => prev - 1);
      // Add one message for each emoji placed
      setAvailableMessages(prev => prev + 1);
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };
  
  // Improve handleEatEmoji with better animations and feedback
  

  

  // Add effect to check no emoji left condition
  useEffect(() => {
    console.log('🟡 Checking game over condition...');
    console.log('➡️ Remaining emojis to place:', remainingEmojis);
    console.log('➡️ Emojis on board:', emojis.length);
    console.log('➡️ Is game completed?', gameState?.is_completed);
  
    // const noEmojisLeftToPlace = remainingEmojis === 0;
    // const noEmojisOnBoard = emojis.length === 0;
    // const gameNotCompleted = gameState && !gameState.is_completed;
  
    if (remainingEmojis === 0 && emojis.length && !gameState.is_completed) {
      console.log('🚫 No emojis left and game not completed - triggering defeat modal');
      setShowDefeatModal(true);
    }
  }, [remainingEmojis, emojis.length, gameState]);

  // Simplify and fix collision detection with more aggressive parameters
  

  // Add more frequent collision checks
  useEffect(() => {
    if (!gameState || !gameAreaRef.current) return;
    
    const checkCollision = () => {
      if (emojis.length > 0 && !isEating) {
        checkEmojiProximity();
      }
    };

    // Check very frequently - every 16ms (approximately 60fps)
    const collisionInterval = setInterval(checkCollision, 16);
    
    // Additional position-based checks
    const positionCheckInterval = setInterval(() => {
      if (emojis.length > 0 && !isEating) {
        // Force check on regular intervals
        checkEmojiProximity();
      }
    }, 100);
    
    // Also check on any movement
    const moveCheckInterval = setInterval(() => {
      if (isMoving && emojis.length > 0 && !isEating) {
        checkEmojiProximity();
      }
    }, 50);

    return () => {
      clearInterval(collisionInterval);
      clearInterval(positionCheckInterval);
      clearInterval(moveCheckInterval);
    };
  }, [gameState, emojis, emojiPositions, creaturePosition, isMoving]);

  // Add effect to check remaining emojis and show defeat
  useEffect(() => {
    if (remainingEmojis === 0 && emojis.length === 0 && gameState && !gameState.is_completed) {
      console.log('Game Over: No emojis left!');
      
      // Update mood to very sad
      setMoodLevel(1);
      
      // Wait a moment to show the defeat animation before showing modal
      setTimeout(() => {
        // setShowDefeatModal(true);
      }, 2000);
    }
  }, [remainingEmojis, emojis.length, gameState]);

  // Simplify handleEatEmoji to ensure it works
  const handleEatEmoji = (emojiId) => {
    if (!emojiId || isEating || eatenEmojiIds.current.has(emojiId)) return;
  
    console.log('🍽️ Eating emoji with ID:', emojiId);
    eatenEmojiIds.current.add(emojiId); // prevent re-eating
    const eatenEmoji = emojis.find(emoji => emoji.id === emojiId);
    if (!eatenEmoji) return;
  
    setIsEating(true);
    setTargetEmojiId(emojiId);
    eatenEmojiIds.current.add(emojiId);
    
  
    const isCorrect = eatenEmoji.symbol === specificTargetEmoji;
    saveEatEvent(gameState.id, eatenEmoji.symbol, isCorrect); // ✅ רישום אכילה להיסטוריה

    // Save to history
    saveEatEvent(gameState.id, eatenEmoji.symbol, isCorrect);
  
    // Show thought bubble based on correctness
    setThoughtText(isCorrect ? t.eatingCorrect : t.wrongEmoji);
    setShowThoughtBubble(true);
  
    // Try play sound
    try {
      const sound = new Audio(isCorrect ? '/static/sounds/eating-sound.mp3' : '/static/sounds/wrong-emoji-sound.mp3');
      sound.play().catch(e => console.log("Sound error:", e));
    } catch (e) {}
  
    // Process result after animation
    setTimeout(() => {
      if (isCorrect) {
        const newSuccessCount = gameState.success_count + 1;
        const isCompleted = newSuccessCount >= gameState.target_count;
  
        GameState.update(gameState.id, {
          success_count: newSuccessCount,
          is_completed: isCompleted
        });
  
        setGameState(prev => ({
          ...prev,
          success_count: newSuccessCount,
          is_completed: isCompleted
        }));
  
        setMoodLevel(prev => Math.min(10, prev + 2));
  
        if (isCompleted) {
          setTimeout(() => setShowVictoryModal(true), 1000);
        }
      } else {
        const emojiPos = emojiPositions[emojiId];
  
        // Prevent duplicate vomit zones in the same area
        const alreadyExists = vomitZones.some(z =>
          Math.abs(z.x - emojiPos.x) < 10 && Math.abs(z.y - emojiPos.y) < 10
        );
  
        if (!alreadyExists) {
          setVomitZones(prev => {
            const dotCount = Math.floor(Math.random() * 7) + 1;
            const dots = Array.from({ length: dotCount }).map(() => ({
              cx: Math.random() * 100,
              cy: Math.random() * 100,
              r: Math.random() * 6 + 1
            }));
  
            return [
              ...prev,
              {
                id: Date.now() + Math.random(),
                x: emojiPos.x,
                y: emojiPos.y,
                timestamp: Date.now(),
                rotation: Math.floor(Math.random() * 360),
                scale: 0.9 + Math.random() * 0.3,
                dots
              }
            ];
          });
        }
  
        setMoodLevel(prev => Math.max(1, prev - 2));
  
        GameState.update(gameState.id, {
          wrong_emoji_count: (gameState.wrong_emoji_count || 0) + 1
        });
      }
  
      removeEmoji(emojiId);
      setShowThoughtBubble(false);
      setIsEating(false);
  
      if (remainingEmojis === 0 && emojis.length <= 1 ) {
        if (!gameState.is_completed) {
          setTimeout(() => setShowDefeatModal(true), 1500);
        }
      }
    }, 1000);
  };
  

  // Fix victory and defeat sound handling
  React.useEffect(() => {
    if (showVictoryModal) {
      try {
        const victorySound = new Audio('/static/sounds/victory-sound.mp3');
        victorySound.volume = 0.6;
        victorySound.play().catch(err => {
          console.log("🔊 Victory sound disabled or not supported");
        });
      } catch (e) {
        console.log("🔊 Audio creation failed");
      }
    } else if (showDefeatModal) {
      try {
        const defeatSound = new Audio('/static/sounds/defeat-sound.mp3');
        defeatSound.volume = 0.6;
        defeatSound.play().catch(err => {
          console.log("🔊 Defeat sound disabled or not supported");
        });
      } catch (e) {
        console.log("🔊 Audio creation failed");
      }
    }
  }, [showVictoryModal, showDefeatModal]);

  // Fix restartGame function to use gameAreaRef
  const restartGame = () => {
    if (!gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    setShowStartModal(true);
    setShowVictoryModal(false);
    setShowDefeatModal(false);
    setGameState(null);
    setEmojis([]);
    setEmojiPositions({});
    setMessages([]);
    setCreaturePosition({
      x: rect.width / 2,
      y: rect.height / 2
    });
    setTargetPosition(null);
    setTargetEmojiId(null);
    setRemainingEmojis(0);
    setCreatureMood('happy');
    setSpecificTargetEmoji(null);
    setVomitZones([]);
    setIsMovingToEmoji(false);
    setMoveTarget(null);
    setAvailableMessages(1);
    setMoodLevel(8);
    setBlobs([]);
  };

  // Function to get random target emoji
  const getRandomTargetEmoji = () => {
    const categories = Object.keys(allEmojis);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryEmojis = allEmojis[randomCategory];
    return categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
  };

  
  // Add continuous collision detection
  

  // Add effect to check emoji proximity during movement
  useEffect(() => {
    if (!isMoving || !gameState || !gameAreaRef.current) return;
    
    const movementInterval = setInterval(() => {
      if (checkEmojiProximity()) {
        // Found emoji nearby - clear movement interval
        clearInterval(movementInterval);
      }
    }, 200);
    
    return () => clearInterval(movementInterval);
  }, [isMoving, creaturePosition, emojis, emojiPositions]);

  // Update the chat interface to show available messages
  const renderHeader = () => (
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-bold text-white">{t.chatWith} {gameState?.creature_name}</h3>
      <div className="px-2 py-1 bg-white/20 rounded-full text-sm">
        {availableMessages} {availableMessages === 1 ? 'message' : 'messages'} left
      </div>
    </div>
  );

  // Update GameLogs component
  const GameLogs = () => {
    const scrollRef = useRef(null);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [gameLogs, emojis]);

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    };

    // Format position for display
    const formatPosition = (pos) => {
      if (!pos) return 'unknown';
      return `(${Math.round(pos.x)}, ${Math.round(pos.y)})`;
    };

    return (
      <div className="absolute bottom-4 right-4 w-96 h-96 bg-black/80 rounded-xl border-2 border-white/20 text-white overflow-hidden">
        <div className="p-2 bg-white/10 font-bold flex justify-between items-center">
          <span>Game Logs</span>
          <div className="text-xs">
            Blob pos: {formatPosition(creaturePosition)}
          </div>
        </div>
        
        {/* Emoji Positions Section */}
        <div className="p-2 border-b border-white/20 bg-white/5">
          <div className="text-xs font-mono">
            <div className="font-bold mb-1">Active Emojis:</div>
            {emojis.map((emoji, index) => (
              <div key={emoji.id} className="flex justify-between items-center text-gray-300">
                <span>{emoji.symbol}</span>
                <span>{formatPosition(emojiPositions[emoji.id])}</span>
              </div>
            ))}
            {emojis.length === 0 && (
              <div className="text-gray-500 italic">No emojis on playground</div>
            )}
          </div>
        </div>

        {/* Game Logs Section */}
        <div 
          ref={scrollRef} 
          className="p-2 h-[calc(100%-120px)] overflow-y-auto text-xs font-mono"
        >
          {gameLogs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-400">[{formatTime(log.timestamp)}]</span>
              {' '}
              <span className="text-yellow-400">{log.action}</span>
              {' '}
              <span className="text-gray-300">{JSON.stringify(log.details)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Add GameLogs component to the render
  return (
    <div className="fixed inset-0 overflow-hidden p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={isCleanUpMode ? 'cursor-clean' : ''}></div>
      <div className="w-full h-full p-2 sm:p-5 flex gap-4">
        {/* Chat Sidebar */}
        <div className="w-80 flex-shrink-0 h-full">
          <ChatBox
            messages={messages}
            onSendMessage={sendMessage}
            creatureName={gameState?.creature_name}
            translations={t}
            isRtl={isRtl}
            availableMessages={availableMessages}
          />
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Game Playground with Overlay Controls */}
          <div className="relative h-[75vh]">
            {/* Game Playground */}
            <div 
              ref={gameAreaRef}
              className="h-full w-full relative border-4 border-black bg-white rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <AnimatedBackground />
              
              {/* Overlay Controls - Minimalist */}
              <div className="absolute top-0 left-0 right-0 p-3 z-30">
                <div className="flex items-center gap-4">
                  {/* Title at top left */}
                  <div className="bg-white/80 backdrop-blur-sm border-2 border-black rounded-lg shadow-md p-2">
                    <h1 className="text-xl font-bold">{t.gameTitle}</h1>
                  </div>
                  
                  {/* Progress bar at top center */}
                  {gameState && (
                    <div className="flex-1 bg-white/80 backdrop-blur-sm border-2 border-black rounded-lg shadow-md p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t.progress}:</span>
                        <div className="flex-grow h-7 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                          <motion.div
                            className="h-full bg-[#4FACFE]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(gameState?.success_count / gameState?.target_count) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span className="text-sm font-medium">{gameState.success_count}/{gameState.target_count}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Controls at top right */}
                  {gameState && (
                    <div className="flex gap-2">
                      <div className="bg-white/80 backdrop-blur-sm border-2 border-black rounded-lg shadow-md p-2">
                        <motion.div
                          animate={{ scale: remainingEmojis <= 3 ? [1, 1.1, 1] : 1 }}
                          transition={{ repeat: remainingEmojis <= 3 ? Infinity : 0, duration: 0.5 }}
                          className={`px-2 py-1 rounded-full text-sm font-bold ${
                            remainingEmojis <= 3 ? 'bg-red-500 text-white' : 
                            remainingEmojis <= 7 ? 'bg-yellow-400 text-black' : 
                            'bg-green-400 text-black'
                          }`}
                        >
                          {remainingEmojis} {t.remainingEmojis}
                        </motion.div>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm border-2 border-black rounded-lg shadow-md p-2 flex gap-1">
                      <Button
                        disabled={vomitZones.length === 0}
                        onClick={() => {
                          // Toggle clean-up mode
                          if (isCleanUpMode || vomitZones.length === 0) {
                            setIsCleanUpMode(false);
                            console.log("🧹 Clean-up mode OFF");
                          } else {
                            setIsCleanUpMode(true);
                            console.log("🧽 Clean-up mode ON");
                          }
                        }}
                        className={`
                          h-8 px-2 text-xs font-bold hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]
                          ${vomitZones.length === 0 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-[#F6416C] hover:bg-[#E32B52]'}
                        `}
                      >
                        {t.clearEmojis}
                      </Button>
                        <Button 
                          onClick={restartGame}
                          className="bg-[#A259FF] hover:bg-[#8A41E8] h-8 px-2 text-xs font-bold hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                        >
                          {t.newGame}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Game Elements */}
              <div className="absolute inset-0">
                <AnimatePresence>
                  {emojis.map((emoji) => (
                    <FloatingEmoji
                      key={emoji.id}
                      emoji={emoji}
                      position={emojiPositions[emoji.id]}
                      onPositionUpdate={(id, pos) => updateEmojiPosition(id, pos)}
                      onRemove={removeEmoji}
                      gameAreaBounds={gameAreaRef.current?.getBoundingClientRect()}
                    />
                  ))}
                </AnimatePresence>

                {gameState && (
                  <FloatingCreature
                    position={creaturePosition}
                    targetPosition={targetPosition}
                    onEatEmoji={handleEatEmoji}
                    mood={moodLevel} // Pass moodLevel directly
                    gameAreaBounds={gameAreaRef.current?.getBoundingClientRect()}
                    isMoving={isMoving}
                    moveDirection={moveDirection}
                    isEating={isEating}
                    gameOver={remainingEmojis === 0 && emojis.length === 0 && !gameState.is_completed}
                  />
                )}
                
                {/* Thought Bubble */}
                <AnimatePresence>
                  {showThoughtBubble && (
                    <motion.div 
                      className="absolute z-30 pointer-events-none"
                      style={{
                        left: creaturePosition.x,
                        top: creaturePosition.y - 60,
                      }}
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative bg-white border-2 border-black rounded-xl p-2 shadow-md text-center max-w-[200px] mx-auto">
                        <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-r-2 border-b-2 border-black" />
                        <p className="text-sm font-medium">{thoughtText}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {cleanedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="absolute z-50 pointer-events-none"
                  style={{
                    left: msg.x,
                    top: msg.y,
                    transform: 'translate(-50%, -50%)',
                    animation: 'fadeOut 2s ease-in-out forwards'
                  }}
                >
                  <img src="/static/images/shining_cleaning_sparkle_droplets_splash.svg" alt="Thanks" width={80} height={80} />
                </div>
                ))}
                
                {/* Vomit Zones */}
                {vomitZones.map((zone) => (
                <div
                  key={`vomit-${zone.id}`}
                  className={`absolute z-10 ${isCleanUpMode ? 'rounded-full ring-1' : 'pointer-events-none'}`}
                  style={{
                    left: zone.x,
                    top: zone.y,
                    width: 100,
                    height: 100,
                    transform: 'translate(-50%, -50%)',
                    animation: 'slowWiggle 100s ease-in-out infinite',
                    animationDelay: '3s',
                    animationFillMode: 'both',
                    opacity: zone.opacity ?? 1
                  }}
                  onClick={() => {
                    if (!isCleanUpMode) return;

                    setVomitZones((prev) =>
                      prev
                        .map((z) => {
                          if (z.id !== zone.id) return z;

                          const newOpacity = (z.opacity ?? 1) - 0.25;

                          if (newOpacity <= 0) {
                            setMoodLevel((m) => Math.min(10, m + 1));
                            setAvailableMessages((a) => a + 1);
                              // 3. מיקום הספארקל (80px ימינה ו־80px למטה מהקיא)
                            setSparklePos({
                              x: zone.x + 80,
                              y: zone.y + 80
                            });
                            setShowCleanSparkle(true);
                            setTimeout(() => {
                              setShowCleanSparkle(false);
                              setSparklePos(null);
                            }, 2000);

                              // שליחת הודעה מהבלוב לשיחה
                            const thankYouMessage = language === 'he'
                              ? "תודה שניקית לי את השטח!"
                              : "Thanks for cleaning up the area!";
                              
                            setMessages(prev => [...prev, {
                              sender: 'creature',
                              text: thankYouMessage
                            }]);

                            // 4. עדכון היסטוריה
                            saveBlobMessage(gameState?.id, thankYouMessage);

                            // 5. הוצאת הזון מהמערך
                            return null;
                          }

                          return { ...z, opacity: newOpacity };
                        })
                        .filter(Boolean)
                    );
                  }}
                >
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <defs>
                      <radialGradient id={`vomit-gradient-${zone.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(185, 220, 35, 0.8)" />
                        <stop offset="70%" stopColor="rgba(141, 189, 37, 0.6)" />
                        <stop offset="100%" stopColor="rgba(141, 189, 37, 0)" />
                      </radialGradient>
                    </defs>
                    <path
                      d="M50,10 C70,15 80,30 85,45 C90,60 85,75 70,85 C55,95 35,90 20,80 C5,70 5,50 15,35 C25,20 40,15 50,10 Z"
                      fill={`url(#vomit-gradient-${zone.id})`}
                      transform={`rotate(${zone.rotation}, 50, 50)`}
                    />
                    {zone.dots.map((dot, i) => (
                      <circle
                        key={i}
                        cx={dot.cx}
                        cy={dot.cy}
                        r={dot.r}
                        fill="rgba(141, 189, 37, 0.8)"
                      />
                    ))}
                  </svg>
                </div>
              ))}

                {/* Toggle Log Panel Button */}
                {/* <button
                  onClick={() => setLogVisible(prev => !prev)}
                  className="absolute top-4 right-0 z-50 bg-black text-white px-2 py-1 text-xs rounded-l-xl shadow-lg hover:bg-gray-800"
                >
                  {logVisible ? '→' : '←'}
                </button> */}
              </div>
            </div>
          </div>

          {/* Emoji Selection Box */}
          <div className="h-[20vh] border-4 border-black rounded-xl bg-gradient-to-r from-green-100 to-green-200 shadow-[6px_6px_0px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="h-full overflow-y-auto">
              <EmojiTabs allEmojis={allEmojis} onSelectEmoji={handleAddEmoji} remainingEmojis={remainingEmojis} language={language} />
            </div>
          </div>
        </div>
      </div>
      {/* {logVisible && <GameLogs />} */}

      {/* Modals */}
      <StartGameModal 
        isOpen={showStartModal} 
        onStartGame={startGame}
        translations={t}
        language={language}
        onLanguageChange={(val) => {
          console.log('[GamePage] Language updated to', val);
          setLanguage(val);
        }}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        setIsUsingGPT={setIsUsingGPT}
      />

      <VictoryModal 
        isOpen={showVictoryModal} 
        onNewGame={restartGame} 
        creatureName={gameState?.creature_name}
        translations={t}
      />

      <DefeatModal 
        isOpen={showDefeatModal} 
        onNewGame={restartGame} 
        creatureName={gameState?.creature_name}
        translations={t}
        targetEmoji={specificTargetEmoji}
      />
    </div>
  );
}
