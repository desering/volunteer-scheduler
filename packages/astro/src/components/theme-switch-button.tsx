import { createSignal } from "solid-js";
import { IconButton } from "./ui/icon-button";
import { isServer } from "solid-js/web";
// @ts-ignore
import SunIcon from "~icons/lucide/sun";
// @ts-ignore
import MoonIcon from "~icons/lucide/moon";

export const ThemeSwitchButton = () => {
	const [isDark, setIsDark] = createSignal(
		!isServer && document.documentElement.classList.contains("dark"),
	);

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
