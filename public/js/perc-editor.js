(function () {
  // == JQUERY functions ===============

  // find all attrs with certain prefix
  $.expr[':'].hasAttrWithPrefix = $.expr.createPseudo(function (prefix) {
    return function (obj) {
      for (var i = 0; i < obj.attributes.length; i++) {
        if (obj.attributes[i].nodeName.indexOf(prefix) === 0) return true;
      }
      return false;
    };
  });

  // == PostMessage ====================

  // Handle message received
  function receiveMessage(event) {
    var allowedDomains = ['http://localhost:9000'],
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
        var editableItem = $('*:hasAttrWithPrefix(data-perc-id)').children('section, article, aside, blockquote, figcaption, h1, h2, h3, h4, h5, h6, p, a, li, ul, ol, li, th, tr, td, img, figure');
        // Toggle edit mode
        if (parsedData.data.editMode) {
          // show borders around editable things

          var colors = [
                '#29a8c6',
                '#34b6d5',
                '#49bed9',
                '#5ec5de',
                '#88d5e6',
                '#9ddceb',
                '#b2e4ef',
                '#c7ebf4',
                'rgba(199, 235, 244, 0.75)',
                'rgba(199, 235, 244, 0.50)',
                'rgba(199, 235, 244, 0.25)',
                ''
              ];


          function color() {
            $.each(colors, function (index, color) {
              setTimeout(function () {
                editableItem.css({'background': color, 'border-radius' : '4px', 'border' : '2px dotted #b2e4ef'});
              }, 90 * index);
            });
          }

          color();
          $(editableItem).addClass('e');
          $(editableItem).attr('contenteditable', 'true');

          tinymce.init({
            selector: 'h1.e, h2.e, h3.e, h4.e, h5.e, h6.e, a.e, th.e, ul.e, ol.e',
            inline: true,
            toolbar: 'undo redo',
            menubar: false
          });

          tinymce.EditorManager.init({
            selector: 'p.e, article.e, aside.e',
            inline: true,
            plugins: [
              'advlist autolink lists link image charmap print preview hr anchor pagebreak',
              'searchreplace wordcount visualblocks visualchars code fullscreen',
              'insertdatetime media nonbreaking save table contextmenu directionality',
              'emoticons template paste textcolor colorpicker textpattern imagetools codesample'
            ],
            toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
            toolbar2: 'print preview media | forecolor backcolor emoticons | codesample',
            image_advtab: true,
            templates: [
              { title: 'Test template 1', content: 'Test 1' },
              { title: 'Test template 2', content: 'Test 2' }
            ],
          });

          $(editableItem).each(function(){
            var item = $(this);
            var oldText = $(this).text();
            $(item).one('focus', function () {
              var itemContainer = $(this).parent().attr('data-perc-id');
              var beingEdited = $(this)[0].tagName.toLocaleLowerCase();
              var oldText = $(this).text();
              console.log(itemContainer + "'s " + beingEdited + ' is being edited. The orginial value is ' + oldText);
            });
            $(item).on('blur', function(){
              var itemContainer = $(this).parent().attr('data-perc-id');
              var edited = $(this)[0].tagName.toLocaleLowerCase();

              var itemEdited = itemContainer + ": " + edited;

              var newText = $(this).text();
              if(newText != oldText) {
                var editMsg = itemContainer + "'s " + edited + ' was edited. The original value was '+ oldText + ' The new value is ' + newText
                console.log(editMsg);
                localStorage.setItem(itemEdited, newText);
                sendMessage(editMsg);
              }else{
                console.log(itemContainer + "'s " + edited + ' was not changed');
              }
            });

          })
        } else {
          // turn off borders
          $(editableItem).css('border', 'none');
          $(editableItem).removeClass('e');
          $(editableItem).removeAttr('contenteditable');
          tinymce.EditorManager.editors = [];
        }
      }
    }
  }

  // Listen for messages
  window.addEventListener("message", receiveMessage, false);
})();
