var PercEditorService = (function (svc) {

  var caller, origin,
    allowedDomains = ['http://localhost:9001', 'http://localhost:9000'],
    ieVersion = function () {
      var match = navigator.userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    };

  // == Public Variables =================
  svc.MESSAGE_NAME = 'pf-editor-msg';
  svc.CUSTOM_EVENT_NAME = 'pc-editor-evt';

  // == PRIVATE METHODS ====================

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
   * Handle our custom events
   *
   * Payload:
   * detail: {type: String, data: String/Boolean/Integer/JSON}
   *
   * @param event
   */
  function onPercEditorEvent(event) {
    console.log('custom editor event received', event.detail);
    switch (event.detail.type) {
      case 'pc-image-req':
        svc.sendMessage('pf-image-req', {});
        // svc.trigger(document, svc.CUSTOM_EVENT_NAME, {
        //   type: '',
        //   data: {}
        // });
        break;
      case 'example-resp':
        // svc.sendMessage(event.detail);
        break;
      default:
        // console.log('unknown custom editor event was received');
        break;
    }
  }

  /**
   * Handle the incoming message dispatching to handlers
   * @param event the incoming message
   */
  function onMessageReceived(event) {
    var data, name, meta,
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
      name = data.messageName || data.message;

      console.log('Published page received message: ', origin);

      // only handle messages with our key
      if (name === svc.MESSAGE_NAME) {
        meta = data.data;

        // dispatch message
        switch (meta.type) {
          case 'pf-edit-mode':
            svc.toggleEditMode(meta.data);
            break;
          case 'pf-image-resp':
            svc.handlePhonegapImage(meta.data);
            break;
          case 'pf-publish':
            svc.handlePublish(meta.data);
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
   * trigger(document, event_name, {type: String, data: String/Boolean/Integer/JSON});
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
   * @param type String the type of message (used to signify the handler)
   * @param data String|Object the message payload
   */
  svc.sendMessage = function (type, data) {
    var payload = {
      messageName: svc.MESSAGE_NAME,
      ts: (new Date()).getTime(),
      type: type || 'perc-log-req',
      data: data
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
    svc.on(document, svc.CUSTOM_EVENT_NAME, onPercEditorEvent);

    // listen for window events
    setupWindowMessageListener();

  };

  // export public methods/variables
  return svc;

})(PercEditor || {});
