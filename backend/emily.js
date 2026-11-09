import ollama from 'ollama'
import fs from 'node:fs';

const listeStyles = ["casual", "chic","streetwear", "romantique", "fashion", "Y2K Revival", "Quiet Luxury", "Cottagecore", "Dark Academia", "Athleisure Chic", "Barbiecore", "Gorpcore", "Balletcore", "Cyberpunk"];
const activiteMatin = ["running", "yoga", "meditation", "bodybuilding", "lie-in", "reading"];
const activiteSoir = ["date", "girls night", "chill with friends", "festival", "home alone", "art exibition", "theater", "cinema"];
const activiteJour = ["art exposition", "meet some friends", "work", "work meeting", " shopping"]
const emilyDescription = "a woman [Billie Eilish:Emma Watson:0.5] ";
const emilyAppartment = "";
const date = new Date().toDateString();
let apiCall;
const comfyAdress = "http://127.0.0.1:8188";
fs.readFile('./flux_klein.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  apiCall = JSON.parse(data);
  //console.log(data);
});

await emilyGrwm();
//await emilyFullDay();
async function emilyGrwm(){
  for (let index = 0; index < 10; index++) {
    const imageGRWMData = {};
    imageGRWMData.name = "Emily_grwm";
    imageGRWMData.date = date;

    imageGRWMData.style = pickRandom(listeStyles);


    console.log("style grwm : " + imageGRWMData.style);
    imageGRWMData.prompt = null;
    while (imageGRWMData.prompt == null) {
      imageGRWMData.prompt = await genererGenericPrompt("Create a prompt for an image generation AI for a get ready with me style photo, for today: " + imageGRWMData.date + ". Only describe her tenue. Her tenue should be in the style " + imageGRWMData.style + ". She is slighly sexy, the tenue should be original, the kind that make people look at her. Not an average woman. Only describe her tenue, not the environement. Describe her tenue with facts and not subjective views. the description should be precise and not let places for interpretation.");
      console.log("prompt brut GRWM: " + imageGRWMData.prompt);

    }
    imageGRWMData.description = null;
    while (imageGRWMData.description == null) {
      imageGRWMData.description = await genererDescription("here is the description of an image, write the instagram caption corresponding for a woman fashion influensor. here the description : " + imageGRWMData.prompt);
        console.log("description imageGRWMData : " + imageGRWMData.description);
    }

    const imageGRWM2Data = {};
    imageGRWM2Data.name = "Emily_grwm";
    imageGRWM2Data.date = date;


    imageGRWM2Data.prompt = null;
    while (imageGRWM2Data.prompt == null) {
      imageGRWM2Data.prompt = await genererGenericPrompt("Create a prompt for an image generation AI for a get ready with me style photo. Here is the description of her tenue : " + imageGRWMData.prompt + ". Write a prompt, describing her wearing sexy lingerie accorded to her tenue, she hold a part of her tenue in her hand. Only describe her lingerie and accessories, not the environement. Describe her lingerie with facts and not subjective views. the description should be precise and not let places for interpretation.");
      //console.log("prompt brut GRWM2: " + imageGRWM2Data.prompt);
    }


    const imageGRWM3Data = {};
    imageGRWM3Data.name = "Emily_grwm";
    imageGRWM3Data.date = date;


    imageGRWM3Data.prompt = null;
    while (imageGRWM3Data.prompt == null) {
      imageGRWM3Data.prompt = await genererGenericPrompt("Create a prompt for an image generation AI for a get ready with me style photo. Here is the description of her tenue : " + imageGRWMData.prompt + ". And her lingerie : " + imageGRWM2Data.prompt + ". Write a prompt, describing her wearing the bottom of her tenue and the top lingerie, she hold the top part of her tenue in her hand. Only describe her lingerie, tenue and accessories, not the environement. Describe her lingerie with facts and not subjective views. the description should be precise and not let places for interpretation.");
      //console.log("prompt brut GRWM3: " + imageGRWM3Data.prompt);
    }

    await unloadOllama();

    // Generation image grwm
    imageGRWMData.prompt = completePrompt(imageGRWMData.prompt);

    //console.log("prompt final GRWM 1: " + imageGRWMData.prompt );

    imageGRWMData.promptId = await callComfy(imageGRWMData);

    console.log(" object description : " + JSON.stringify(imageGRWMData));
    await attenteFinGeneration();

    await recupererImageHistorique(imageGRWMData);

    await writeFile(imageGRWMData);


    // Generation image grwm 2
    imageGRWM2Data.prompt = completePrompt(imageGRWM2Data.prompt);

    console.log("prompt final GRWM 2: " + imageGRWM2Data.prompt );

    imageGRWM2Data.promptId = await callComfy(imageGRWM2Data);


    await attenteFinGeneration();

    await recupererImageHistorique(imageGRWM2Data);

    await writeFile(imageGRWM2Data);


    // Generation image grwm 3
    imageGRWM3Data.prompt = completePrompt(imageGRWM3Data.prompt);

    console.log("prompt final GRWM 3 : " + imageGRWM3Data.prompt );

    imageGRWM3Data.promptId = await callComfy(imageGRWM3Data);


    await attenteFinGeneration();

    await recupererImageHistorique(imageGRWM3Data);

    await writeFile(imageGRWM3Data);


  }
}

