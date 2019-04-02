const socket = io();

const chats = $('#message-list');
const button = $('#chatbox-input-button');

const appendMessage = (message) => {
    const item =  `<li class="message-text-item">${message}</li>`;
    $('#message-list').append(item);
}

socket.on('onClientMessageRecieved', message => {
    appendMessage(message);
});

button.click(() => {
    const input = document.getElementById('chatbox-input-text');
    const message = input.value;
    if (message) {
        socket.emit('onClientMessageSent', message);
        document.getElementById('chatbox-input-text').value = '';
        return;
    } else {
        return;
    }
})