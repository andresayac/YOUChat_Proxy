import crypto from 'crypto';

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Insert garbled text
export function insertGarbledText(content) {
    const enableGarbledStart = process.env.ENABLE_GARBLED_START === 'true';
    const enableGarbledEnd = process.env.ENABLE_GARBLED_END === 'true';

    if (!enableGarbledStart && !enableGarbledEnd) {
        return content;
    }

    // Generate random garbled text of specific length
    function generateGarbledText(length) {
        return crypto.randomBytes(length).toString('hex');
    }

    let garbledContent = content;

    // Configuration parameters
    const startMinLength = parseInt(process.env.GARBLED_START_MIN_LENGTH) || 1000;
    const startMaxLength = parseInt(process.env.GARBLED_START_MAX_LENGTH) || 5000;

    const endGarbledLength = parseInt(process.env.GARBLED_END_LENGTH) || 500;

    if (enableGarbledStart) {
        const startGarbledLength = getRandomInt(startMinLength, startMaxLength);

        const byteLength = Math.ceil(startGarbledLength / 2);

        // Generate garbled text
        const startPlaceholder = generateGarbledText(byteLength);

        garbledContent = startPlaceholder + '\n\n\n' + garbledContent.trim();
    }

    if (enableGarbledEnd) {
        const byteLength = Math.ceil(endGarbledLength / 2);
        const endPlaceholder = generateGarbledText(byteLength);
        garbledContent = garbledContent.trim() + '\n\n\n' + endPlaceholder;
    }

    return garbledContent;
}