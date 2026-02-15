sedi () {
    case $(uname -s) in
        *[Dd]arwin* | *BSD* ) sed -i '' "$@";;
        *) sed -i "$@";;
    esac
}
