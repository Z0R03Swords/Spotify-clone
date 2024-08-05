let currentSong = new Audio();
let songs;
let currFolder;

function secondToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function songsGet(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }

    // Show all the songs in the playlist

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert set" src="assets/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ").replace(/%D0|%9C|%D0|%B8|%D0|%BB|%D0|%BB|%D0|%B8|%D0|%BD|%D0|%B4|%D0|%93|%D0|%B0|%D0|%B1|%D0|%B0/g, " ").replace(/%A5|%B5|%88|%A0|%B5|%88|%8F/g, " ").replace(/%BC|%D1|%D1|%BC|%BC|%D1/g, " ").replace(/%94|%80|%B2|%8C/g, " ").replace(/%9A|%9A|%83|%9A|%83|%82|%85/g, " ").replace(/%90|%A1/g, " ").replace("%B6", " ").replace("%91", " ")}</div>
                            </div>
                            <div class="playnow">
                            
                            <img id="tap" class="set1" src="assets/play.svg" alt="">
                            </div>
        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", event => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;

}
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "assets/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"

}

async function main() {

    // Get the list of all the songs
    await songsGet("songs/ncs");
    playMusic(songs[0], true);

    //Display all the albums on the page
    

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {

        if (currentSong.paused) {
            currentSong.play()
            play.src = "assets/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "assets/play.svg"
        }

    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondToMinutesSeconds(currentSong.currentTime)}: ${secondToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ([index - 1] >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next

    next.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ([index + 1] < songs.length) {
            playMusic(songs[index + 1])
        }

    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("assets/mute.svg", "assets/volume.svg")
        }
    })

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await songsGet(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("assets/volume.svg")) {
            e.target.src = e.target.src.replace("assets/volume.svg", "assets/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("assets/mute.svg", "assets/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })


}

main();