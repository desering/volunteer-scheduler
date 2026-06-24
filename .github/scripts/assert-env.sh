#!/usr/bin/env sh

ENV_FILE=.env

source .github/scripts/functions.sh

if [ ! -f $ENV_FILE ]; then
	echo -n "generating \"$ENV_FILE\"..."
	if generate_env; then
		echo "done"
	else
		echo "error"
		exit 1
	fi

	if [ "$REMOTE_CONTAINERS" = "true" ]; then	
		echo "detected Remote Container environment"
	else
		if ! command -v bun > /dev/null 2>&1 ; then
			echo "local bun not found, setting up for docker"
		else
			echo "local bun found, setting up for local bun"
			sedi '/^SMTP_HOST=/s|maildev|localhost|' .env
			sedi '/^DATABASE_URI=/s|@postgres:|@localhost:|' .env
		fi
	fi
else
	echo "\"$ENV_FILE\" file already exists"
fi

exit 0