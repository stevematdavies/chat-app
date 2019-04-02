const socket = io();

const chats = $('#message-list');
const sendButton = $('#chatbox-input-button');
const locationButton = $('#chatbox-location-button');

const appendMessage = (message) => {
    const item =  `<li class="message-text-item">
                        <i class="material-icons">chat</i>
                        ${message}
                    </li>`;
    $('#message-list').append(item);
}

socket.on('onClientMessageRecieved', message => {
    appendMessage(message);
});

socket.on('serverMessage',(message) => {
    const messageEl =`<p class="server-m">${message}</p>`;
    $('#service-message-box').append(messageEl);
    setTimeout(() => {
        $('.server-m').remove();
    },5000);
});

socket.on('locationRecieved',coords => {
    const { latitude, longitude } = coords;
    const gmLink = `https://google.com/maps/?q=${latitude},${longitude}`;
    $('#message-list').append(`<li class="message-text-item location">
        <i class="material-icons">explore</i>
        <a href=${gmLink} class="location-link" target="__blank">See my Location</a>
    </li>`);
});

locationButton.click((e) => {
    if(!navigator.geolocation) {
        return alert('geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('locationSent',{ latitude, longitude });
    });
});

sendButton.click(() => {
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