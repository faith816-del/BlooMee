const chatBox = document.getElementById('chat-box');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const GENERIC_HELP = "I’m here to help! I might not know everything, but here’s some general guidance: note when it happens, watch for triggers, rest and hydrate, and if it persists or feels unusual, consider talking to a healthcare provider.";

function addMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = `msg ${sender}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener('click', async () => {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage('user', text);
  userInput.value = '';

  addMessage('ai', 'Typing...');
  sendBtn.disabled = true;

  try {
    const response = await fetch('http://localhost:5000/api/ai-buddy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();

    // remove "Typing..." and add real reply
    const typingMsg = chatBox.querySelector('.msg.ai:last-child');
    if (typingMsg && typingMsg.textContent === 'Typing...') {
      typingMsg.remove();
    }

    addMessage('ai', data.reply || GENERIC_HELP);
  } catch (err) {
    console.error('Error talking to AI Buddy:', err);
    // remove "Typing..." and show helpful guidance
    const typingMsg = chatBox.querySelector('.msg.ai:last-child');
    if (typingMsg && typingMsg.textContent === 'Typing...') {
      typingMsg.remove();
    }
    addMessage('ai', GENERIC_HELP);
  }
  sendBtn.disabled = userInput.value.trim().length === 0;
});

// Disable send when input is empty; enable when there is content
function updateSendState() {
  const hasText = userInput.value.trim().length > 0;
  sendBtn.disabled = !hasText;
}
userInput.addEventListener('input', updateSendState);
updateSendState();
