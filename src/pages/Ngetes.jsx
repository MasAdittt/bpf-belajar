import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const storage = getStorage();
const imageRef = ref(storage, 'listings/-O5pjE0DPXr3GkvTeVNG/armada.jpg');

getDownloadURL(imageRef).then((url) => {
  const img = document.getElementById('image');
  img.src = url;
}).catch((error) => {
  console.error('Error getting download URL:', error);
});