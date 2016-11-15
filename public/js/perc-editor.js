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
        editableItem.css({'background': color});
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

    tinymce.init({
      selector: '.e',
      inline: true,
      body_class: 'editedItem',
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
        {title: 'Test template 1', content: 'Test 1'},
        {title: 'Test template 2', content: 'Test 2'}
      ],

      // setup: function (editor) {
      //   editor.on('init', function () {
      //     var item = tinyMCE.activeEditor.getElement(),
      //       originalHtml = tinyMCE.activeEditor.getContent({format: 'raw'});
      //     $(item).addClass('editedItem');
      //     editor.on('blur', function () {
      //       var newHtml = tinyMCE.activeEditor.getContent({format: 'raw'});
      //       if (newHtml === originalHtml) {
      //         $(item).addClass('ignore');
      //       }
      //     });
      //   });
      // }

      // setup: function (editor) {
      //   editor.on('Init', function () {
      //     var originalText = tinyMCE.activeEditor.getContent({format: 'raw'});
      //     editor.on('focus', function () {
      //       var originalText = tinyMCE.activeEditor.getContent({format: 'raw'});
      //       console.log(originalText);
      //     });
      //     editor.on('blur', function (e) {
      //       var newText = tinyMCE.activeEditor.getContent({format: 'raw'}),
      //         thisItem = tinymce.activeEditor.getAttrib('id','class');
      //           //tinymce.activeEditor.getBody().firstChild.id,
      //           //tinymce.activeEditor.selection.getNode().id;
      //         alert(thisItem);
      //         //parent = $(thisItem).parent();
      //       console.log(newText);
      //       if (newText !== originalText) {
      //
      //         //$(parent).addClass('editedItem');
      //         //tinyMCE.activeEditor.dom.addClass(tinyMCE.activeEditor.dom.select('.e'), 'editedItem');
      //       }
      //     });
      //   })
      // }
    });
  }

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

      $(editableItem).one('focus', function(){
        var oldVal = $(this).html();
        $(this).on('blur', function(){
          newVal = $(this).html();

          if(newVal !== oldVal){
            $(this).addClass('editedItem');
          }
        })
      })

      setEditors(editableItem);

    } else {
      // turn off editing
      $(editableItem).removeClass('e');
      $(editableItem).removeAttr('contenteditable');
      tinymce.EditorManager.editors = [];
    }
  };

  svc.handlePhonegapImage = function (imageData) {
    svc.trigger(document, svc.CUSTOM_EVENT_NAME, {type: 'pc-image-resp', data: imageData});
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
