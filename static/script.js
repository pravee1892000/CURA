document.addEventListener('DOMContentLoaded', function () {
    const sendButton = document.getElementById('send-btn');
    const userInputField = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // Display a casual welcome message
    setTimeout(() => {
        displayMessage("👋 Hey there! I'm your Health Care assistant CURA. How can I help you today?", 'bot-message');
    }, 500);

    sendButton.addEventListener('click', sendMessage);
    userInputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent newline in input
            sendMessage();
        }
    });

    function sendMessage() {
        const userInput = userInputField.value.trim();
        if (userInput === '') return;

        displayMessage(userInput, 'user-message');

        // Clear input field
        userInputField.value = '';

        // Display typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot-message', 'typing');
        typingIndicator.innerHTML = '<i>Typing...</i>';
        chatBox.appendChild(typingIndicator);
        scrollToBottom();

        // Check for common interactive responses
        const botResponse = getInteractiveResponse(userInput);
        if (botResponse) {
            setTimeout(() => {
                chatBox.removeChild(typingIndicator);
                displayMessage(botResponse, 'bot-message');
            }, 1000);
        } else {
            // Send request to Flask backend
            fetch('/get_response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_input: userInput }),
            })
            .then(response => response.json())
            .then(data => {
                chatBox.removeChild(typingIndicator);
                displayMessage(data.response, 'bot-message');
            })
            .catch(error => {
                console.error('Error:', error);
                chatBox.removeChild(typingIndicator);
                displayMessage('⚠️ Oops! Something went wrong. Please try again.', 'bot-message');
            });
        }
    }

    function displayMessage(text, className) {
        const message = document.createElement('div');
        message.classList.add('message', className);
        message.innerHTML = text;
        chatBox.appendChild(message);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    }

    function getInteractiveResponse(input) {
        const text = input.toLowerCase();

        if (text.includes('hello') || text.includes('hi')) {
            return "👋 Hello! How's your day going?";
        } else if (text.includes('how are you')) {
            return "😊 I'm just a bot, but I'm feeling great! How about you?";
        } else if (text.includes('thank you') || text.includes('thanks')) {
            return "🙏 You're welcome! Let me know if you need anything else.";
        } else if (text.includes('bye')) {
            return "👋 Bye! Have a great day ahead!";
        } else if (text.includes('help')) {
            return "🤖 I'm here to help! Ask me anything.";
        }
        return null;
    }
});
