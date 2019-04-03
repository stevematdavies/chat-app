const generateMessage = txt => ({
    txt,
    createdAt: new Date().getTime()
});

const generateLocation = url => ({
    url,
    createdAt: new Date().getTime()
});

module.exports = {
    generateMessage,
    generateLocation
}