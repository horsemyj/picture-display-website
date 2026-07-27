const PER_PAGE = 12;
let images = [];
let page = 1;

async function loadImages(){
  try{
    const res = await fetch('/api/images');
    if(!res.ok) throw new Error('加载失败');
    images = await res.json();
    render();
  }catch(e){
    document.getElementById('gallery').innerHTML = '<p style="padding:16px">无法读取图片列表，请确认 server 在运行且 assets 文件夹存在。</p>';
    console.error(e);
  }
}

function render(){
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  const start = (page - 1) * PER_PAGE;
  const pageImgs = images.slice(start, start + PER_PAGE);
  pageImgs.forEach(src => {
    const div = document.createElement('div');
    div.className = 'thumb';
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.addEventListener('click', () => openModal(src));
    div.appendChild(img);
    gallery.appendChild(div);
  });
  renderPagination();
}

function renderPagination(){
  const total = Math.max(1, Math.ceil(images.length / PER_PAGE));
  const container = document.getElementById('pagination');
  container.innerHTML = '';
  for(let i=1;i<=total;i++){
    const btn = document.createElement('button');
    btn.textContent = i;
    if(i===page) btn.classList.add('active');
    btn.addEventListener('click', () => { page = i; render(); });
    container.appendChild(btn);
  }
}

function openModal(src){
  const modal = document.getElementById('modal');
  document.getElementById('modal-img').src = src;
  const dl = document.getElementById('download-btn');
  dl.href = src;
  // 自动生成文件名用于下载
  const urlParts = decodeURIComponent(src).split('/');
  dl.download = urlParts[urlParts.length-1] || 'image';
  modal.classList.remove('hidden');
}

document.getElementById('close').addEventListener('click', ()=> {
  document.getElementById('modal').classList.add('hidden');
});

document.getElementById('modal').addEventListener('click', (e)=>{
  if(e.target.id === 'modal') document.getElementById('modal').classList.add('hidden');
});

loadImages();