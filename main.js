let hasFetched = false;
let counts = {};

const pubSub = (function(){
  let listeners = [];
  return {
    bind: (cb)=>{ listeners.push(cb) },
    trigger: () => { listeners.forEach(x => x()) }
  }
})();

const LikeViews = function (targetEl, { slug }) {
  const api = `https://ld-hcnp-stats.gigalixirapp.com/api`;
  // const api = `//localhost:4000/api`;

  const viewText = targetEl.querySelector('span');
  const likeText = targetEl.querySelector('span.percent');

  const windowSlug = ()=>window.location.href.split('/')[3];


  const getCounts = () => {
    if(hasFetched){ return; }
    hasFetched = true;

    fetch(`${api}/`)
      .then(x => x.json())
      .then(({ data }) => {
        let item;
        for(let i = 0; i < data.length; i++){
          item = data[i];
          counts[item.slug] = {
            likes: item.likes,
            views: item.views,
          };
        }
        pubSub.trigger();
      });
  }

  const updateCounts = () => {
    const likePercentage = counts[slug].likes;
    const viewCount = counts[slug].views;

    updateLikeText(likePercentage);
    updateViewText(viewCount);

    targetEl.style.display = 'flex';
    targetEl.style.opacity = 1;
  }

  const updateLikeText = (percent) => {
    likeText.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><g fill="none" fill-rule="evenodd"><path d="M0 0h16v16H0z"/><path fill="#FFF" fill-rule="nonzero" d="M1 14h2V6H1v8zm14-7l-1-2h-4V2 1H9L5 5v8l1 1h6l1-1 2-5V7z"/></g></svg> ${percent}`;
  };
  const updateViewText = (views) => {
    viewText.innerHTML = `${views} views`
  };

  const registerView = () => {
    const key = `ld-${slug}-v`
    if(sessionStorage.getItem(key)){
      return;
    }
    sessionStorage.setItem(key, 'true');

    fetch(`${api}/${slug}/view/`, { method: 'PUT' })
      .then(x => x.json())
      .then(({ data: { likes, views }}) => {
        counts[slug] = {
          likes,
          views,
        };
        updateCounts();
      });
  }
  const registerLike = () => {
    const key = `ld-${slug}-l`
    if(sessionStorage.getItem(key)){
      return;
    }
    sessionStorage.setItem(key, 'true');

    fetch(`${api}/${slug}/like/`, { method: 'PUT' })
      .then(x => x.json())
      .then(({ data: { likes, views }}) => {
        // counts[slug] = {
        //   likes,
        //   views,
        // };
        // updateCounts();
      });
  }


  if(windowSlug() === slug){
    likeText.addEventListener('click', (evt)=>{
      registerLike();
      likeText.classList.add('active');
    });
  } else {
    likeText.classList.add('inactive');
  }

  if(windowSlug() === slug){
    registerView();
  }

  const key = `ld-${slug}-l`;
  if(sessionStorage.getItem(key)){
    likeText.classList.add('active');
  }

  pubSub.bind(updateCounts);
  getCounts();
}



const PREVIEW_DURATION_MS = 6 * 1000;
const PlayerPreview = function (targetEl, props) {
  props = props || {};
  let hasHover = false;

  const id = targetEl.getAttribute('data-id');

  // Get thumbnails
  const defaultThumb = `https://ld-hcnp.s3.us-east-2.amazonaws.com/${id}/${id}_poster.png`;
  const hoverUrl = `https://ld-hcnp.s3.us-east-2.amazonaws.com/${id}/${id}_hover.jpg`;

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

const likeViews = Array.from(document.querySelectorAll('.likes')).map(el => {
  let slug = window.location.href.split('/')[3];

  if(!slug){
    try {
      slug = el.closest('.details').querySelector('a:not(.share)').href.split('/')[3];
    }catch(err){
      return;
    }
  }

  return new LikeViews(el, { slug });
}).map(x => x);

