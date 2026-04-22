export const nameToCamelCase = (text: string) => {
    if (!text) return "";

    const lowerWords = new Set(["de", "da", "do", "das", "dos", "e"]);

    return text
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .map((word, index) => {
            if (index !== 0 && lowerWords.has(word)) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
};

export const nameToCamelCaseUe = (text: string) => {
    if (!text) return "";

    const lowerWords = new Set(["de", "da", "do", "das", "dos", "e"]);

    let passedPrefix = false;

    return text
        .trim()
        .split(/\s+/)
        .map((originalWord, index) => {
            // detecta separador e "encerra" zona de siglas
            if (originalWord === "-" || originalWord.includes("-")) {
                passedPrefix = true;
                return originalWord;
            }

            const word = originalWord.toLowerCase();

            const isAcronym =
                !passedPrefix &&
                originalWord === originalWord.toUpperCase() 
                // && originalWord.length <= 6; // caso precise colocar limite

            if (isAcronym) {
                return originalWord;
            }

            if (index !== 0 && lowerWords.has(word)) {
                return word;
            }

            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
};

export const formatarRF = (rf: string) => {
    if (!rf) return "";

    const digits = rf.replace(/\D/g, "");

    if (digits.length <= 3) return digits;
    if (digits.length <= 6)
        return `${digits.slice(0, 3)}.${digits.slice(3)}`;

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
};