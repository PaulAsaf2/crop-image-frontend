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
const path = 'https://127.0.0.1:3000/api';
let cropImage;
let tg = window.Telegram.WebApp;
let queryId = tg.initDataUnsafe?.query_id;
let userId = tg.initDataUnsafe?.user?.id;

tg.expand();

// FUNCTIONS --- FUNCTIONS --- FUNCTIONS

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

function addImageToPage() {
  cropImage.result({ type: 'blob', size: 'viewport' })
    .then((blob) => {
      let imgEl = document.createElement('img')
      imgEl.src = URL.createObjectURL(blob)
      cropCont.innerHTML = ''
      cropCont.append(imgEl)
      cropCont.classList.add('flex')

      uploadImage(blob)
    })
    .catch(error => console.log(error))
}

// REQUESTS --- REQUESTS --- REQUESTS

function uploadImage(blob) {
  const formData = new FormData();
  formData.append('image', blob, 'filename')

  fetch(`${path}/upload`, {
    method: 'POST',
    body: formData,
  })
    .then(res => res.json())
    .then(data => {
      let fileName = data.message
      requestToPuzzlebot()
      getCode(fileName)
    })
    .catch(err => {
      alert('При загрузке изображения произошла ошибка.')
      console.log(err)
    });
}

function requestToPuzzlebot() {
  fetch(`https://api.puzzlebot.top/?token=CwzFVdWEkfZfud657lWqyes9zPhgOy1G&method=scenarioRun&user_id=${userId}&scenario_id=82086`, {
    mode: 'no-cors',
  })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
}

function getCode(fileName) {
  fetch(`${path}/get-code`)
    .then(res => res.json())
    .then(data => {
      let codeID = data.message;

      fetch(`https://pin.sourctech.ru/telegram/string/variableSet.php?img=${fileName}&userId=${userId}&promocode=${codeID}`, {
        mode: 'no-cors',
      })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.log(err))
    })
    .catch(err => {
      alert('При чтении параметра code произошла ошибка.')
      console.log(err)
    });
}

// LISTENERS --- LISTENERS --- LISTENERS

inputUpload.addEventListener('change', updateImageDisplay)
backBtn.addEventListener('click', () => {
  window.location.reload()
})
selectBtn.addEventListener('click', addImageToPage)