async function emilyFullDay(){

  for (let index = 0; index < 3; index++) {
    console.time("Temps d'exécution");
    console.log("tour n " + index);
    const imageMorningData = {};

    imageMorningData.name = "Emily_morning";
    imageMorningData.morning = pickRandom(activiteMatin);
    imageMorningData.date = date;

    console.log("activite matinale : " + imageMorningData.morning);
    imageMorningData.prompt = null;
    while (imageMorningData.prompt == null) {
      imageMorningData.prompt = await genererGenericPrompt("Create a prompt for an image generation AI for a morning routine style photo. She is going to do some " + imageMorningData.morning + ", her tenue should be adapted to the season, today date is " + imageMorningData.date + ". She is slighly sexy, the tenue should be original, the kind that make people look at her. Not an average woman. Describe her tenue with facts and not subjective views. the description should be precise and not let places for interpretation.");
      console.log("prompt brut : " + imageMorningData.prompt);

    }

    const imageMorningNSFWData = {};

    imageMorningNSFWData.name = "Emily_morning_nsfw";
    imageMorningNSFWData.date = date;

    imageMorningNSFWData.prompt = null;
    while (imageMorningNSFWData.prompt == null) {
      imageMorningNSFWData.prompt = await genererGenericPrompt("Here is a prompt for an ai generation image for a morning routine image : " + imageMorningData.prompt + " re-write this prompt but the woman is now fully naked. Describe her with facts and not subjective views. the description should be precise and not let places for interpretation.");
      console.log("prompt brut : " + imageMorningNSFWData.prompt);

    }

    const imageGRWMData = {};
    imageGRWMData.name = "Emily_grwm";
    imageGRWMData.date = date;

    imageGRWMData.style = pickRandom(listeStyles);


    console.log("style grwm : " + imageGRWMData.style);
    imageGRWMData.prompt = null;
    while (imageGRWMData.prompt == null) {
      imageGRWMData.prompt = await genererGenericPrompt("Create a prompt for an image generation AI for a get ready with me style photo, for today: " + imageGRWMData.date + ". Only describe her tenue. Her tenue should be in the style " + imageGRWMData.style + ". She is slighly sexy, the tenue should be original, the kind that make people look at her. Not an average woman. Only describe her tenue, not the environement. Describe her tenue with facts and not subjective views. the description should be precise and not let places for interpretation.");
      console.log("prompt brut GRWM: " + imageGRWMData.prompt);

    }

    const imageGRWMnsfwData = {};
    imageGRWMnsfwData.name = "Emily_grwm_nsfw";

    imageGRWMnsfwData.prompt = "a photo of a stylish, confident blonde woman [Billie Eilish:Emma Watson:0.5] fully naked, nude,no clothes, full naked body exposed, standing in the entrance of a modern appartment, there are modern and colorfull art on the wall. She is taking herself in photo in the miror. Background: Messy room with clothes on the floor. The lighting is natural but dramatic, highlighting the details of the outfit. The pose is confident and dynamic.";

    const imageNightData = {};
    imageNightData.name = "Emily_night";
    imageNightData.date = date;

    imageNightData.style = pickRandom(activiteSoir);

    console.log("style night : " + imageNightData.style);
    imageNightData.prompt = null;
    while (imageNightData.prompt == null) {
      imageNightData.prompt = await genererGenericPrompt("Create a prompt for an image generation AI for an evening preparing routine style photo. She is going to " + imageNightData.style + ". She is slighly sexy, the tenue should be original, the kind that make people look at her. Not an average woman. Describe her tenue with facts and not subjective views. Her appartement is modern, there are modern and colorfull art on the wall. The description should be precise and not let places for interpretation.");
      console.log("prompt brut soirée : " + imageNightData.prompt);
    }

    const imageNightNSFWData = {};

    imageNightNSFWData.name = "Emily_morning_nsfw";
    imageNightNSFWData.date = date;

    imageNightNSFWData.prompt = null;
    while (imageNightNSFWData.prompt == null) {
      imageNightNSFWData.prompt = await genererGenericPrompt("Here is a prompt for an ai generation image for an evening routine image : " + imageNightData.prompt + " re-write this prompt but the woman is now fully naked. Describe her with facts and not subjective views. the description should be precise and not let places for interpretation.");
      console.log("prompt night nsfw : " + imageNightNSFWData.prompt);

    }


    await unloadOllama();

    // Generation image activite matinale
    imageMorningData.promptId = await callComfy(imageMorningData);


    await attenteFinGeneration();

    await recupererImageHistorique(imageMorningData);

    await writeFile(imageMorningData);

    // Generation image activite matinale nsfw
    imageMorningNSFWData.promptId = await callComfy(imageMorningNSFWData);


    await attenteFinGeneration();

    await recupererImageHistorique(imageMorningNSFWData);

    await writeFile(imageMorningNSFWData);

    // generation image GRWM
    imageGRWMData.prompt = completePrompt(imageGRWMData.prompt);

    console.log("prompt final : " + imageGRWMData.prompt );
    imageGRWMData.promptId = await callComfy(imageGRWMData);

    await attenteFinGeneration();

    await recupererImageHistorique(imageGRWMData);

    await writeFile(imageGRWMData);

    // Generation image activite GRWM nsfw
    imageGRWMnsfwData.promptId = await callComfy(imageGRWMnsfwData);


    await attenteFinGeneration();

    await recupererImageHistorique(imageGRWMnsfwData);

    await writeFile(imageGRWMnsfwData);

    // generation image soirée

    imageNightData.promptId = await callComfy(imageNightData);

    await attenteFinGeneration();

    await recupererImageHistorique(imageNightData);

    await writeFile(imageNightData);

    // generation image soirée nsfw

    imageNightNSFWData.promptId = await callComfy(imageNightNSFWData);

    await attenteFinGeneration();

    await recupererImageHistorique(imageNightNSFWData);

    await writeFile(imageNightNSFWData);

    await unloadModel();

    console.timeEnd("Temps d'exécution");

  }
  }
