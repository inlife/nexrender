var color = [0.11, 0.43, 0.84, 1];

var playlist = [
    {"artist":"danny loko","title":"coastal (original mix)","s":0,"e":368},
    {"artist":"jaydee","title":"plastic dreams (dino lenny & amnesia remix)","s":368,"e":691},
    {"artist":"robert nickson pres. rnx","title":"suffer (original mix)","s":691,"e":1168}
];

function getCurrent() {
    for (var i = 0; i < playlist.length; i++) {
        if (time >= playlist[i].s && time <= playlist[i].e) {
            return i;
        }
    }
}

function getTrack() {
    return playlist[getCurrent()] || { artist: "none", track: "none", s: 0, e: 0 };
}

function getTrackEnd() {
    return getTime(getTrack().e);
}

function getTime(fromt) {
    var times = timeToTimecode(fromt, 60, true).split(':');
    var newtimes;
    if (times[0] == '00') {
        newtimes = [times[1], times[2]];
    } else {
        newtimes = [times[0], times[1], times[2]];
    }
    return newtimes.join(':');
}

function getProgress() {
    var track = getTrack();
    var pers = (time - track.s) / (track.e - track.s);

    return [(pers * 925) - 925, 0];
}

function getTrackNumber() {
    var number = (getCurrent() + 1) + '';
    if (number.length < 2) {
        number = '0' + number;
    }
    return '#' + number;
}
