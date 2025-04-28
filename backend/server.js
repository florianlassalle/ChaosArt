import ollama from 'ollama'
import {generateRandomLetters} from "./generateur.js";
import fs from 'node:fs';
const randomLetters = generateRandomLetters();
// const response = await ollama.chat({
//   model: 'cas/ministral-8b-instruct-2410_q4km',
//   messages: [{ role: 'user', content: "Voici les notes obtenus par mes étudiants : alice : 18 ; mathieu : 8 ; Gregoire : 12 ; Natasha : 10 ; Henry : 16 ; Classe les dans l'ordre croissant de leurs notes et calcule la moyenne de la classe"
//      }],
// })

// const response = await ollama.chat({
//   model: 'cas/ministral-8b-instruct-2410_q4km',
//   messages: [{ role: 'user', content: "Voici une suite de lettre, essais de me trouver des mots en francais composés uniquement avec ces lettre, tu n'est pas obligé d'utiliser toutes les lettres : " + randomLetters 
//     + "procède par étape et vérifie que les mots existent bien et sont en langue francaise"
//     + "donne moi ta réponse au format : { reponse: string, mots: [mots1: string, mot2: string]}"
//      }],
// })
// const response = await ollama.chat({
//   model: 'nchapman/mistral-small-instruct-2409-abliterated',
//   messages: [{ role: 'user', content: "Here is a list of letters, find some words in english language that only use letters from this list, you can change the order of the letters or pick letters that are not adjacent, and you don't have to use all the letters : " + randomLetters 
//     + "give me your answer following this json template : { answer: string, words: [word1: string, word2: string]}"
//      }],
// })

let apiCall;
fs.readFile('./flux_dev_checkpoint.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  apiCall = JSON.parse(data);
  //console.log(data);
});

let reponseCorrecte = false;
let listeMots;
while (!reponseCorrecte) {
  const response = await ollama.chat({
    model: 'nchapman/mistral-small-instruct-2409-abliterated',
    messages: [{ role: 'user', content: "Here is a list of letters, find some words in english language that only use letters from this list :" + randomLetters 
      + "give me your answer following this json template : { answer: string, words: [word1: string, word2: string]}"
       }],
  });
  
  console.log(response.message.content);
  
  listeMots = decoderListeMots(response.message.content);
  //console.log("listeMots : " + JSON.stringify(listeMots));

  if (listeMots !== undefined) {
    reponseCorrecte = true;
  }  
}

const phrase = await ollama.chat({
  model: 'nchapman/mistral-small-instruct-2409-abliterated',
  messages: [{ role: 'user', content: "Here is a list of word, please make a coherent sentence with it " + JSON.stringify(listeMots)
     }],
});

console.log(phrase.message.content);

const prompt = await ollama.chat({
  model: 'nchapman/mistral-small-instruct-2409-abliterated',
  messages: [{ role: 'user', content: "Here is a sentence, please, make an optimized prompt for an image generation ai out of it" + phrase.message.content
     }],
});

console.log(prompt.message.content);

await callComfy(prompt.message.content);

function decoderListeMots(reponse) {

  let rawListeMots = reponse.split("```");
  rawListeMots.length > 1 ? rawListeMots = rawListeMots[1] : rawListeMots = reponse;
  let mots;
  //console.log("rawListeMots : " + rawListeMots);
  try {
    rawListeMots = rawListeMots.replaceAll('json', '');
  } catch (error) {
    
  }
  try {
    let json = JSON.parse(rawListeMots);
    mots = json.words;
  
  } catch (error) {
    console.log(error);
    
  }

  return mots;
  
}

async function callComfy(prompt) {
  prompt = decodePrompt(prompt);
  apiCall["6"]["inputs"]["text"] = prompt;
  apiCall["27"]["inputs"]["batch_size"] = 1;
  const finalPrompt = "{\"prompt\": " + JSON.stringify(apiCall) + "}";


  //console.log("definitive prompt : " + finalPrompt);
  const request = new Request("http://127.0.0.1:8188/prompt", {
    method: "POST",
    body: finalPrompt,
  });
  
  const response1 = await fetch(request);
  const jsonReponse = await response1.json();
  console.log("reponse : " + JSON.stringify(jsonReponse));

  const request2 = new Request("http://127.0.0.1:8188//history/"+, {
    method: "POST",
    body: finalPrompt,
  });
  
  const response1 = await fetch(request);
  const jsonReponse = await response1.json();
  console.log("reponse : " + JSON.stringify(jsonReponse));
}

function decodePrompt(prompt) {
  prompt = prompt.replaceAll("\"", "");
  let promptSplited = prompt.split("**Prompt:**");
  promptSplited.length > 1 ? prompt = promptSplited[1] : null;
  prompt = prompt.replaceAll("\n", "");

  console.log("prompt decodé : " + prompt);
  return prompt;
}