var PercEditor = (function () {

  var editableItem,
    svc = {},
    attr = 'data-perc-id',
    colors = [
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

  // == Private Methods ====================

  function setColors() {
    $.each(colors, function (index, color) {
      setTimeout(function () {
        editableItem.css({ 'background': color });
      }, 90 * index);
    });
  }

  function setEditors() {
    tinymce.init({
      selector: 'h1.e, h2.e, h3.e, h4.e, h5.e, h6.e, a.e, th.e, ul.e, ol.e',
      inline: true,
      toolbar: 'undo redo',
      menubar: false
    });

    tinymce.EditorManager.init({
      selector: 'p.e, article.e, aside.e',
      inline: true,
      file_browser_callback : $.noop,
      plugins: [
        'advlist autolink lists link image charmap print preview hr anchor pagebreak',
        'searchreplace wordcount visualblocks visualchars code fullscreen',
        'insertdatetime media nonbreaking save table contextmenu directionality',
        'emoticons template paste textcolor colorpicker textpattern codesample percAdvImage'
      ],
      toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
      toolbar2: 'print preview media | forecolor backcolor emoticons | codesample | percAdvImage',
      //image_advtab: true,
      templates: [
        { title: 'Test template 1', content: 'Test 1' },
        { title: 'Test template 2', content: 'Test 2' }
      ]
    });
  }

  // == Public Methods =====================

  svc.toggleEditMode = function (inEditMode) {
    editableItem = $('*:hasAttrWithPrefix(' + attr + ')')
      .children('section, article, aside, blockquote, figcaption, h1, h2, h3, h4, h5, h6, p, a, li, ul, ol, li, th, tr, td, img, figure');

    if (inEditMode) {
      // turn on editing
      setColors();

      $(editableItem).addClass('e');
      $(editableItem).attr('contenteditable', 'true');

      setEditors();

      $(editableItem).each(function () {
        var originalText = $(this).html(),
          item = $(this);
        $(item).one('focus', function () {
          var itemContainer = $(this).parent().attr(attr),
            beingEdited = $(this)[0].tagName.toLocaleLowerCase(),
            originalText = $(this).html();
          console.log(itemContainer + '\'s ' + beingEdited + ' is being edited. The original value is ' + originalText);
        });
        $(item).on('blur', function () {
          var itemContainer = $(this).parent().attr(attr),
            edited = $(this)[0].tagName.toLocaleLowerCase(),
            itemEdited = itemContainer + ": " + edited,
            newText = $(this).html();
          if (newText !== originalText) {
            var editMsg = itemContainer + '\'s ' + edited + ' was edited. The original value was ' + originalText + ' The new value is ' + newText;
            console.log(editMsg);
            localStorage.setItem(itemEdited, newText);
            svc.sendMessage(editMsg);
          } else {
            console.log(itemContainer + '\'s ' + edited + ' was not changed');
          }
        });
      });
    } else {
      // turn off editing
      $(editableItem).removeClass('e');
      $(editableItem).removeAttr('contenteditable');
      tinymce.EditorManager.editors = [];
    }
  };

  svc.handlePhonegapImage = function (imageData) {
    svc.trigger(document, svc.CUSTOM_EVENT_NAME, { type: 'pc-image-resp', data: imageData });
  };

  // == Private Methods ====================

  // perc alerts
  jQuery.fn.extend({
    alert: function (title, message) {
      if ($(this).hasClass('perc-alert')) {
        if (title && message) {
          $(this).append('<strong>' + title + '</strong>').append(' ' + message);
        } else if (title) {
          $(this).append(title);
        } else {
          $(this).append(message);
        }
      }
      return $(this);
    }
  });

  // find all attrs with certain prefix
  $.expr[':'].hasAttrWithPrefix = $.expr.createPseudo(function (prefix) {
    return function (obj) {
      for (var i = 0; i < obj.attributes.length; i++) {
        if (obj.attributes[i].nodeName.indexOf(prefix) === 0) return true;
      }
      return false;
    };
  });

  // export public methods/variables
  return svc;

})();
