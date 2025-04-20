const chatBox = document.getElementById('chat-box');
let messageIdCounter = 0;

export function appendUserMessage(text) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<div class="user-label">You:</div><div class="user-reply">${text}</div>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

export function addAssistantPlaceholder() {
  const id = 'msg-' + (++messageIdCounter);
  const div = document.createElement('div');
  div.classList.add('message');
  div.id = id;
  div.innerHTML = `
    <div class="ai-label">AI:</div>
    <div class="ai-reply">
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
    replyDiv.textContent = content;
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