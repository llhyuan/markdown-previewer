import { marked } from 'marked';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import { useState } from 'react';
import { useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/tokyo-night-dark.css';
import { useRef } from 'react';
import JsPDF from 'jspdf';

function App() {
  const [textareaContent, setTextContext] = useState('');
  const resizerRef = useRef(null);
  const previewRef = useRef(null);
  const [isResizing, setResizing] = useState(false);
  const [edited, setEdited] = useState(true);

  const preview = parse(
    DOMPurify.sanitize(
      marked.parse(textareaContent, {
        mangle: false,
        headerIds: false,
        breaks: true,
        gfm: true,
      })
    )
  );

  useEffect(() => {
    import('./assets/example.md').then((res) => {
      fetch(res.default)
        .then((res) => {
          return res.text();
        })
        .then((res) => setTextContext(res));
    });
  }, []);

  useEffect(() => {
    if (!isResizing || edited) {
      hljs.highlightAll();
      setEdited(false);
    }
  });

  useEffect(() => {
    const editor = resizerRef.current.previousElementSibling;
    const editorStyle = window.getComputedStyle(editor);
    let editorWidth = parseInt(editorStyle.width, 10);
    let x = 0;

    function onPointerMove(e) {
      const dx = e.pageX - x;
      x = e.pageX;
      editorWidth = editorWidth + dx;
      document.body.style.setProperty('--editor-width', editorWidth + 'px');
    }

    function onPointerUp() {
      document.removeEventListener('pointermove', onPointerMove);
      setResizing(false);
    }

    function onPointerDown(e) {
      x = e.pageX;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      setResizing(true);
    }

    let resizer = resizerRef.current;
    resizer.addEventListener('pointerdown', onPointerDown);

    return () => {
      resizer.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  return (
    <div
      className={
        'min-h-screen bg-[#87B5B5] p-4 xl:flex xl:pt-[1.2rem] ' +
        (isResizing ? 'select-none' : '')
      }
    >
      <div className='px-8 pt-4 pb-6 transition-all duration-300 ease-in sm:w-[636px] mx-auto lg:w-[800px] xl:mx-0 xl:p-0 xl:mr-2rem xl:h-[91vh] xl:w-[--editor-width] xl:transition-none'>
        <Container title='Editor'>
          <textarea
            name='editor'
            id='editor'
            rows={10}
            className='w-full h-full bg-[#C1D8D8] p-2 border-none outline-none resize-y xl:resize-none'
            value={textareaContent}
            onChange={(e) => {
              setTextContext(e.target.value);
              setEdited(true);
            }}
          ></textarea>
        </Container>
      </div>
      <div ref={resizerRef} className='group hidden xl:flex w-[1rem]'>
        <div className='opacity-0 group-hover:opacity-100 cursor-col-resize transition-all ease-in duration-300 w-[10px] h-32 bg-black self-center mx-auto'></div>
      </div>
      <div className='layout-container px-4 transition-all duration-300 ease-in md:w-[768px] mx-auto lg:w-[940px] xl:mx-0 xl:w-[calc(100vw-var(--editor-width))] xl:p-0 xl:h-[91vh] xl:transition-none'>
        <Container title='Previewer'>
          <div
            ref={previewRef}
            id='preview'
            className='preview h-full p-4 overflow-scroll px-12'
          >
            {preview}
          </div>
        </Container>
      </div>
    </div>
  );
}

export default App;

function Container({ children, title }) {
  const [fullScreen, setFullScreen] = useState(false);

  function downloadPdf(e) {
    const preview = e.target.parentElement.parentElement.nextSibling.firstChild;
    const pdf = new JsPDF({ unit: 'mm' });
    pdf
      .html(preview, {
        autoPaging: 'text',
        width: 210,
        windowWidth: 700,
      })
      .then(() => {
        pdf.save('markdown.pdf');
      });
  }
  function downloadMd(e) {
    const preview = e.target.parentElement.parentElement.nextSibling.firstChild;
    const blob = new Blob([preview.textContent], { type: 'text/plain' });
    console.log(blob);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'myMarkdown.md';
    link.href = url;
    link.click();
  }

  return (
    <div className='shadow-black shadow-[0px_0px_10px_rgb(0, 0, 0)] h-full w-full'>
      <div className='flex bg-[#4BA3A3] border-black border-solid border-[1px] border-b-0 py-1 px-2 text-[1.25rem] font-bold'>
        <span className='font-mono mr-2'>&lt;/&gt;</span>
        <span className='mr-auto'>{title}</span>
        {title === 'Editor' ? (
          <button type='button' className='relative mr-4' onClick={downloadMd}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='1em'
              viewBox='0 0 640 512'
            >
              <path d='M593.8 59.1H46.2C20.7 59.1 0 79.8 0 105.2v301.5c0 25.5 20.7 46.2 46.2 46.2h547.7c25.5 0 46.2-20.7 46.1-46.1V105.2c0-25.4-20.7-46.1-46.2-46.1zM338.5 360.6H277v-120l-61.5 76.9-61.5-76.9v120H92.3V151.4h61.5l61.5 76.9 61.5-76.9h61.5v209.2zm135.3 3.1L381.5 256H443V151.4h61.5V256H566z' />
            </svg>
          </button>
        ) : (
          <button type='button' className='relative mr-4' onClick={downloadPdf}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='1em'
              viewBox='0 0 512 512'
            >
              <path d='M64 464H96v48H64c-35.3 0-64-28.7-64-64V64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V288H336V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM176 352h32c30.9 0 56 25.1 56 56s-25.1 56-56 56H192v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V448 368c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24H192v48h16zm96-80h32c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-8.8 0-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H320v96h16zm80-112c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V432 368z' />
            </svg>{' '}
          </button>
        )}
        <a
          href={title === 'Editor' ? '#editor' : '#preview'}
          className='text-black'
        >
          <span
            className='material-symbols-outlined relative top-[0.2rem] cursor-pointer hover:scale-110 transition-transform ease-in duration-200 xl:hidden'
            onClick={() => {
              setFullScreen(!fullScreen);
            }}
          >
            open_in_full
          </span>
        </a>
      </div>
      <div
        className={
          'bg-[#C1D8D8] border-black border-solid border-[1px] drop-shadow-lg transition-all duration-300 ease-in ' +
          (fullScreen ? 'h-[100vh]' : 'h-full')
        }
      >
        {children}
      </div>
    </div>
  );
}
