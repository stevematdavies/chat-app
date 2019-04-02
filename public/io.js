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

locationLinkAction = (url) => {
    window.open(url,
        'My location',
        `directories=no,
        titlebar=no,
        toolbar=no,
        location=no,
        status=no,
        menubar=no,
        width=1024,height=768`);
}

socket.on('locationRecieved',coords => {
    const { latitude, longitude } = coords;
    const url = `https://google.com/maps/?q=${latitude},${longitude}`;
    const linkElement = $('<a class="location-link">See my location</a>');
    linkElement.click(() => locationLinkAction(url));
    const listElement = $(`<li class="message-text-item location"><i class="material-icons">explore</i</li>`);
    listElement.append(linkElement);
    $('#message-list').append(listElement);
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