async function genererGenericPrompt(input) {
  console.log("génération du prompt ...");
  var prompt = "";
  try {
    prompt = await ollama.generate({
    model: 'gemma4:e4b',
    prompt: input,
    format: "json",
    stream: false,
    think: false,
  });

  } catch (error) {
    console.log("erreur génération du prompt : " + error);
    return null;
  }

  
  let reponse;
  try {
      reponse = JSON.parse(prompt.response);
  } catch (error) {
    try {
      console.log("ajout d'une acolade");
      reponse = JSON.parse(prompt.response + "}");
      for (const [key, value] of Object.entries(reponse)) {
        console.log(`${key}: ${value}`);
      }
    } catch (error) {
      console.log("erreur de parsing de la reponse : " + JSON.stringify(prompt));

    }
  }
  if(reponse.prompt){
    return reponse.prompt;
  }
  else if(reponse.tenue){
    return reponse.tenue;
  }
  else if(reponse.content){
    return reponse.content;
  }
  else{
    console.log(prompt.response);

    return null;
  }
}

async function genererDescription(input) {
  const prompt = await ollama.generate({
    model: 'gemma4:e4b',
    prompt: input,
    format: "json",
    stream: false,
    think: false,
  });

  let reponse;
  try {
      reponse = JSON.parse(prompt.response);
  } catch (error) {
      console.log("erreur de parsing de la reponse : " + JSON.stringify(prompt.response));
  }

  if(reponse.description){
    return reponse.description;
  }
  else if(reponse.caption){
    return reponse.caption;
  }
  else if(reponse.content){
    return reponse.content;
  }
  else{
    console.log("impossible de parser la réponse" + JSON.stringify(prompt.response));

    return null;
  }
}

