export const getEmoji = (text: string) => {
	if (!text) return "";
	const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
	const match = text.match(emojiRegex);
	return match ? match[0] : "";
};

export const removeEmoji = (text: string) => {
	return text.split(" ").slice(1).join(" ");
};
