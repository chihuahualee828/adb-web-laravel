import { marked } from 'marked';

const chatBox = document.getElementById('chat-box');
let messageIdCounter = 0;

export function appendUserMessage(text) {
  const div = document.createElement('div');
  div.classList.add('message', 'user-message');
  div.innerHTML = `<div class="user-label fade-in">You</div><div class="user-reply fade-in">${text}</div>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

export function addAssistantPlaceholder() {
  const id = 'msg-' + (++messageIdCounter);
  const div = document.createElement('div');
  div.classList.add('message', 'ai-message');
  div.id = id;
  div.innerHTML = `
    <div class="ai-label fade-in">AI Assistant</div>
    <div class="ai-reply"  style="opacity: 1">
      <div class="spinner"></div>
    </div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return id;
}

export function updateAssistantReply(id, content) {
  const el = document.getElementById(id);
  if (el) {
    const replyDiv = el.querySelector('.ai-reply');
    replyDiv.innerHTML = marked.parse(content);
    replyDiv.style.opacity = '0'; 
    replyDiv.classList.add('fade-in');
  }
}


export function addToolCall(tool) {
  const section = document.createElement('div');
  section.classList.add('tool-section');
  section.innerHTML = `
    <strong>🛠️ Tool Call</strong><br>
    <b>Tool:</b> ${tool.tool_name} <br>
    <b>MCP Server:</b> <code>${tool.mcp_server}</code> <br>
    <b>Input:</b>
    <pre>${JSON.stringify(tool.input, null, 2)}</pre>
  `;
  chatBox.appendChild(section);
  chatBox.scrollTop = chatBox.scrollHeight;
}

export function addToolObservation(tool) {
  const section = document.createElement('div');
  section.classList.add('tool-section');
  section.innerHTML = `
    <strong>📥 Tool Observation</strong><br>
    <b>Tool:</b> ${tool.tool_name} <br>
    <b>MCP Server:</b> <code>${tool.mcp_server}</code> <br>
    <b>Output:</b>
    <pre>${JSON.stringify(tool.output, null, 2)}</pre>
  `;
  chatBox.appendChild(section);
  chatBox.scrollTop = chatBox.scrollHeight;
}


//   document.addEventListener('DOMContentLoaded', function () {
//     const offcanvas = document.getElementById('aiChatOffcanvas');
//     const aiLabel = document.querySelector('.ai-label');
//     const aiReply = document.querySelector('.ai-reply');

//     // When the offcanvas has finished sliding into view
//     offcanvas.addEventListener('shown.bs.offcanvas', () => {
//       // Reset animation if previously shown
//     //   aiReply.classList.remove('fade-in');
//     aiReply.style.opacity = 0;
//     aiLabel.style.opacity = 0;
//       // Delay before starting fade-in (optional)
//       setTimeout(() => {
//         aiLabel.classList.add('fade-in');
//       }, 100); // Adjust delay as needed

//       setTimeout(() => {
//         aiReply.classList.add('fade-in');
//       }, 300); // Adjust delay as needed
//     });

//     // // Optional: reset when offcanvas is closed
//     // offcanvas.addEventListener('hidden.bs.offcanvas', () => {
//     //   aiReply.classList.remove('fade-in');
//     //   aiReply.style.opacity = 0;
//     // });
//   });

const popup = document.getElementById('aiChatPopup');
const openBtn = document.getElementById('openAiPopup');
const openBtn2 = document.getElementById('openAiPopup2');
const closeBtn = document.getElementById('closeAiPopup');
const dragHandle = document.getElementById('popupDragHandle');


  document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('aiChatPopup');
    const aiLabel = document.querySelector('.ai-label');
    const aiReply = document.querySelector('.ai-reply');
  
    const observer = new MutationObserver(() => {
      // Triggered when popup becomes visible (using .show class)
      if (popup.classList.contains('show')) {
        aiLabel.style.opacity = 0;
        aiReply.style.opacity = 0;
  
        setTimeout(() => {
          aiLabel.classList.add('fade-in');
        }, 100);
  
        setTimeout(() => {
          aiReply.classList.add('fade-in');
        }, 300);
      }
    });
  
    observer.observe(popup, { attributes: true, attributeFilter: ['class'] });
  });
  
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  
  // Show popup
  openBtn.addEventListener('click', () => {
    popup.style.display = 'block';
    setTimeout(() => popup.classList.add('show'), 10);
  });

  openBtn2.addEventListener('click', () => {
    popup.style.display = 'block';
    setTimeout(() => popup.classList.add('show'), 10);
  });
  
  // Close popup
  closeBtn.addEventListener('click', () => {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.style.display = 'none';
    }, 300);
  });
  

    dragHandle.addEventListener('mousedown', function (e) {
    isDragging = true;
    popup.style.transform = 'none';
    const rect = popup.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    popup.style.transition = 'none';

    // ✅ Prevent text selection while dragging
    document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function (e) {
    if (isDragging) {
        popup.style.left = `${e.clientX - offsetX}px`;
        popup.style.top = `${e.clientY - offsetY}px`;
    }
    });

    document.addEventListener('mouseup', function () {
    if (isDragging) {
        isDragging = false;
        popup.style.transition = 'all 0.4s ease';

        // ✅ Restore text selection
        document.body.style.userSelect = 'auto';
    }
    });
  