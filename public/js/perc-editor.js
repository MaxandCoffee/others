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
    if (document.documentElement.clientWidth < 504) {
      tinymce.init({
        selector: '.e',
        inline: true,
        //fixed_toolbar_container: '.tinymceToolbarHolder',
        theme_advanced_toolbar_location : "external",
        theme_advanced_toolbar_align : "left",
        theme_advanced_statusbar_location : "top",
        theme_advanced_resizing : false,
        // make toolbar dragable
        handle_event_callback : function(e) {
          if(e.type == 'click') {
            $('.mceExternalToolbar').draggable();
          }
          return true;
        },
        browser_spellcheck: true,
        menubar: 'edit format insert table',
        edit: {
          title: 'Edit',
          items: 'undo redo | cut copy paste pastetext | selectall | alignleft | aligncenter | alignright | alignjustify '
        },
        insert: {title: 'Insert', items: 'link media | template hr | bullist| numlist | outdent| indent | link image'},
        view: {title: 'View', items: 'visualaid'},
        format: {
          title: 'Format',
          items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'
        },
        table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
        tools: {title: 'Tools', items: 'spellchecker code'},
        toolbar: ['undo redo | forecolor backcolor | emoticons | link | moreBttn',
          'bullist numlist | cut copy paste | media | image'], //make the image pgImage
        image_advtab: true,
        plugins: [
          'advlist autolink lists link image charmap print preview hr anchor pagebreak',
          'searchreplace wordcount visualblocks visualchars code fullscreen',
          'insertdatetime media nonbreaking save table contextmenu directionality moreBttn',
          'emoticons template paste textcolor colorpicker textpattern imagetools codesample pgImage'
        ]
      });

<<<<<<< Updated upstream
    tinymce.init({
      selector: '.e',
      inline: true,
      plugins: [
        'advlist autolink lists link image charmap print preview hr anchor pagebreak',
        'searchreplace wordcount visualblocks visualchars code fullscreen',
        'insertdatetime media nonbreaking save table contextmenu directionality',
        'emoticons template paste textcolor colorpicker textpattern imagetools codesample pgImage'
      ],
      toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
      toolbar2: 'print preview media | forecolor backcolor emoticons | codesample | pgImage',
      image_advtab: true,
      templates: [
        { title: 'Test template 1', content: 'Test 1' },
        { title: 'Test template 2', content: 'Test 2' }
      ]
    });
=======
    } else {
      tinymce.init({
        selector: '.e',
        inline: true,
        browser_spellcheck: true,
        plugins: [
          'advlist autolink lists link image charmap print preview hr anchor pagebreak',
          'searchreplace wordcount visualblocks visualchars code fullscreen',
          'insertdatetime media nonbreaking save table contextmenu directionality',
          'emoticons template paste textcolor colorpicker textpattern imagetools codesample pgImage',
          'autoresize'
        ],
        toolbar: ['insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
          'print preview media | forecolor backcolor emoticons | codesample | pgImage'],
        image_advtab: true,
        templates: [
          {title: 'Test template 1', content: 'Test 1'},
          {title: 'Test template 2', content: 'Test 2'}
        ]
      });
    }
>>>>>>> Stashed changes
  }

  tinymce.PluginManager.add('moreBttn', function (editor) {
    editor.addButton('moreBttn', {
      text: "more",
      title: "moreBttn",
      onclick: function () {
        var button = $('[aria-label="moreBttn"]').children('button');

        button.text(function(i, text){
          return text === 'more' ? 'less' : 'more';
        });
        $('.mce-tinymce.mce-tinymce-inline.mce-container.mce-panel, .mce-container-body.mce-abs-layout').toggleClass('displayToolbars');
        $('.mce-stack-layout-item:last-child').toggle();
        return true;
      }
    });
  });

// == Public Methods =====================

  svc.toggleEditMode = function (inEditMode) {
    editableItem = $('*:hasAttrWithPrefix(' + attr + ')')
      .children('section, article, aside, blockquote, figcaption, h1, h2, h3, h4, h5, h6, p, a, li, ul, ol, li, th, tr, td, img, figure');

    if (inEditMode) {
      // turn on editing
      setColors();

      $('body').append('<div id="editsToSend"></div>');

      $(editableItem).addClass('e');
      $(editableItem).attr('contenteditable', 'true');
      //$('#editable_region').attr('contenteditable', 'true');

<<<<<<< Updated upstream
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
=======
      $(editableItem).one('focus', function () {
        var oldVal = $(this).html();
        $(this).on('blur', function () {
          newVal = $(this).html();

          if (newVal !== oldVal) {
            $(this).addClass('editedItem');
          }
        })
      });



      //textboxio.inlineAll('.e');

      setEditors(editableItem);

>>>>>>> Stashed changes
    } else {
      // turn off editing
      $(editableItem).removeClass('.e');
      $(editableItem).removeAttr('contenteditable');
      tinymce.EditorManager.editors = [];
    }
  };

  svc.handlePhonegapImage = function (imageData) {
    svc.trigger(document, svc.CUSTOM_EVENT_NAME, { type: 'pc-image-resp', data: imageData });
  };

  svc.handlePublish = function () {
    $('.editedItem').each(function () {
      var itemContainer = $(this).parent().attr(attr),
        edited = $(this)[0].tagName.toLocaleLowerCase(),
        newText = $(this).html(),
        editMsg = itemContainer + '\'s ' + edited + ' was edited. The new value is ' + newText + '. ';
      $('#editsToSend').append(editMsg);
    });

    var editsToSend = document.getElementById("editsToSend").innerHTML;

    localStorage.setItem('final edits to publish: ', editsToSend);

    svc.sendMessage('perc-log-pub', editsToSend);
  };

// == Private Methods ====================

<<<<<<< Updated upstream
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
=======
// find all attrs with certain prefix
>>>>>>> Stashed changes
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
