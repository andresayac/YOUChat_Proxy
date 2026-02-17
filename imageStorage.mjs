const imageStorage = new Map();
let imageCounter = 0;

/**
 * Store image in memory
 * @param {string} base64Data base64 data
 * @param {string} mediaType media type ("image/jpeg")
 * @returns {{ imageId: string, mediaType: string }} Returns image information
 */
export function storeImage(base64Data, mediaType) {
    const randomPart = Math.floor(Math.random() * 10000);
    const imageId = `image_${Date.now()}_${imageCounter++}_${randomPart}`;

    imageStorage.set(imageId, { imageId, base64Data, mediaType });
    // console.log(`Image stored with ID: ${imageId}, Media Type: ${mediaType}`);
    // Print stored base64
    // console.log(`Base64 Data for Image ID ${imageId}: ${base64Data.substring(0, 100)}...`);

    return { imageId, mediaType };
}

/**
 * Get image data
 * @param {string} imageId Image ID
 * @returns {object|null} base64 data and media type
 */
export function getImage(imageId) {
    return imageStorage.get(imageId) || null;
}

/**
 * Get the last image
 * @returns {object|null} base64 data and media type
 */
export function getLastImage() {
    const lastKey = Array.from(imageStorage.keys()).pop();
    return lastKey ? imageStorage.get(lastKey) : null;
}

/**
 * Delete image data
 * @param {string} imageId Image ID
 */
export function removeImage(imageId) {
    imageStorage.delete(imageId);
}

/**
 * Clear all stored images
 */
export function clearAllImages() {
    imageStorage.clear();
    imageCounter = 0;
    // console.log("All images have been cleared from memory.");
}

/**
 * Print all stored images
 */
export function printAllImages() {
    console.log('Current images stored in memory:');
    imageStorage.forEach((value, key) => {
        console.log(`Image ID: ${key}, Media Type: ${value.mediaType}`);
        console.log(`Base64 Data: ${value.base64Data.substring(0, 100)}...`);
    });
}