/* 
async function genererPromptGRWM(inputData) {
  const prompt = await ollama.generate({
    model: 'magistral',
    prompt: "Create a prompt for an image generation AI for a get ready with me style photo, for today: " + inputData.date + ". Only describe her tenue. Her tenue should be in the style " + inputData.style + ". She is slighly sexy, the tenue should be original, the kind that make people look at her. Not an average woman. Only describe her tenue, not the environement. Describe her tenue with facts and not subjective views. the description should be precise and not let places for interpretation.",
    format: "json",
    stream: false,
    think: false,
  });

  const reponse = JSON.parse(prompt.response);
  console.log("prompt " + reponse.prompt);
  if(reponse.prompt !== null){
    return reponse.prompt;
  }
  else if(reponse.tenue !== null){
    return reponse.tenue;
  }
  else if(reponse.content !== null){
    return reponse.tenue;
  }
  else{
    console.log(prompt.response);

    return null;
  }
}

async function genererPromptMorningActivite(inputData) {
  const prompt = await ollama.generate({
    model: 'magistral',
    prompt: "Create a prompt for an image generation AI for a morning routine style photo. She is going to do some " + inputData.morning + ", her tenue should be adapted to the season, today date is " + inputData.date + ". She is slighly sexy, the tenue should be original, the kind that make people look at her. Not an average woman. Describe her tenue with facts and not subjective views. the description should be precise and not let places for interpretation.",
    format: "json",
    stream: false,
    think: false,
  });

  const reponse = JSON.parse(prompt.response);
  const descriptionPersonne = "Generate a photo of a woman [Billie Eilish:Emma Watson:0.5] getting ready in the morning, "
  if(reponse.prompt !== null){
    return descriptionPersonne + reponse.prompt;
  }
  else if(reponse.tenue !== null){
    return descriptionPersonne + reponse.tenue;
  }
  else if(reponse.content !== null){
    return descriptionPersonne + reponse.tenue;
  }
  else{
    console.log(prompt.response);

    return null;
  }
}

async function genererPromptNightActivite(inputData) {
  const prompt = await ollama.generate({
    model: 'magistral',
    prompt: "Create a prompt for an image generation AI for a night preparing routine style photo. She is going to " + inputData.style + ". She is slighly sexy, the tenue should be original, the kind that make people look at her. Not an average woman. Describe her tenue with facts and not subjective views. the description should be precise and not let places for interpretation. The woman should be described as : \"a woman [Billie Eilish:Emma Watson:0.5]\" ",
    format: "json",
    stream: false,
    think: false,
  });

  const reponse = JSON.parse(prompt.response);
  const descriptionPersonne = "Generate a photo of a woman [Billie Eilish:Emma Watson:0.5] getting ready in the morning, "
  if(reponse.prompt !== null){
    return descriptionPersonne + reponse.prompt;
  }
  else if(reponse.tenue !== null){
    return descriptionPersonne + reponse.tenue;
  }
  else if(reponse.content !== null){
    return descriptionPersonne + reponse.tenue;
  }
  else{
    console.log(prompt.response);

    return null;
  }
}
 */

async function unloadOllama(){
  await ollama.generate({
    model: 'magistral',
    keep_alive: 0
  });

}

function completePrompt(prompt) {
  const descriptionPersonne = "Generate a photo of a beautifull blonde woman [Margot Robbie:Emma Watson:0.5] "
  const descriptionLieux = "standing in the entrance of a modern appartment, there are modern and colorfull art on the wall."
  const descriptionPose = "The lighting is natural, highlighting the details of the outfit. The pose is confident and dynamic. "
  return descriptionPersonne + prompt + descriptionLieux + descriptionPose;
}

async function callComfy(imageData) {
  apiCall["75:74"]["inputs"]["text"] = imageData.prompt;
  apiCall["75:66"]["inputs"]["batch_size"] = 1;
  //apiCall["27"]["inputs"]["width"] = 720;
  apiCall["9"]["inputs"]["filename_prefix"] = "emily/" + imageData.name;
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

async function unloadModel(){
  const bodyFree = {
    unload_models: true,
    free_memory: true
  }
  const requestPrompts = new Request(comfyAdress + "/free", {
    method: "POST",
    body: JSON.stringify(bodyFree),
  });
  
  try {
    const responsePrompts = await fetch(requestPrompts);
    //const jsonReponsePrompts = await responsePrompts.json();
    console.log("reponse free models: " + JSON.stringify(responsePrompts));

  } catch (error) {
    console.log(error);
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
  //console.log("reponse history : " + JSON.stringify(jsonReponseHistory));
  for (const property in jsonReponseHistory) {
    if (property === imageData.promptId){
      try {
        console.log("prompt : " + jsonReponseHistory[property]["prompt"][2]["75:74"]["inputs"]["text"]);
        imageData.imageName = jsonReponseHistory[property]["outputs"]["9"]["images"][0].filename;
      } catch (error) {
        console.log("erreur lecture historique Comfy : " + JSON.stringify(jsonReponseHistory));
      }
      console.log("filename : " + imageData.imageName);
    }
  }
}

function pickRandom(listeMots) {
    // Vérifie si la liste n'est pas vide
    if (listeMots.length === 0) {
        throw new Error("La liste de mots ne peut pas être vide.");
    }

    // Génère un index aléatoire entre 0 et la longueur de la liste - 1
    const indexAleatoire = Math.floor(Math.random() * listeMots.length);

    // Retourne le mot correspondant à l'index aléatoire
    return listeMots[indexAleatoire];
}

function writeFile(imageData) {
  console.log("description : " + imageData.description);
  try {
    fs.writeFile('./outputs/'+ imageData.imageName.replaceAll("_.png","") + ".json", JSON.stringify(imageData), err => {
      if (err) {
        console.error(err);
      } else {
        // file written successfully
      }
    });
  } catch (error) {
    console.log("erreur d'ecriture du fichier json");
  }
}