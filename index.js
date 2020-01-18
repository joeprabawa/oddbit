const API_KEY = "1b869b3ccf57d089047ded4b1de007b8";
const BASE_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&page=1`;
const GENRE_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;
const POSTER_URL = "https://image.tmdb.org/t/p/w500";

let order = false;
let dateStore = [];

const selector = document.querySelector("#results");
const sortButton = document.querySelectorAll(".sort");
const icon = document.querySelectorAll(".icon");
const dates = document.querySelectorAll(".datepicker");
const caption = document.querySelector("#caption");

fetch(BASE_URL)
  .then(data => data.json())
  .then(({ results }) => {
    renderToPage(results);

    // Render results berdasarkan tombol sorting
    sortButton.forEach(button => {
      button.addEventListener("click", e => {
        const target = button.dataset.id;
        order = !order;
        order
          ? (results.sort((a, b) => (a[target] < b[target] ? -1 : 1)),
            icon.forEach(v => {
              let str = "";
              str += "arrow_downward";
              return (v.innerHTML = str);
            }))
          : (results.reverse(),
            icon.forEach(v => {
              let str = "";
              str += "arrow_upward";
              return (v.innerHTML = str);
            }));
        renderToPage(results);
      });
    });

    // Render results berdasarkan date range
    dates.forEach(date => {
      date.addEventListener("change", e => {
        dateStore.push(e.target.value);
        if (dateStore.length > 2) return (dateStore = []);
        const start = dateStore[0];
        const end = dateStore[1];
        console.log(start, end);
        const eachDay = dateFns.eachDay(start, end);
        const newFormat = eachDay.map(v => {
          return dateFns.format(v, [(format = "YYYY-MM-DD")]);
        });
        renderToPage(results.filter(v => newFormat.includes(v.release_date)));
      });
    });
  });

function renderToPage(results) {
  const reducer = results.map(async val => {
    const genreResult = await getGenre(val.genre_ids);
    caption.innerHTML = `${results.length} ${
      results.length > 1 ? "Results" : "Result"
    } found`;
    return `
   <div class="col s12 m4">
    <div class="card ">
    <div class="card-image waves-effect waves-block waves-light">
      <img style="height:375px;object-fit:cover" class="activator" src="${POSTER_URL}${
      val.poster_path
    }">
    </div>
    <div class="card-content">
  <span class="card-title activator grey-text text-darken-4">${truncate(
    val.original_title,
    15
  )}<i class="material-icons right">more_vert</i></span>
    </div>
    <div class="card-reveal">
  <span class="card-title grey-text text-darken-4">${
    val.original_title
  }<i class="material-icons right">close</i></span>
      <h5>Overview</h5>
      <p>${val.overview}</p>
      <hr>
      <h5>Genres</h5>
      ${genreResult.reduce((acc, v) => {
        return (acc += `<div class="chip">
        ${v}
        </div>`);
      }, "")}
      <hr>
       <h5>Popularity | Vote Count</h5>
       ${val.popularity} ~ ${val.vote_count}
    </div>
    </div>
    </div>
     `;
  });
  Promise.all(reducer).then(values => {
    selector.innerHTML = values.join("");
  });
}

function getGenre(arr) {
  return fetch(GENRE_URL)
    .then(results => results.json())
    .then(data => {
      const { genres } = data;
      const names = arr.map(v => {
        const { name } = genres.find(val => val.id === v);
        return name;
      });
      return names;
    });
}

function truncate(str, length) {
  return str.length > length ? `${str.substring(0, length)} ..` : str;
}
