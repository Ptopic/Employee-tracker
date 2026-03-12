import Text from "@/components/Text";

export function FormFieldError({ error }: { error?: string }) {
	if (!error) return null;
	return <Text style={{ marginTop: 6, color: "#DC2626", fontSize: 12 }}>{error}</Text>;
}
