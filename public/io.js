const socket = io();

const chats = document.getElementById('message-list');

const appendMessage = (message) => {
    const node = document.createElement('LI');
    const textNode = document.createTextNode(message);
    node.className = 'message-text-item';
    node.appendChild(textNode);
    chats.appendChild(node);
}

socket.on('countUpdated', () => {
    console.log('the count has been updated!');
    appendMessage('the count has been updated!');
});