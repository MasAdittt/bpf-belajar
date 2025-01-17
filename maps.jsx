export const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
        if (window.google) {
            resolve(window.google.maps);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.addEventListener('load', () => {
            resolve(window.google.maps);
        });

        script.addEventListener('error', () => {
            reject(new Error('Gagal memuat Google Maps API'));
        });

        document.body.appendChild(script);
    });
};
