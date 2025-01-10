export const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
        // Cek jika Google Maps sudah dimuat
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }

        // Callback untuk Google Maps
        window.initGoogleMaps = () => {
            if (window.google && window.google.maps) {
                resolve(window.google.maps);
            } else {
                reject(new Error('Google Maps failed to load'));
            }
        };

        try {
            // Cek apakah script sudah ada
            if (!document.querySelector('#google-maps-script')) {
                const script = document.createElement('script');
                script.id = 'google-maps-script';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
                script.async = true;
                script.defer = true;
                
                script.onerror = () => {
                    reject(new Error('Failed to load Google Maps script'));
                };

                document.head.appendChild(script);
            }
        } catch (error) {
            reject(error);
        }
    });
};