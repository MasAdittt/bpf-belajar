// import { toast } from 'react-toastify';
// import { loadGoogleMapsScript } from '../../maps';

// // Fungsi untuk mengekspansi URL pendek
// export const expandShortUrl = async (shortUrl) => {
//     console.log('🔍 Mencoba mengekspansi URL pendek:', shortUrl);

//     try {
//         const response = await fetch('http://localhost:3000/expand/url', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ url: shortUrl }),
//             credentials: 'include'
//         });

//         const data = await response.json();
        
//         if (!response.ok) {
//             throw new Error(data.error || 'Gagal mengekspansi URL');
//         }

//         console.log('✅ URL panjang ditemukan:', data);
//         return data.longUrl;

//     } catch (error) {
//         console.error('❌ Error dalam expandShortUrl:', error);
//         toast.error('Gagal memproses URL pendek Maps: ' + error.message);
//         return null;
//     }
// };

// const getPlaceIdFromCoordinates = async (lat, lng) => {
//     try {
//         await loadGoogleMapsScript();

//         if (!window.google) {
//             throw new Error('Google Maps API belum dimuat');
//         }

//         return new Promise((resolve, reject) => {
//             const geocoder = new google.maps.Geocoder();
//             const latlng = { lat, lng };

//             // Coba dengan geocoder dulu
//             geocoder.geocode({ location: latlng }, async (results, status) => {
//                 if (status === 'OK' && results[0]) {
//                     console.log('✅ Place ID ditemukan dari Geocoder:', results[0].place_id);
//                     resolve(results[0].place_id);
//                 } else {
//                     // Jika geocoder gagal, coba dengan Places nearby search
//                     try {
//                         const map = new google.maps.Map(document.createElement('div'));
//                         const service = new google.maps.places.PlacesService(map);
                        
//                         const request = {
//                             location: latlng,
//                             radius: '100', // Radius 100 meter
//                             rankBy: google.maps.places.RankBy.DISTANCE // Urutkan berdasarkan jarak terdekat
//                         };

//                         service.nearbySearch(request, (results, status) => {
//                             if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
//                                 console.log('✅ Place ID ditemukan dari Nearby Search:', results[0].place_id);
//                                 resolve(results[0].place_id);
//                             } else {
//                                 console.log('❌ Tidak ada hasil di sekitar koordinat');
//                                 resolve(null);
//                             }
//                         });
//                     } catch (error) {
//                         console.error('❌ Error dalam nearbySearch:', error);
//                         resolve(null);
//                     }
//                 }
//             });
//         });
//     } catch (error) {
//         console.error('❌ Error dalam getPlaceIdFromCoordinates:', error);
//         throw error;
//     }
// };
// // Fungsi utama untuk mengekstrak informasi dari URL
// export const extractMapInfo = async (url) => {
//     console.log('🔍 Mulai mengekstrak info dari URL:', url);

//     try {
//         // Handle jika url adalah object dengan property longUrl
//         const urlString = typeof url === 'object' && url.longUrl ? url.longUrl : url;
        
//         const shortUrlPattern = /maps\.app\.goo\.gl\/([\w-]+)/;
        
//         // Cek apakah URL pendek
//         if (urlString.match(shortUrlPattern)) {
//             const expandedUrl = await expandShortUrl(urlString);
//             if (expandedUrl) {
//                 return await extractMapInfo(expandedUrl);
//             }
//             return null;
//         }

//         // Pertama, coba ekstrak koordinat dari parameter !3d dan !4d (koordinat lokasi sebenarnya)
//         const preciseCoordPattern = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
//         let coordMatch = urlString.match(preciseCoordPattern);
        
//         // Jika tidak ditemukan, coba pola alternatif dengan /!3d dan /!4d
//         if (!coordMatch) {
//             const altPreciseCoordPattern = /\/!3d(-?\d+\.\d+)\/!4d(-?\d+\.\d+)/;
//             coordMatch = urlString.match(altPreciseCoordPattern);
//         }

//         // Jika masih tidak ditemukan, coba pola yang menggunakan @lat,lng (fallback)
//         if (!coordMatch) {
//             const viewportCoordPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
//             coordMatch = urlString.match(viewportCoordPattern);
//         }
        
//         if (coordMatch) {
//             const lat = parseFloat(coordMatch[1]);
//             const lng = parseFloat(coordMatch[2]);
//             console.log('✅ Koordinat ditemukan:', { lat, lng });
            
//             // Dapatkan place ID dari koordinat
//             const placeId = await getPlaceIdFromCoordinates(lat, lng);
//             if (placeId) {
//                 return { placeId };
//             }
//         }

//         console.log('❌ Koordinat tidak ditemukan dalam URL');
//         toast.error('Tidak dapat menemukan informasi lokasi');
//         return null;

//     } catch (error) {
//         console.error('❌ Error dalam extractMapInfo:', error);
//         toast.error('Gagal memproses URL Maps');
//         return null;
//     }
// };

// // Fungsi untuk mendapatkan detail tempat
// export const getPlaceDetails = async (mapInfo) => {
//     console.log('🔍 Mulai mendapatkan detail tempat dengan info:', mapInfo);

//     try {
//         await loadGoogleMapsScript();

//         if (!window.google) {
//             throw new Error('Google Maps API belum dimuat');
//         }

//         if (!mapInfo?.placeId) {
//             console.error('❌ Place ID tidak tersedia');
//             toast.error('Informasi lokasi tidak valid');
//             return null;
//         }

//         return new Promise((resolve) => {
//             const map = new google.maps.Map(document.createElement('div'));
//             const service = new google.maps.places.PlacesService(map);

//             service.getDetails({
//                 placeId: mapInfo.placeId,
//                 fields: [
//                     'name',
//                     'formatted_address',
//                     'rating',
//                     'user_ratings_total',
//                     'geometry',
//                     'photos'
//                 ]
//             }, (place, status) => {
//                 if (status === google.maps.places.PlacesServiceStatus.OK) {
//                     const details = {
//                         name: place.name,
//                         address: place.formatted_address,
//                         rating: place.rating,
//                         totalRatings: place.user_ratings_total,
//                         latitude: place.geometry?.location?.lat(),
//                         longitude: place.geometry?.location?.lng(),
//                         placeId: mapInfo.placeId,
//                         image_url: place.photos?.[0]?.getUrl({
//                             maxWidth: 800,
//                             maxHeight: 600
//                         })
//                     };
//                     console.log('✅ Detail tempat ditemukan:', details);
//                     resolve(details);
//                 } else {
//                     console.error('❌ Gagal mendapatkan detail tempat:', status);
//                     toast.error('Gagal mendapatkan detail tempat');
//                     resolve(null);
//                 }
//             });
//         });
//     } catch (error) {
//         console.error('❌ Error dalam getPlaceDetails:', error);
//         toast.error('Terjadi kesalahan saat memproses detail tempat');
//         return null;
//     }
// };