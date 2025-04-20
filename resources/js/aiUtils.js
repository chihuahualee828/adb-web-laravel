import * as Chat from './chat.js'; 


export async function submitChatMessage(message) {
  
    // const input = document.getElementById("chatInput");
    // const message = input.value.trim();
    if (!message) return;
    console.log("Message:", message);
    // appendUserMessage(message); // show user message on screen
  
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ message })
      });
  
      const data = await res.json();
    //   appendBotMessage(data.response); // display AI's reply
      input.value = "";
    } catch (err) {
      console.error("Error talking to LLM:", err);
    //   appendBotMessage("⚠️ Sorry, something went wrong.");
    }
  }




  document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('message');
    const text = input.value.trim();
    if (!text) return;
    
    Chat.appendUserMessage(text);
    const msgId = Chat.addAssistantPlaceholder();
    input.value = '';
    
    fetch('/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: JSON.stringify({ message: text })
    })
    .then(res => res.json())
    .then(data => {
      if (data.tool_call) addToolCall(data.tool_call);
      if (data.tool_result) addToolObservation(data.tool_result);
      Chat.updateAssistantReply(msgId, data.reply || '[No response]');
    })
    .catch(error => {
      console.error(error);
      Chat.updateAssistantReply(msgId, '[Error processing request]');
    });
  });