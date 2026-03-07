export const removeEmojiFromText = (text: string) => {
	return text.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
};
