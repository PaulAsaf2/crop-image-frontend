let inputUpload = document.getElementById('image_uploads');
let selectSection = document.querySelector('.select_section');
let cropSection = document.querySelector('.crop_section');
let cropCont = document.querySelector('.crop_cont');
let cropBtnSection = document.querySelector('.crop_btn_cont');
let backBtn = document.getElementById('back_btn');
let selectBtn = document.getElementById('select_btn');
let imageEl = document.getElementById('image');
const tgErrorPopup = document.querySelector('#tg-error')
const successSection = document.querySelector('.result')
const resultText = document.querySelector('.result_text')
const resultIcon = document.querySelector('.result_icon')
let fileTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/heic',
]
let cropImage;
let tg = window.Telegram.WebApp;

tg.expand();

checkInitData(tg.initData)
  .then(() => {
    getPromocode()
      .catch(error => {
        console.error(error)
        tg.showAlert('Промокод не найден.')
      })
  })
  .catch(error => {
    console.error(error);
    linkToTelegram()
  })

// FUNCTIONS --- FUNCTIONS --- FUNCTIONS

function checkInitData(initData) {
  // /api/validate.php
  return fetch('https://wallstring.monitour.ru/api/validate.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ initData })
  })
    .then(res => {
      if (res.ok) return res.json()
      throw new Error('HTTP-Error: ' + res.status)
    })
    .then(data => {
      const user = JSON.parse(data.initData.user)
      tg.CloudStorage.setItem('userId', user.id)
      return user.id

      // TEMPORARY
      // let fakeUserId = '123'
      // tg.CloudStorage.setItem('userId', fakeUserId)

      // return fakeUserId
      // ---------
    })
}

function linkToTelegram() {
  tgErrorPopup.classList.add('popup_fullwidth_show')
}

function getPromocode() {
  return new Promise((resolve, reject) => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const promocode = urlParams.get('promocode')

    if (promocode) {
      tg.CloudStorage.setItem('promocode', promocode)
      resolve(promocode)
    } else {
      reject('Promocode not found')
    }
  })
}

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

      let loadIcon = document.createElement('img')
      loadIcon.src = './assets/loading.svg'
      loadIcon.classList.add('load-icon')
      cropCont.append(loadIcon)

      uploadImage(blob)
        .then(() => {
          showResultOfUploaded('Изображение отправлено', 'done')
          setTimeout(() => tg.close(), 3000)
        })
        .catch(err => {
          console.error(err)
          showResultOfUploaded('При загрузке произошла ошибка', 'close')
        })
        .finally(() => {
          loadIcon.remove()
        })
    })
    .catch(error => console.error(error))
}

function showResultOfUploaded(text, icon) {
  successSection.classList.add('result_show')
  cropSection.style.display = 'none'
  resultIcon.src = `./assets/${icon}.png`
  resultText.textContent = text
}

// REQUESTS --- REQUESTS --- REQUESTS

function uploadImage(blob) {
  const imageName = `image_${Date.now()}`
  const formData = new FormData();
  formData.append('image', blob, imageName)

  return fetch('https://wallstring.monitour.ru/api/upload-image.php', {
    method: 'POST',
    body: formData,
  })
    .then(res => {
      if (res.ok) return res.json()
      throw new Error('Response is not OK!')
    })
    .then(data => {
      return new Promise((resolve, reject) => {
        tg.CloudStorage.getItems(['userId', 'promocode'], (error, variables) => {
          if (error) {
            reject(error)
          } else if (!variables.userId || !variables.promocode) {
            reject('Failed to retrieve user data.')
          } else {
            const userId = variables.userId
            const promocode = variables.promocode
            const fileName = data.message

            resolve({ userId, promocode, fileName })
          }
        })
      })
    })
    .then(({ userId, promocode, fileName }) => {
      return requestToPuzzlebot(userId)
        .then(() => {
          return requestToSourctech(userId, promocode, fileName)
        })
    })
}

function requestToPuzzlebot(userId) {
  return fetch(`https://api.puzzlebot.top/?token=CwzFVdWEkfZfud657lWqyes9zPhgOy1G&method=scenarioRun&user_id=${userId}&scenario_id=82086`, {
    mode: 'no-cors',
  })
    .then(res => console.log('Request completed. Note: Response is opaque and cannot be inspected due to no-cors mode.'))
}

function requestToSourctech(userId, promocode, fileName) {
  return fetch(`https://pin.sourctech.ru/telegram/string/variableSet.php?img=${fileName}&userId=${userId}&promocode=${promocode}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('HTTP Error! Status: ' + res.status)
      } else {
        console.log('Request successful')
      }
    })
}
// LISTENERS --- LISTENERS --- LISTENERS

inputUpload.addEventListener('change', updateImageDisplay)
backBtn.addEventListener('click', () => {
  window.location.reload()
})
selectBtn.addEventListener('click', addImageToPage)
