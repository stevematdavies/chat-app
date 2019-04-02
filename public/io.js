const socket = io();

const chats = $('#message-list');
const sendButton = $('#chatbox-input-button');
const locationButton = $('#chatbox-location-button');
const chatbox = $('#chatbox');

const enableFormElements = () => {
    sendButton.prop('disabled', false);
    locationButton.prop('disabled', false);
};

const disableFormElements = () => {
    sendButton.prop('disabled', true);
    locationButton.prop('disabled', true);
}

const addToChat = (element, classes) => {
    const listItem = $('<li class="message-text-item"></li>');
    if (classes.length > 0) {
        classes.forEach(c => listItem.addClass(c))
    }
    listItem.append(element);
    $('#message-list').append(listItem);
    chatbox.scrollTop($('.message-text-item:last').position().top)

}

const appendMessage = (message) => {
    const item =  `<i class="material-icons">chat</i>${message}</li>`;
    addToChat(item,[]);
}

socket.on('onClientMessageRecieved', message => {
    enableFormElements();
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

socket.on('locationRecieved',url => {
    enableFormElements();
    const linkElement = $('<a class="location-link">See my location</a>');
    const iconElement = $('<i class="material-icons">explore</i>');
    linkElement.prepend(iconElement);
    linkElement.click(() => locationLinkAction(url));
    addToChat(linkElement, ['location']);
});

locationButton.click((e) => {
    e.preventDefault();
    if(!navigator.geolocation) {
        return alert('geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('locationSent',{ latitude, longitude });
        disableFormElements();
    });
});

sendButton.click((e) => {
    e.preventDefault();
    const input = document.getElementById('chatbox-input-text');
    const message = input.value;
    if (message) {
        socket.emit('onClientMessageSent', message, (wordWarning) => {
            disableFormElements();
            if(wordWarning) {
                let warningItem = $(`<span class="warning-item">${wordWarning}</span>`);
                let warningIcon = $('<i class="material-icons">warning</i>');
                warningItem.prepend(warningIcon);
                addToChat(warningItem, ['warning'])
            }
           return
        });
        document.getElementById('chatbox-input-text').value = '';
        enableFormElements();
        return;
    } else {
        return;
    }
})