document.addEventListener('DOMContentLoaded', function(){
    let db
    const rawScores = JSON.parse(document.getElementById('data-pass').innerHTML)
    fetch("static/asset/json/music_db.json")
    .then(response => response.json())
    .then(json => build(rawScores, json.mdb.music));
})




async function buildMeta() {
    return {
        "game": "sdvx",
        "playtype": "Single",
        "service": "Asphyxia"
    }
}

async function buildScores(rawScores, db) {
    const parsedScores = []
    const lamps = ['NOT PLAYED', 'FAILED', 'CLEAR', 'EXCESSIVE CLEAR', 'ULTIMATE CHAIN', 'PERFECT ULTIMATE CHAIN']
    for (scoreObj of rawScores) {
        for (song of db) {
            if (scoreObj.mid == song['@id'] && song.info.version["#text"] != "6") {
                const score = scoreObj.score
                const identifier = scoreObj.mid.toString()
                const matchType = "inGameID";
                const lamp = lamps[scoreObj.clear]
                const difficulty = await formatDiffName(Object.keys(song.difficulty)[scoreObj.type],song)
                const timeAchieved = (new Date(scoreObj.updatedAt)).getTime()
                parsedScores.push({ score, lamp, matchType, identifier,  difficulty, timeAchieved })
            }
        }
    }
    return parsedScores
}

async function formatDiffName(diff, song) {
    const infDiffs = ["MXM","INF","GRV","HVN","VVD"]
    switch (diff) {
        case "novice":
        case "advanced":
        case "exhaust":
            return diff.slice(0, 3).toUpperCase()
        case "maximum":
            return "MXM"
            break;
        case "infinite":
            return infDiffs[song.info.inf_ver["#text"] - 1]
            break;
        }
}

async function build(rawScores, db) {
    const meta = await buildMeta()
    const scores = await buildScores(rawScores, db)
    document.getElementById('export').setAttribute('href', `data:text/plain;charset=utf-8, ${encodeURIComponent(JSON.stringify({meta, scores}))}`)
}