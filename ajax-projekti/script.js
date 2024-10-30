document.addEventListener("DOMContentLoaded", () => {
    const theaterSelect = document.getElementById("theaterSelect");
    const movieList = document.getElementById("movieList");
    const searchInput = document.getElementById("searchInput");

    // Lataa teatterit ja täytä teatterivalikko
    fetchTheaters();

    // Tapahtumakuuntelija teatterin valinnalle
    theaterSelect.addEventListener("change", () => {
        const theaterID = theaterSelect.value;
        fetchMovies(theaterID);
    });

    // Tapahtumakuuntelija mukautetulle hakusyötteelle
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const movies = document.querySelectorAll(".movie");
        movies.forEach(movie => {
            const title = movie.querySelector("h3").innerText.toLowerCase();
            movie.style.display = title.includes(searchTerm) ? "" : "none";
        });
    });

    // Hae ja näytä teatterilista
    async function fetchTheaters() {
        const url = "https://www.finnkino.fi/xml/TheatreAreas/";
        const response = await fetch(url);
        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");
        const theaters = xmlDoc.getElementsByTagName("TheatreArea");

        for (let theater of theaters) {
            const id = theater.querySelector("ID").textContent;
            const name = theater.querySelector("Name").textContent;
            const option = document.createElement("option");
            option.value = id;
            option.textContent = name;
            theaterSelect.appendChild(option);
        }
    }

    // Hae ja näytä elokuvat valitulle teatterille
    async function fetchMovies(theaterID) {
        const url = `https://www.finnkino.fi/xml/Schedule/?area=${theaterID}`;
        const response = await fetch(url);
        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");
        const shows = xmlDoc.getElementsByTagName("Show");

        movieList.innerHTML = "";  // Tyhjennä edelliset elokuvat

        if (shows.length === 0) {
            movieList.innerHTML = "<p>Ei elokuvia saatavilla.</p>";
            return;
        }

        for (let show of shows) {
            const title = show.querySelector("Title").textContent;
            const genres = show.querySelector("Genres").textContent;
            const imageUrl = show.querySelector("EventMediumImagePortrait").textContent;
            const showTime = new Date(show.querySelector("dttmShowStart").textContent).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Elokuvakortin elementti
            const movieDiv = document.createElement("div");
            movieDiv.classList.add("movie");
            movieDiv.innerHTML = `
                <img src="${imageUrl}" alt="${title}">
                <h3>${title}</h3>
                <p>Genres: ${genres}</p>
                <p class="showtime">Näytös: ${showTime}</p>
            `;

            movieList.appendChild(movieDiv);
        }
    }
});