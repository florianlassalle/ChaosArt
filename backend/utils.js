import fs from 'node:fs';
import ollama from 'ollama'


export async function convertImageToBase64(imagePath) {
    const data = await fs.promises.readFile(imagePath);
    let base64Image = Buffer.from(data, 'binary').toString('base64');
    console.log(base64Image);
    return base64Image;
}

async function callOllamaImage(image){
    const prompt = await ollama.generate({
    model: 'gemma3:12b',
    prompt: "Ecris moi la de",
    format: "json",
    stream: false,
    think: false,
    images: [image]
  });

  const reponse = JSON.parse(prompt.response);
  console.log(JSON.stringify(reponse));

}
const image = await convertImageToBase64("/mnt/30260A1634856FC8/Logiciels/IA/stableDiffusion/venv-comfy/ComfyUI/output/emily/emily_00006_.png")
const description = await callOllamaImage(image);