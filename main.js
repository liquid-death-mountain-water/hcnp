if (!sessionStorage.getItem('hcnp')) {
  document.body.style.display = 'none';
  if (prompt("password") !== 'hardcore') {
    window.location.href = 'https://liquiddeath.com/'
  } else {
    sessionStorage.setItem('hcnp', '1');
    document.body.style.display = 'block';
  }
}

// https://ld-hcnp.s3.us-east-2.amazonaws.com/01/01_thumbs-3.jpg

const PREVIEW_DURATION_MS = 4 * 1000;
const PlayerPreview = function (targetEl, props) {
  props = props || {};
  let hasHover = false;

  const id = targetEl.getAttribute('data-id');

  // Get thumbnails
  const defaultThumb = `https://ld-hcnp.s3.us-east-2.amazonaws.com/${id}/${id}_poster.png`;
  const hoverUrl = `https://ld-hcnp.s3.us-east-2.amazonaws.com/${id}/${id}_hover.jpg`;

  // const elementWidth =

  let idx = -1;
  let ticker;

  const preloadHover = async () => {
    await load(hoverUrl);
  }
  const load = async (url) => {
    return new Promise((res) => {
      const img = document.createElement('img');
      img.onload = res;
      img.src = url;
    });
  }

  const onClick = (evt) => {
    if (!hasHover) {
      evt.preventDefault();
      evt.stopPropagation();
      hasHover = true;
    }
  };

  const onMouseEnter = () => {
    blurAllOthers();
    hasHover = true;
    targetEl.classList.add('has-hover');
    idx = -1;
    if (ticker) {
      clearTimeout(ticker);
      ticker = null;
    }
    // ticker = setTimeout(() => {
      setThumbnail(hoverUrl);
      nextThumbnail();
    // }, 100);
  };
  const nextThumbnail = () => {
    idx += 1;
    if (idx > 6) {
      idx = 6;
      clearTimeout(ticker);
      ticker = null;
      setTimeout(()=>{
        onMouseLeave();
      }, 2000);
      return;
    }

    setThumbPos(idx);
    ticker = setTimeout(nextThumbnail, PREVIEW_DURATION_MS / 6);
  }
  const setThumbPos = (idx)=>{
    const {width} = targetEl.getBoundingClientRect();
    targetEl.style.backgroundSize = `${width * 6}px auto`;
    targetEl.style.backgroundPosition = `${idx * -100}% center`;
  }
  const setThumbnail = (url) => {
    if(url === defaultThumb){
      targetEl.style.backgroundSize = 'cover';
    }
    // return;
    targetEl.style.backgroundImage = `url(${url})`;
  }
  const onMouseLeave = () => {
    targetEl.classList.remove('has-hover');
    hasHover = false;
    clearTimeout(ticker);
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
    setTimeout(() => { preloadHover(); }, (props.index || 0) * 250);
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
  return new PlayerPreview(el, props);
}).map(x => x);

