

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
  