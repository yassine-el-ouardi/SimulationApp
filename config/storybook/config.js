import { setOptions } from "@storybook/addon-options"
import { configure } from "@storybook/react"

setOptions({
	name: 'Processing Twin',
	hierarchySeparator: /\/|\./,
	hierarchyRootSeparator: /\|/,
})

function requireAll(requireContext) {
	return requireContext.keys().map(requireContext);
}

function loadStories() {
	requireAll(require.context("../../stories", true, /\.tsx?$/));
}

configure(loadStories, module);