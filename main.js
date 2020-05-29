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
    for (const idx in thumbUrls) {
      await load(thumbUrls[idx]);
    }
  }
  const load = async (url) => {
    return new Promise((res) => {
      const img = document.createElement('img');
      img.onload = res;
      img.src = url;
    });
  }

  const onClick = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    if (!hasHover) {
      hasHover = true;
      return;
    }
    createYTplayer(props.videoId);
  };

  const onMouseEnter = () => {
    blurAllOthers();
    hasHover = true;
    targetEl.classList.add('has-hover');
    idx = -1;
    if (ticker) {
      clearInterval(ticker);
      clearTimeout(ticker);
      ticker = null;
    }
    ticker = setTimeout(() => {
      nextThumbnail();
      ticker = setInterval(nextThumbnail, PREVIEW_DURATION_MS / (thumbUrls.length));
    }, 100);
  };
  const nextThumbnail = () => {
    idx += 1;
    if (idx > thumbUrls.length - 1) {
      clearInterval(ticker);
      ticker = null;
      setTimeout(()=>{
        onMouseLeave();
      }, 2000);
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
  };

  const blurAllOthers = () => {
    previews.forEach(x => {
      if(x.id !== props.id){
        x.blur();
      }
    });
  }

  setThumbnail(defaultThumb);
  targetEl.addEventListener('click', onClick)
  targetEl.addEventListener('touchstart', (evt)=>{
    setTimeout(()=>{
      onMouseEnter(evt);
    }, 500);
  })
  targetEl.addEventListener('mouseover', onMouseEnter)
  targetEl.addEventListener('mouseleave', onMouseLeave)

  // Preload thumbnails
  window.addEventListener('load', () => {
    setTimeout(() => { preloadThumbs(); }, (props.index || 0) * 250);
  })
  return {
    id: props.id,
    blur: ()=>{ onMouseLeave(); },
  };
}


const previews = Array.from(document.querySelectorAll('.preview')).map((el, index) => {
  const props = Object.assign({
    index,
    id: Math.random().toString(36).slice(2),
  }, el.dataset);
  if (!props.videoId) {
    return null;
  }
  return new PlayerPreview(el, props);
}).map(x => x);



function createYTplayer(id) {
  // dimmer
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');

  // video
  const el = document.createElement('div');
  el.classList.add('yt-modal');
  el.innerHTML = `
    <iframe src="https://www.youtube.com/embed/${id}?rel=0&showinfo=0&autoplay=1&modestbranding=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
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


