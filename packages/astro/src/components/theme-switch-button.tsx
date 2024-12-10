import MoonIcon from "lucide-solid/icons/moon";
import SunIcon from "lucide-solid/icons/sun";
import { createSignal, onMount } from "solid-js";
import { IconButton } from "./ui/icon-button";

export const ThemeSwitchButton = () => {
	const [isDark, setIsDark] = createSignal(false);

	onMount(() => setIsDark(document.documentElement.classList.contains("dark")));

	const toggleTheme = () => {
		document.documentElement.classList.toggle("dark");
		setIsDark(document.documentElement.classList.contains("dark"));
		localStorage.setItem("theme", isDark() ? "dark" : "light");
	};

	return (
		<IconButton variant="outline" size="lg" onClick={toggleTheme}>
			{isDark() ? <MoonIcon /> : <SunIcon />}
		</IconButton>
	);
};
