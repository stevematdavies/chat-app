const socket = io();

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true});

$('#room-name').text(room);

const chats = $('#message-list');
const sendButton = $('#chatbox-input-button');
const locationButton = $('#chatbox-location-button');
const chatbox = $('#chatbox');
const messageInput = $('#chatbox-input');
const userList = $('#user-list');

const createDateElement = (date, prefix) =>
    `<span><strong>${prefix}</strong>&nbsp;<em>${moment(date).format('h:mm a')}</em></span>`;

const enableFormElements = () => {
    sendButton.prop('disabled', false);
    locationButton.prop('disabled', false);
};

const disableFormElements = () => {
    sendButton.prop('disabled', true);
    locationButton.prop('disabled', true);
}

const addToChat = (element) => {
    const listItem = $('<li class="message-list-item"></li>');
    listItem.append(element);
    $('#message-list').append(listItem);
    chatbox.scrollTop($('.message-list-item:last').position().top)
}

const appendMessage = (message) => {
    const { username, txt, createdAt } = message;
    const dateEl = createDateElement(createdAt, 'Created at: ');
    const messageContainer = $(`<div class="message-item-container"></div>`)
    const messageItem = $(`<div class="message-item-container-username">${txt}</div>`);
    const usernameItem = $(`<div class="message-item-container-text"><i class="material-icons">face</i>${username}</div>`);
    const dateItem = $(`<div class="message-item-container-time">${dateEl}</div>`);
    messageContainer.append(usernameItem);
    messageContainer.append(messageItem);
    messageContainer.append(dateItem)
    addToChat(messageContainer);
}

socket.on('onClientMessageRecieved', response => {
    enableFormElements();
    appendMessage(response);
});

socket.on('serverMessage', (message) => {
    const { username, txt, createdAt } = message;
    const dateEl = createDateElement(createdAt,'Sent at: ');
    const messageContainer = $(`<div class="message-item-container"></div>`)
    const messageItem = $(`<div class="message-item-container-text server-m"><i class="material-icons">info</i>${txt}</div>`);
    const dateItem = $(`<div class="message-item-container-time">${dateEl}</div>`);
    messageContainer.append(messageItem);
    messageContainer.append(dateItem)
    addToChat(messageContainer);
});

socket.on('locationRecieved', (data) => {
    enableFormElements();
    const { username, url, createdAt } = data;
    const dateEl = createDateElement(createdAt, 'Sent at: ');
    const locationContainer = $('<div class="location-item-container"></div>')
    const linkElement = $(`<div class="location-item-container-link"><a>${username} has shared their location</a></div>`);
    const iconElement = $('<i class="material-icons">explore</i>');
    const dateItem = $(`<div class="message-item-container-time">${dateEl}</div>`);
    linkElement.prepend(iconElement)
    linkElement.click(() => locationLinkAction(url));
    locationContainer.append(linkElement);
    locationContainer.append(dateItem);
    addToChat(locationContainer);
});

socket.on('userListUpdated', users => {
    userList.empty();
    users.forEach(user => {
        let listElement = $('<li></li>')
        let iconElement = $('<i class="material-icons">face</i>');
        listElement.append(iconElement);
        listElement.append($(`<span>${user.username}</span>`));
        userList.append(listElement);
    })
})

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

locationButton.click((e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
        return alert('geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('locationSent', { latitude, longitude });
        disableFormElements();
    });
});

sendButton.click((e) => {
    e.preventDefault();
    const message = messageInput.val();
    if (message) {
        socket.emit('onClientMessageSent', (message), (warning) => {
            disableFormElements();
            if (warning) {
                const { txt } = warning
                let warningItem = $(`<span class="warning-item">${txt}</span>`);
                let warningIcon = $('<i class="material-icons">warning</i>');
                warningItem.prepend(warningIcon);
                addToChat(warningItem, ['warning'])
                enableFormElements();
            }
            return
        });
        messageInput.val('');
        enableFormElements();
        return;
    } else {
        return;
    }
});

socket.emit('join', {username, room}, error => {
    if(error){
        let errorItem = $(`<span class="warning-item">${error}</span>`);
        let errorIcon = $('<i class="material-icons">report_problem</i>');
        errorItem.prepend(errorIcon);
        addToChat(errorItem)
    }
});