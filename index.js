let inputUpload = document.getElementById('image_uploads');
let selectSection = document.querySelector('.select_section');
let cropSection = document.querySelector('.crop_section');
let cropCont = document.querySelector('.crop_cont');
let cropBtnSection = document.querySelector('.crop_btn_cont');
let backBtn = document.getElementById('back_btn');
let selectBtn = document.getElementById('select_btn');
let imageEl = document.getElementById('image');
let fileTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/heic',
]
const path = 'https://86a0416fd324.vps.myjino.ru/api'
let cropImage
let tg = window.Telegram.WebApp
let queryId = tg.initDataUnsafe?.query_id
let userId = tg.initDataUnsafe?.user?.id
const options = {
  'Content-Security-Policy': 'upgrade-insecure-requests',
}

tg.expand();

fetch(path, options)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.log(err))

fetch(`${path}/get`, options)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.log(err))

function validFileType(file) {
  return fileTypes.includes(file.type)
}

function updateImageDisplay() {
  let curFile = inputUpload.files[0]

  if (validFileType(curFile)) {
    imageEl.src = URL.createObjectURL(curFile)
    imageEl.alt = image.title = curFile.name
    
    addToCroppie()
    selectSection.style.display = 'none'
    cropSection.style.display = 'block'
    cropCont.appendChild(cropBtnSection)
  } else {
    alert('File is not valid.')
  }
}

function addToCroppie() {
  cropImage = new Croppie(imageEl, {
    viewport: { width: 168, height: 168, type: 'circle' },
    boundary: { width: 306, height: 222 },
    showZoomer: true,
  });
}

inputUpload.addEventListener('change', updateImageDisplay)
backBtn.addEventListener('click', () => {
  selectSection.style.display = 'block'
  cropSection.style.display = 'none'
})

selectBtn.addEventListener('click', () => {
  cropImage.result({type: 'blob', size: 'viewport'})
    .then((blob) => {
      let imgEl = document.createElement('img')
      imgEl.src = URL.createObjectURL(blob)
      cropCont.innerHTML = ''
      cropCont.append(imgEl)
      cropCont.classList.add('flex')
      
      const formData = new FormData();
      formData.append('image', blob, 'filename')
      formData.append('name', 'Paul');

      fetch(`${path}/submit`, {
        method: 'POST',
        'Content-Security-Policy': 'upgrade-insecure-requests',
        body: formData,
      })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.log(err));
    })
    .catch(error => console.log(error))
})
