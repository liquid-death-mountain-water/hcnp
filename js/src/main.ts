import videojs from 'video.js';
require('@silvermine/videojs-quality-selector')(videojs);

let player = videojs('hcnp-player', {
  controlBar: {
    children: [
      'playToggle',
      'progressControl',
      'volumePanel',
      'qualitySelector',
      'fullscreenToggle',
    ],
  },
});

const HCNP = (<any>window).HCNP || {};
const idx = HCNP.video.index || '01';
// player.src(HCNP.video.sources || []);


const getStringAsSeconds = (strTime) => {
  const split = strTime.split(':');
  return parseFloat(split[0]) * 60 + (parseFloat(split[1]));
}

const seekBar = document.body.querySelector('.vjs-progress-holder.vjs-slider.vjs-slider-horizontal');


let lastX;
let isFlagged = false;
seekBar.addEventListener('mousemove', (evt: any) => {
  lastX = evt.layerX;
  update();
});
document.body.querySelector('.vjs-progress-control.vjs-control').addEventListener('mousemove', (evt: any) => {
  lastX = evt.layerX;
  update();
});

const thumbHolder = document.createElement('div');
thumbHolder.style.width = '240px';
thumbHolder.style.height = '135px';
thumbHolder.style.width = '240px';
thumbHolder.style.height = '135px';
thumbHolder.style.position = 'absolute';
thumbHolder.style.pointerEvents = 'none';
thumbHolder.style.backgroundColor = '#000';
thumbHolder.style.backgroundPosition = '1680px 2430px';
thumbHolder.style.backgroundRepeat = 'no-repeat';
thumbHolder.style.top = '-160px';
thumbHolder.style.left = '-120px';
thumbHolder.style.borderRadius = '2px';
thumbHolder.style.boxShadow = 'rgba(0, 0, 0, 0.5) 0px 0px 10px';

const attachToMouseThing = (el) => {
  const disp = document.body.querySelector('.vjs-mouse-display');
  if (disp) {
    disp.appendChild(el);
  } else {
    setTimeout(() => { attachToMouseThing(el); }, 100);
  }
}
attachToMouseThing(thumbHolder)
// document.body.querySelector('.vjs-mouse-display').appendChild(thumbHolder);

const timerElement = document.body.querySelector('.vjs-time-tooltip');
const getCurrentTime = () => {
  if(timerElement){
    return getStringAsSeconds(timerElement.innerHTML);
  } else {
    return 0;
  }
}
const update = () => {
  if (isFlagged) { return; }
  isFlagged = true;

  requestAnimationFrame(() => {
    const hoveredTime = getCurrentTime();
    const thumb = getThumb(hoveredTime);
    thumbHolder.style.backgroundImage = `url('https://ld-hcnp.s3.us-east-2.amazonaws.com/${idx}/${idx}_thumbs-${thumb.pageIdx}.jpg')`;
    thumbHolder.style.backgroundPosition = `${thumb.itemPosition[0]}px ${thumb.itemPosition[1]}px`
    isFlagged = false;
  });
}

const SHEET_WIDTH = 8;
const SHEET_HEIGHT = 4;
const SHEET_PAGINATION = SHEET_WIDTH * SHEET_HEIGHT;
const getThumb = (timeSec: number) => {
  const y = ((timeSec / SHEET_WIDTH) | 0) % SHEET_HEIGHT;
  const x = (Math.floor(timeSec - (y * SHEET_WIDTH))) % SHEET_PAGINATION;
  return {
    pageIdx: (timeSec / SHEET_PAGINATION) | 0,
    itemCoords: [x, y],
    itemPosition: [x * -240, y * -135]
  };
}

// ----------------------


const graph = document.body.querySelector('#play-graph') as HTMLElement;
graph.style.display = 'block';
const fill = graph.querySelector('.mhp1138_hotspotsFill');
fill.setAttribute('width', '0%');
const playbarContainer = document.body.querySelector('.vjs-progress-control.vjs-control');
playbarContainer.appendChild(graph);

const progress = document.body.querySelector('.vjs-play-progress') as HTMLElement;

let fillUpdate = false;
let lastWidth = '0%';
const obs = new MutationObserver((evt: MutationRecord[]) => {
  lastWidth = progress.style.width;
  if (fillUpdate) { return; }
  fillUpdate = true;
  requestAnimationFrame(() => {
    fill.setAttribute('width', lastWidth);
    fillUpdate = false;
  })
});

obs.observe(progress, { attributes: true, childList: false, subtree: false });

if((<any>window).HCNP){
  var list = document.querySelector('.video-list');
  for (var i = list.children.length; i >= 0; i--) {
    list.appendChild(list.children[Math.random() * i | 0]);
  }
}