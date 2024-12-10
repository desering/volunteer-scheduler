import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { sharedConfig } from "../shared/shared-payload-config";
import { oidcPlugin, oidcPluginOptions } from "payload-plugin-oidc";
import * as process from "process";
import {Users} from "@desering/shifter-shared/collections/users";

const oidcPluginOpts : oidcPluginOptions = {
	authorizationURL: `${process.env.OIDC_URI}/oidc/auth`,
	clientID: process.env.OIDC_CLIENT_ID,
	clientSecret: process.env.OIDC_CLIENT_SECRET,
	createUserIfNotFound: true,
	initPath: `/oidc/signin`,
	mongoUrl: process.env.DATABASE_URI, // Todo: this plugin does not need database access
	tokenURL: `${process.env.OIDC_URI}/oidc/token`,
	callbackPath: `/oidc/callback`,
	callbackURL: `${process.env.SELF_URL}/oidc/callback`,
	scope: 'openid offline_access profile email custom_data',
	userCollection: {
		slug: Users.slug,
		searchKey: 'email',
	},
	// components: {
	// 	Button: SignInButton, //can be your own custom component
	// 	position: "afterLogin" //beforeLogin | afterLogin
	// },
	async userinfo(accessToken: string): Promise<{ sub: string; email?: string; password?: string; name?: string }> {
		// const { data: user } = await axios.get(`${process.env.OIDC_URI}/oidc/me`, {
		// 	headers: {
		// 		Authorization: `Bearer ${accessToken}`,
		// 	},
		// });
		//
		// return {
		// 	sub: user.sub,
		// 	name: user.name,
		// 	email: user.email,
		// 	// You can use OIDC user custom data to get the role for this app
		// 	role: user.custom_data?.my_app_role,
		//
		// 	// or you can do something like this
		// 	// role: user.custom_data?.role ? 'admin' : 'editor',
		// };
	}
};

export default buildConfig({
	...sharedConfig,
	editor: lexicalEditor(),
	plugins: [
		oidcPlugin(oidcPluginOpts), // todo: why does IDE complain about argument type mismatch when the plugin is added to the Array?
	],
	sharp,
});
