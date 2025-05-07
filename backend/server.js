import ollama from 'ollama'
import {generateRandomLetters} from "./generateur.js";
import fs from 'node:fs';
import { json } from 'node:stream/consumers';
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
const comfyAdress = "http://0.0.0.0:8188";
fs.readFile('./flux_dev_checkpoint.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  apiCall = JSON.parse(data);
  //console.log(data);
});

const imageData = {};
imageData.randomLetters = generateRandomLetters();

imageData.listeMots = await genereMots(imageData.randomLetters);

imageData.phrase = await generePhrase(imageData.listeMots);

imageData.prompt = await genererPrompt(imageData.phrase);

imageData.promptId = await callComfy(imageData.prompt);

//await callComfyWebSocket(imageData.promptId);

await attenteFinGeneration();

await recupererImageHistorique(imageData);

await writeFile(imageData);


async function genererPrompt(phrase) {
  const prompt = await ollama.chat({
    model: 'nchapman/mistral-small-instruct-2409-abliterated',
    messages: [{
      role: 'user', content: "Here is a sentence, please, make an optimized prompt for an image generation ai out of it" + phrase
    }],
  });

  console.log(prompt.message.content);
  return prompt.message.content;
}

async function generePhrase(listeMots) {
  const phrase = await ollama.chat({
    model: 'nchapman/mistral-small-instruct-2409-abliterated',
    messages: [{
      role: 'user', content: "Here is a list of word, please make a coherent sentence with it " + JSON.stringify(listeMots)
    }],
  });

  console.log(phrase.message.content);
  return phrase.message.content;
}

async function genereMots(randomLetters) {
  let reponseCorrecte = false;
  let listeMots;
  console.log("prompt generation mots : " + "Here is a list of letters, find some words in english language that only use letters from this list :" + randomLetters
          + "give me your answer as a json /no_think");
  while (!reponseCorrecte) {
    const response = await ollama.chat({
      model: 'qwen3:30b-a3b',
      messages: [{
        role: 'user', content: "Here is a list of letters, find some words in english language that only use letters from this list :" + randomLetters
          + "give me your answer as a json /no_think"
      }],
    });

    console.log(response.message.content);

    listeMots = decoderListeMots(response.message.content);
    //console.log("listeMots : " + JSON.stringify(listeMots));
    if (listeMots !== undefined) {
      reponseCorrecte = true;
    }
  }
  return listeMots;
}

function decoderListeMots(reponse) {

  let rawListeMots = reponse.split("```");
  rawListeMots.length > 1 ? rawListeMots = rawListeMots[1] : rawListeMots = reponse;
  let mots;
  //console.log("rawListeMots : " + rawListeMots);
  try {
    rawListeMots = rawListeMots.replaceAll('json', '');
    rawListeMots = rawListeMots.replaceAll('<think>', '');
    rawListeMots = rawListeMots.replaceAll('</think>', '');
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

async function callComfyWebSocket(promptId) {
  const server_address = "127.0.0.1:8188"
  //const client_id = str(uuid.uuid4())
  const socket = new WebSocket("ws://127.0.0.1:8188/ws?clientId=0");

  // Executes when the connection is successfully established.
  socket.addEventListener('open', event => {
    console.log('WebSocket connection established!');
    // Sends a message to the WebSocket server.
    //socket.send('http://127.0.0.1:8188/history');
    let generationPasFinie = true;
    while (generationPasFinie){
      out = socket.recv();
      if (out){
        console.log("out socket : " + out);
        const message = JSON.parse(out);
        if (message['type'] === 'executing' && message['data']['prompt_id']){
          console.log("prompt id recut : " + message['data']['prompt_id'] + "prompt id envoyé : " + promptId);
        }
      }
    }
  
  });
}

async function callComfy(prompt) {
  prompt = decodePrompt(prompt);
  apiCall["6"]["inputs"]["text"] = prompt;
  apiCall["27"]["inputs"]["batch_size"] = 1;
  const finalPrompt = "{\"prompt\": " + JSON.stringify(apiCall) + "}";


  //console.log("definitive prompt : " + finalPrompt);
  const request = new Request(comfyAdress + "/prompt", {
    method: "POST",
    body: finalPrompt,
  });
  
  const response1 = await fetch(request);
  const jsonReponse = await response1.json();
  const promptId = jsonReponse.prompt_id;
  console.log("reponse : " + JSON.stringify(jsonReponse));


  const requestPrompts = new Request(comfyAdress + "/prompt", {
    method: "GET",
  });
  
  const responsePrompts = await fetch(requestPrompts);
  const jsonReponsePrompts = await responsePrompts.json();
  console.log("reponse prompts : " + JSON.stringify(jsonReponsePrompts));

  return promptId;

}

async function attenteFinGeneration(){
  let generationTerminee = false;
  while (!generationTerminee) {
    await sleep(50000);

      const requestPrompts = new Request(comfyAdress + "/prompt", {
        method: "GET",
      });
      
      const responsePrompts = await fetch(requestPrompts);
      const jsonReponsePrompts = await responsePrompts.json();
      console.log("reponse prompts : " + JSON.stringify(jsonReponsePrompts));

      if (jsonReponsePrompts.exec_info.queue_remaining == 0) {
        generationTerminee = true;
      }
  }


}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function recupererImageHistorique(imageData) {
  const requestHistory = new Request(comfyAdress + "/history", {
    method: "GET",
  });

  const responseHistory = await fetch(requestHistory);
  const jsonReponseHistory = await responseHistory.json();
  //imageData.imageName = jsonReponseHistory.imageData.promptId
  console.log("reponse history : " + JSON.stringify(jsonReponseHistory));
  for (const property in jsonReponseHistory) {
    if (property === imageData.promptId){
      console.log("prompt : " + jsonReponseHistory[property]["prompt"][2]["6"]["inputs"]["text"]);
      imageData.imageName = jsonReponseHistory[property]["outputs"]["9"]["images"][0].filename;
      console.log("filename : " + imageData.imageName);
    }
  }
}

function decodePrompt(prompt) {
  prompt = prompt.replaceAll("\"", "");
  let promptSplited = prompt.split("**Prompt:**");
  promptSplited.length > 1 ? prompt = promptSplited[1] : null;
  prompt = prompt.replaceAll("\n", "");

  console.log("prompt decodé : " + prompt);
  return prompt;
}

function writeFile(imageData) {
  fs.writeFile('./outputs/'+ imageData.imageName.replaceAll("_.png","") + ".txt", JSON.stringify(imageData), err => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
    }
  });}