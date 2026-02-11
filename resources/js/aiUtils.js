import * as Chat from './chat.js'; 


async function loadModels() {
    try {
        const response = await fetch('/models');
        if (!response.ok) throw new Error('Failed to load models');
        
        const data = await response.json();
        const models = data.models || [];
        const defaultModel = data.default_model;
        
        const select = document.getElementById('modelSelect');
        if (!select) return;

        select.innerHTML = '';
        
        const storedModel = localStorage.getItem('selectedModel');
        let modelToSelect = storedModel || defaultModel;
        
        // If stored model is not in the list, fallback to default
        if (models.length > 0 && !models.some(m => m.id === modelToSelect)) {
            modelToSelect = defaultModel;
        }

        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.id; // Or model.name if available
            select.appendChild(option);
        });

        if (modelToSelect) {
            select.value = modelToSelect;
        }

        select.addEventListener('change', (e) => {
            localStorage.setItem('selectedModel', e.target.value);
        });

    } catch (error) {
        console.error('Error loading models:', error);
    }
}

// Load models when DOM is ready
document.addEventListener('DOMContentLoaded', loadModels);

  document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('message');
    const text = input.value.trim();
    if (!text) return;
    
    Chat.appendUserMessage(text);
    const msgId = Chat.addAssistantPlaceholder();
    input.value = '';
    
    const selectedModel = document.getElementById('modelSelect')?.value;

    fetch('/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: JSON.stringify({ 
          message: text,
          model: selectedModel 
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Response data:", data);
      if (data.tool_call) Chat.addToolCall(data.tool_call);
      console.log("Tool call:", data.tool_call);
      if (data.tool_result) Chat.addToolObservation(data.tool_result);
      console.log("Tool tool_result:", data.tool_result);
      Chat.updateAssistantReply(msgId, data.reply || '[No response]');
    })
    .catch(error => {
      console.error(error);
      Chat.updateAssistantReply(msgId, '[Error processing request]');
    });
  });