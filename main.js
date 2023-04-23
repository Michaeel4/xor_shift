const encryptedMessages1 = document.getElementById("binaryMessage");
const encryptedMessages = document.getElementById("binaryKey");
const encryptedResult = document.getElementById("binaryResult");
const encryptedMessageASCII = document.getElementById("encryptedMessageASCII");
const englishFrequencies = [
  0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228, 0.02015, 0.06094,
  0.06966, 0.00153, 0.00772, 0.04025, 0.02406, 0.06749, 0.07507, 0.01929,
  0.00095, 0.05987, 0.06327, 0.09056, 0.02758, 0.00978, 0.0236, 0.0015,
  0.01974, 0.00074
];

function xorEncrypt(message, key) {
  const messageEncoder = new TextEncoder();
  const keyEncoder = new TextEncoder();
  const encodedMessage = messageEncoder.encode(message);
  const encodedKey = keyEncoder.encode(key);

  let encryptedMessage = "";
  for (let i = 0; i < encodedMessage.length; i++) {
    encryptedMessage += String.fromCharCode(encodedMessage[i] ^ encodedKey[i % encodedKey.length]);
  }

  return encryptedMessage;
}

function encrypt() {
  console.log("called encrypt");
  const messageElement = document.getElementById("message");
  const keyElement = document.getElementById("key");
  const encryptedMessageElement = document.getElementById("encryptedMessage");

  const lastMessage = document.getElementById("lastMessage");
  const lastKey = document.getElementById("lastKey");
  const message = messageElement.value;
  const key = keyElement.value;
  if (message && key) {
    const encryptedMessage = xorEncrypt(message, key);
    const encryptedHex = encryptedMessage.split("").map(char => char.charCodeAt(0).toString(16)).join(" ");
    const encryptedASCII = encryptedMessage.split("").map(char => String.fromCharCode(char.charCodeAt(0))).join("");

    encryptedMessageElement.textContent = "Encrypted Message (Hexadecimal): " + encryptedHex;
    encryptedMessageASCII.textContent = "Encrypted Message (ASCII): " + encryptedASCII;

  } else {
    encryptedMessageElement.textContent = "Encrypted Message: No valid key available";
  }

  lastMessage.textContent = "Last Message: " + messageElement.value;
  lastKey.textContent = "Last Key: " + keyElement.value;

  messageElement.value = "";
  keyElement.value = "";
}
function shiftXOR(ciphertext, shift) {
    let coincidences = 0;
  
    for (let i = 0; i < ciphertext.length - shift; i++) {
      if (ciphertext[i] === ciphertext[i + shift]) {
        coincidences++;
      }
    }
  
    return coincidences / (ciphertext.length - shift);
  }
  
  function findKeyLength(ciphertext) {
    const shiftScores = [];
    const maxShift = Math.min(ciphertext.length, 40);
  
    for (let shift = 1; shift < maxShift; shift++) {
      const coincidenceIndex = shiftXOR(ciphertext, shift);
      shiftScores.push({
        shift,
        score: coincidenceIndex
      });
    }
  
    shiftScores.sort((a, b) => b.score - a.score);
    return shiftScores[0].shift;
  }
  
  function findCoincidence(ciphertext, shift) {
    let coincidence = 0;
    for (let i = 0; i < ciphertext.length - shift; i++) {
      if (ciphertext[i] === ciphertext[i + shift]) {
        coincidence++;
      }
    }
    return coincidence / (ciphertext.length - shift);
  }
  
  function findKeyLength(ciphertext) {
    const maxShift = 30; // Maximal zu prüfender Shift
    let bestShift = 1;
    let bestCoincidence = 0;
    for (let shift = 1; shift <= maxShift; shift++) {
      const coincidence = findCoincidence(ciphertext, shift);
      if (coincidence > bestCoincidence) {
        bestCoincidence = coincidence;
        bestShift = shift;
      }
    }
    return bestShift;
  }
  
  function xorDecrypt(ciphertext) {
    const keyLength = findKeyLength(ciphertext);
    const decryptedText = [];
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
  
    let key = "";
    for (let i = 0; i < keyLength; i++) {
      let bestScore = 0;
      let bestKeyChar = "";
      for (let j = 0; j < 256; j++) {
        const char = String.fromCharCode(j);
        const repeatedKey = char.repeat(ciphertext.length);
        const xorResult = xorEncrypt(ciphertext, repeatedKey);
  
        const xorResultScore = xorResult.split("").reduce((sum, char) => {
          const index = char.charCodeAt(0) - "A".charCodeAt(0);
          if (index >= 0 && index < englishFrequencies.length) {
            sum += englishFrequencies[index];
          }
          return sum;
        }, 0);
  
        if (xorResultScore > bestScore) {
          bestScore = xorResultScore;
          bestKeyChar = char;
        }
      }
      key += bestKeyChar;
    }
  
    const decryptedMessage = xorEncrypt(ciphertext, key);
    return decryptedMessage;
  }
  
  
  
  function crackXor() {
    console.log("called me");
    const messageToHackElement = document.getElementById("messageHack");
    const decryptedMessageElement = document.getElementById("decryptedMessage");
    const ciphertext = messageToHackElement.value;
    
    if (ciphertext) {
      const keyLength = findKeyLength(ciphertext);
      const decryptedMessage = xorDecrypt(ciphertext, keyLength);
      decryptedMessageElement.textContent = "Hacked Message: " + decryptedMessage;
    } else {
      decryptedMessageElement.textContent = "Hacked Message: No valid ciphertext available";
    }
  }
  