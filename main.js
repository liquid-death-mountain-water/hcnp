const PREVIEW_DURATION_MS = 4 * 1000;
const PlayerPreview = function (targetEl, props) {
  props = props || {};
  let hasHover = false;


  // Get thumbnails
  const defaultThumb = `https://img.youtube.com/vi/${props.videoId}/hqdefault.jpg`
  const thumbUrls = [
    `https://img.youtube.com/vi/${props.videoId}/hq1.jpg`,
    `https://img.youtube.com/vi/${props.videoId}/hq2.jpg`,
    `https://img.youtube.com/vi/${props.videoId}/hq3.jpg`,
  ];
  let idx = -1;
  let ticker;

  const preloadThumbs = async () => {
    return new Promise((res)=>{
      thumbUrls.forEach(url => {
        document.createElement('img').src = url;
      });
      res();
    });
  }

  const onClick = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    if(!hasHover){ return; }
    createYTplayer(props.videoId);
  };

  const onMouseEnter = () => {
    hasHover = true;
    targetEl.classList.add('has-hover');
    idx = -1;
    if (ticker){
      clearInterval(ticker);
      clearTimeout(ticker);
      ticker = null;
    }
    ticker = setTimeout(()=>{
      nextThumbnail();
      ticker = setInterval(nextThumbnail, PREVIEW_DURATION_MS / (thumbUrls.length));
    }, 100);
  };
  const nextThumbnail = () => {
    idx += 1;
    if(idx > thumbUrls.length - 1){
      clearInterval(ticker);
      ticker = null;
      return;
    }
    setThumbnail(thumbUrls[idx]);
  }
  const setThumbnail = (url) => {
    targetEl.style.backgroundImage = `url(${url})`;
  }
  const onMouseLeave = () => {
    targetEl.classList.remove('has-hover');
    hasHover = false;
    clearInterval(ticker);
    ticker = null;
    setThumbnail(defaultThumb);
    console.log('out');
  };

  setThumbnail(defaultThumb);
  targetEl.addEventListener('click', onClick)
  targetEl.addEventListener('mouseover', onMouseEnter)
  targetEl.addEventListener('mouseleave', onMouseLeave)

  preloadThumbs();

  return this;
}


Array.from(document.querySelectorAll('.preview')).forEach(el => {
  const props = Object.assign({}, el.dataset);
  if (!props.videoId) {
    return;
  }
  new PlayerPreview(el, props);
});



function createYTplayer(id) {
  // dimmer
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');

  // video
  const el = document.createElement('div');
  el.classList.add('yt-modal');
  el.innerHTML = `
    <iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    <a href="#" id="mod-close">Close</a>
  `;
  document.body.appendChild(overlay);
  document.body.appendChild(el);
  setTimeout(() => {
    overlay.style.opacity = 1;
    el.style.opacity = 1;
  }, 1);

  // close bind
  const onClose = function (evt) {
    el.parentElement.removeChild(el);
    overlay.parentElement.removeChild(overlay);
  };
  document.body.querySelector('#mod-close').addEventListener('click', onClose);
  document.body.querySelector('.overlay').addEventListener('click', onClose);
};


