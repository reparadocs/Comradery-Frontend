import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import MarkdownShortcuts from 'quill-markdown-shortcuts';
import MagicUrl from 'quill-magic-url';
import quillEmoji from 'quill-emoji';
import QuillImageDropAndPaste from 'quill-image-drop-and-paste';
import uuidv4 from 'uuid/v4';
import ApiClient from '../ApiClient';
import { dataURItoBlob } from '../utils';
import BlotFormatter from 'quill-blot-formatter';
import Loader from 'react-loader-spinner';

Quill.register(
  {
    'formats/emoji': quillEmoji.EmojiBlot,
    'modules/emoji-toolbar': quillEmoji.ToolbarEmoji,
    'modules/emoji-textarea': quillEmoji.TextAreaEmoji,
    'modules/emoji-shortname': quillEmoji.ShortNameEmoji
  },
  true
);

Quill.register('modules/magicUrl', MagicUrl);
Quill.register('modules/markdownShortcuts', MarkdownShortcuts);
Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);
Quill.register('modules/blotFormatter', BlotFormatter);

const ImageFormatAttributesList = ['alt', 'height', 'width', 'style'];

const BaseImageFormat = Quill.import('formats/image');
class ImageFormat extends BaseImageFormat {
  static formats(domNode) {
    return ImageFormatAttributesList.reduce(function (formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(ImageFormat, true);

export default class XEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uploading: false,
      error: false
    };
    this.myRef = React.createRef();
    this.imageHandler = this.imageHandler.bind(this);
    this.focus = this.focus.bind(this);
  }

  componentDidMount() {
    const editor = this.myRef.current.getEditor();

    var tooltip = editor.theme.tooltip;
    var input = tooltip.root.querySelector('input[data-video]');
    input.dataset.video = 'Youtube URL';

    editor.getModule('toolbar').addHandler('image', (clicked) => {
      if (clicked) {
        let fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('style', 'display: none;');
        fileInput.setAttribute(
          'accept',
          'image/png, image/gif, image/jpeg, image/bmp, image/x-icon'
        );
        fileInput.classList.add('ql-image');
        fileInput.addEventListener('change', () => {
          var files = fileInput.files,
            file;
          if (files.length > 0) {
            file = files[0];
            var type = file.type;
            var reader = new FileReader();
            reader.onload = (e) => {
              // handle the inserted image
              this.imageHandler(e.target.result, type);
              fileInput.value = '';
            };
            reader.readAsDataURL(file);
          }
        });

        document.body.appendChild(fileInput);
        fileInput.click();
      }
    });
  }

  imageHandler(imageDataUrl, type) {
    this.setState({ uploading: true });
    if (!type) type = 'image/png';

    var blob = dataURItoBlob(imageDataUrl, type);

    var filename = [uuidv4(), '.', type.match(/^image\/(\w+)$/i)[1]].join('');

    ApiClient.upload_file(`post/upload_file/${filename}`, blob, type, {
      onReturn: () => {
        this.setState({ uploading: false });
      },
      onError: () => {
        this.setState({ error: true });
        setTimeout(() => {
          this.setState({ error: false });
        }, 2500);
      },
      onSuccess: (data) => {
        const editor = this.myRef.current.getEditor();
        const index = (editor.getSelection() || {}).index || editor.getLength();
        if (index) editor.insertEmbed(index, 'image', data.file_url, 'user');
      }
    });
  }

  focus() {
    this.myRef.current.focus();
  }

  getEditor() {
    return this.myRef.current.getEditor();
  }

  render() {
    let theme = this.props.theme ? this.props.theme : 'snow';
    let container = [
      'bold',
      'italic',
      'underline',
      'blockquote',
      'code-block',
      'link'
    ];
    if (theme === 'snow') {
      container.push('emoji');
      container.push('image');
      container.push('video');
    }

    return (
      <div>
        {this.state.uploading && (
          <div
            className='bg-gray-600 text-white px-10 py-4 fixed flex items-center justify-center rounded shadow-md'
            style={{
              width: 'fit-content',
              zIndex: 100,
              left: '50%',
              top: 70,
              transform: 'translate(-50%, 0%)'
            }}
          >
            Uploading Image &nbsp;
            <Loader type='Oval' color='white' height={20} width={20} />
          </div>
        )}

        {this.state.error && (
          <div
            className='bg-red-700 text-white px-10 py-4 fixed flex items-center justify-center rounded shadow-md'
            style={{
              width: 'fit-content',
              zIndex: 100,
              left: '50%',
              top: 10,
              transform: 'translate(-50%, 0%)'
            }}
          >
            Image could not be uploaded! Please try again
          </div>
        )}
        <ReactQuill
          className={this.props.className}
          style={this.props.style}
          theme={theme}
          ref={this.myRef}
          onChange={this.props.onChange}
          value={this.props.value}
          modules={{
            toolbar: {
              container: [container]
            },
            'emoji-toolbar': true,
            'emoji-textarea': false,
            'emoji-shortname': true,
            markdownShortcuts: {},
            magicUrl: true,
            imageDropAndPaste: {
              handler: this.imageHandler
            },
            blotFormatter: {}
          }}
          formats={[
            'bold',
            'italic',
            'underline',
            'code',
            'blockquote',
            'list',
            'bullet',
            'code-block',
            'header',
            'indent',
            'link',
            'emoji',
            'image',
            'video'
          ]}
          placeholder='Write a reply...'
        />
      </div>
    );
  }
}
