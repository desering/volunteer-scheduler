sedi () {
    case $(uname -s) in
        *[Dd]arwin* | *BSD* ) sed -i '' "$@";;
        *) sed -i "$@";;
    esac
}

generate_env () {
    cp .env.example .env && sedi -e "s/PAYLOAD_SECRET_PLACEHOLDER/$(openssl rand -hex 32)/g" .env 
}