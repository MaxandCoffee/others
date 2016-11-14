(function () {
  tinymce.PluginManager.add('pgImage', function (editor, url) {
    editor.addButton('pgImage', {
      title: 'Phonegap Image',
      text: 'Phonegap Image',
      onclick: function () {
        editor.windowManager.open({
          title: 'Container',
          width: 600,
          height: 300,
          onPostRender: function (e, f) {
            var args = editor.windowManager.getParams(),
              service = args.service;

            $('.pg-image-container').css('width', 560);
            $('.pg-image-button').click(function () {
              service.on(document, service.CUSTOM_EVENT_NAME, function (event) {
                switch (event.detail.type) {
                  case 'pc-image-resp':
                    //onRenderUI(event.detail.data);
                    console.log('pgImage pc-image-resp', event.detail.data);
                    break;
                  default:
                    // console.log('pgImage - unknown event was received');
                    break;
                }
              });
              service.trigger(document, service.CUSTOM_EVENT_NAME, { type: 'pc-image-req', data: {} });
            });
          },
          body: [{
            type: 'container',
            html: $('#pg-image-plugin').html(),
            // label: 'flow',
            // layout: 'flow',
            // items: [
            //   { type: 'label', text: 'A container' },
            //   { type: 'textbox', label: 'textbox', value: 'with a textbox' },
            //   { type: 'label', text: 'and two labels' }
            // ]
          }],
          onsubmit: function (e) {
            console.log('pgImage', e);
          }
        }, {
          service: PercEditorService
        });
      }
    });
  });
})();
