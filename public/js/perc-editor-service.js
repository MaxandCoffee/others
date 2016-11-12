var PercEditorService = (function (svc) {

  var caller, origin,
    allowedDomains = ['http://localhost:9001', 'http://localhost:9000'],
    messageKey = 'perc-editor-msg',
    customEventKey = 'perc-editor';

  // == PRIVATE METHODS ====================

  /**
   * Handle our custom events
   *
   * Payload:
   * detail: {type: String, data: String/Boolean/Integer/JSON}
   *
   * @param event
   */
  function onPercEditorEvent(event) {
    console.log('PercEditorEvent was received', event.detail);
    switch (event.detail.type) {
      case 'example-request':
        svc.trigger(document, customEventKey, {
          type: '',
          data: {}
        });
        break;
      case 'example-resp':
        svc.sendMessage(event.detail);
        break;
      default:
        console.log('PercEditorEvent unknown event was received');
        break;
    }
  };

  /**
   * Parse the incoming message and return json
   * @param payload the incoming message
   * @return {{}}
   */
  function parseData(payload) {
    var parts,
      data = {};
    if (!payload || typeof payload !== 'string') {
      // no op
    } else {
      // naive approach to converting incoming message to json
      parts = payload.split(/:(.+)/);
      data.messageName = parts[0];
      data.data = JSON.parse(parts[1]);
    }
    return data;
  }

  /**
   * Handle the incoming message dispatching to handlers
   * @param event the incoming message
   */
  function onMessageReceived(event) {
    var data, messageName, meta,
      error = '',
      payload = event.data || (event.originalEvent && event.originalEvent.data) || 'null';

    // set caller and origin for send events
    caller = event.source;
    origin = event.origin || (event.originalEvent && event.originalEvent.origin) || null;

    if (allowedDomains.indexOf(origin) === -1) {
      // origin not allowed...
      error = 'The domain ' + origin + ' must be explicitly allowed.';
      console.log(error);
      send(error);
    } else {
      // origin allowed...
      data = typeof payload === 'string' ? parseData(payload) : payload;
      messageName = data.messageName || data.message;

      console.log('Published page received message: ', origin);

      // only handle messages with our key
      if (messageName === messageKey) {
        meta = data.data;

        // dispatch message
        switch (meta.type) {
          case 'editMode':
            svc.toggleEditMode(meta.data);
            break;
        }
      }
    }
  }

  // listen for window.postmessages
  function setupWindowMessageListener() {
    if (window.addEventListener) {
      window.addEventListener('message', onMessageReceived, false);
    } else {
      window.attachEvent('onmessage', onMessageReceived);
    }
  }

  // == PUBLIC METHODS =====================

  /**
   * Add a custom event
   * @param el String dom element to bind event to (ie. document)
   * @param eventName String the name of the custom event
   * @param eventHandler func callback of the custom event
   */
  svc.on = function (el, eventName, eventHandler) {
    if (window.addEventListener) { // modern browsers including IE9+
      el.addEventListener(eventName, eventHandler, false);
    } else if (window.attachEvent) { // IE8 and below
      el.attachEvent('on' + eventName, eventHandler);
    } else {
      el['on' + eventName] = eventHandler;
    }
  };

  /**
   * Remove a custom event
   * @param el String dom element event was bound to
   * @param eventName String the name of the custom event
   * @param eventHandler func callback of the custom event
   */
  svc.off = function (el, eventName, eventHandler) {
    if (window.removeEventListener) {
      el.removeEventListener(eventName, eventHandler, false);
    } else if (window.detachEvent) {
      el.detachEvent('on' + eventName, eventHandler);
    } else {
      el['on' + eventName] = null;
    }
  };

  /**
   * Dispatch a custom event
   *
   * Example:
   * trigger(document, customEventKey, {type: String, data: String/Boolean/Integer/JSON});
   *
   * @param el String dom element to bind event to (ie. document)
   * @param eventName String the name of the custom event
   * @param eventData Object the event payload
   */
  svc.trigger = function (el, eventName, eventData) {
    var event = null;
    if (window.CustomEvent && !ieVersion()) {
      event = new CustomEvent(eventName, { detail: eventData });
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, true, true, eventData);
    }
    el.dispatchEvent(event);
  };

  /**
   * Send a message to calling window (usually parent of iframe)
   * The caller should be bound by init method
   * @param msg String the message
   */
  svc.sendMessage = function (msg) {
    var payload = {
      messageName: messageKey,
      ts: (new Date()).getTime(),
      detail: msg
    };

    if (caller && caller.postMessage) {
      caller.postMessage(payload, origin);
    }
  };

  /**
   * Initialize the service
   */
  svc.init = function () {
    // listen for our custom events
    svc.on(document, customEventKey, onPercEditorEvent);

    // listen for window events
    setupWindowMessageListener();

  };

  // export public methods/variables
  return svc;

})(PercEditor || {});
