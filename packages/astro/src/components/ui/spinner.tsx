import { mergeProps, splitProps } from "solid-js";
import { panda } from "styled-system/jsx";
import {
	Spinner as PandaSpinner,
	type SpinnerProps as PandaSpinnerProps,
} from "./styled/spinner";

export interface SpinnerProps extends PandaSpinnerProps {
	/**
	 * For accessibility, it is important to add a fallback loading text.
	 * This text will be visible to screen readers.
	 * @default "Loading..."
	 */
	label?: string;
}

export const Spinner = (props: SpinnerProps) => {
	const [_localProps, rootProps] = splitProps(props, ["label"]);
	const localProps = mergeProps({ label: "Loading..." }, _localProps);

	return (
		<PandaSpinner
			borderBottomColor="transparent"
			borderLeftColor="transparent"
			{...rootProps}
		>
			<panda.span srOnly>{localProps.label}</panda.span>
		</PandaSpinner>
	);
};
