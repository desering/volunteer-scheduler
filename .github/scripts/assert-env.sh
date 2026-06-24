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
else
	echo "\"$ENV_FILE\" file already exists"
fi

exit 0