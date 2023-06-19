import { marked } from 'marked';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import { useState } from 'react';
import { useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/tokyo-night-dark.css';

function App() {
  const [textareaContent, setTextContext] = useState('');

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
    hljs.highlightAll();
  });

  return (
    <div className='min-h-screen bg-[#87B5B5] p-4'>
      <div className='relative layout-container px-8 pt-4 pb-6 transition-all duration-300 ease-in sm:w-[636px] mx-auto lg:w-[800px]'>
        <Container title='Editor'>
          <textarea
            name='editor'
            id='editor'
            rows={15}
            className='w-full min-h-full bg-[#C1D8D8] p-2 border-none outline-none resize-y'
            value={textareaContent}
            onChange={(e) => {
              setTextContext(e.target.value);
            }}
          ></textarea>
        </Container>
      </div>
      <div className='layout-container px-4 transition-all duration-300 ease-in md:w-[768px] mx-auto lg:w-[940px]'>
        <Container title='Previewer'>
          <div id='preview' className='preview p-4'>
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
  return (
    <div className='shadow-black shadow-[0px_0px_10px_rgb(0, 0, 0)]'>
      <div className='flex bg-[#4BA3A3] border-black border-solid border-[1px] border-b-0 py-1 px-2 text-[1.25rem] font-bold'>
        <span className='font-mono mr-2'>&lt;/&gt;</span>
        <span className='mr-auto'>{title}</span>
        <a href={title === 'Editor' ? '#editor' : '#preview'} className=''>
          <span
            className='material-symbols-outlined relative top-[0.2rem] cursor-pointer hover:scale-110 transition-transform ease-in duration-200'
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
          (fullScreen ? 'h-[100vh]' : '')
        }
      >
        {children}
      </div>
    </div>
  );
}
