(function () {

  function receiveMessage(event) {
    var allowedDomains = ['http://localhost:9001'],
      msgKey = 'perc-editor-msg',
      origin = event.origin || (event.originalEvent && event.originalEvent.origin) || null,
      data = event.data || (event.originalEvent && event.originalEvent.data) || 'null',
      sendMessage = function (data) {
        var payload = {
          messageName: msgKey,
          ts: (new Date()).getTime(),
          data: data
        };
        event.source.postMessage(payload, origin);
      },
      parseData = function (data) {
        if (!data || typeof data !== 'string') {
          return {};
        }

        var parts = data.split(/:(.+)/);
        return {
          messageName: parts[0],
          data: JSON.parse(parts[1])
        };
      };

    if (allowedDomains.indexOf(origin) === -1) {
      var msg = 'The domain ' + origin + ' must be explicitly allowed.';
      console.log(msg);
      sendMessage(msg);
      return;
    } else {
      // OK to process message...
      console.log('Published page received message: ', origin);

      // Parse the message
      var parsedData = typeof data === 'string' ? parseData(data) : data;
      var messageName = parsedData.messageName || parsedData.message;

      // Only handle messages we care about
      if (messageName === msgKey) {
        // For display purposes
        $('#messages').text(JSON.stringify(parsedData));

        // Let sender know we received message
        sendMessage('ACK');
      }
    }
  }

  // Listen for messages
  window.addEventListener("message", receiveMessage, false);
})();
