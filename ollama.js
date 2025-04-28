import ollama from 'ollama'

const response = await ollama.chat({
  model: 'MHKetbi/Mistral-Small3.1-24B-Instruct-2503',
  messages: [{ role: 'user', content: 'Why is the sky blue?' }],
})
console.log(response.message.content)