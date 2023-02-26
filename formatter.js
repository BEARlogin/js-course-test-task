function formatTimer(value, formatter) {
    function zero(val) {
        return val.toString().length === 1 ? '0' + val : val;
    }

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value - hours * 3600) / 60);
    const seconds = value - hours * 3600 - minutes * 60;

    return formatter(zero(hours), zero(minutes), zero(seconds));
}

