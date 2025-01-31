// utils/urlUtils.js

/**
 * Mengubah string menjadi format URL-friendly slug
 * Contoh: "Warung Nasi Goreng & Cafe" -> "warung-nasi-goreng-cafe"
 */
export const createSlug = (text) => {
    if (!text) return '';
    
    return text
      .toLowerCase() // Ubah ke huruf kecil
      .replace(/[àáâãäçèéêëìíîïñòóôõöùúûüýÿ]/g, c => // Handle aksen
        'aaaaaceeeeiiiinooooouuuuyy'['àáâãäçèéêëìíîïñòóôõöùúûüýÿ'.indexOf(c)])
      .replace(/[^a-z0-9]+/g, '-') // Ganti karakter special dengan dash
      .replace(/^-+|-+$/g, '') // Hapus dash di awal dan akhir
      .replace(/-+/g, '-'); // Ganti multiple dash dengan single dash
  };
  
  /**
   * Membuat URL lengkap untuk listing
   * @param {string} title - Judul listing
   * @param {string} id - ID listing dari Firebase
   * @returns {string} URL lengkap
   */
  export const createListingUrl = (title, id) => {
    const slug = createSlug(title);
    return `/${slug}/${id}`;
  };
  
  /**
   * Ekstrak ID dari URL listing
   * @param {string} path - Path URL (e.g., "/warung-nasi-goreng/-OHvEAuV9b")
   * @returns {string} ID listing
   */
  export const extractIdFromPath = (path) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };
  
  /**
   * Validasi format slug
   * @param {string} slug - Slug yang akan divalidasi
   * @returns {boolean} True jika format valid
   */
  export const isValidSlug = (slug) => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  };
  
  /**
   * Membuat meta title untuk SEO
   * @param {string} title - Judul listing
   * @returns {string} Meta title yang dioptimasi
   */
  export const createMetaTitle = (title) => {
    const siteName = 'Bali Pet Friendly';
    const maxLength = 60;
    
    if (!title) return siteName;
    
    const fullTitle = `${title} | ${siteName}`;
    return fullTitle.length > maxLength
      ? `${title.slice(0, maxLength - siteName.length - 4)}... | ${siteName}`
      : fullTitle;
  };
  
  /**
   * Membuat meta description untuk SEO
   * @param {string} description - Deskripsi listing
   * @returns {string} Meta description yang dioptimasi
   */
  export const createMetaDescription = (description) => {
    const maxLength = 160;
    
    if (!description) return '';
    
    return description.length > maxLength
      ? `${description.slice(0, maxLength - 3)}...`
      : description;
  };