const API_KEY = "1b869b3ccf57d089047ded4b1de007b8";
const BASE_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&page=1`;
const GENRE_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;
const POSTER_URL = "https://image.tmdb.org/t/p/w500";

const selector = document.querySelector("#results");
const sortButton = document.querySelectorAll(".sort");
const icon = document.querySelectorAll(".icon");
const form = document.querySelector("form");
const thumbControl = document.querySelector(".thumb");
const caption = document.querySelector("#caption");
const toggleIcon = document.querySelector(".toggle-icon");

const { elements } = form;
let order = false;
let thumb = false;

fetch(BASE_URL)
  .then(data => data.json())
  .then(({ results }) => {
    renderToPage(results);
    thumbControl.addEventListener("click", e => {
      thumb = !thumb;
      renderToPage(results);
    });

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
    form.addEventListener("submit", e => {
      e.preventDefault();
      const start = [elements["start"].value];
      const end = [elements["end"].value];

      const eachDay = dateFns.eachDay(start[0], end[0]);
      const newFormat = eachDay.map(v => {
        return dateFns.format(v, [(format = "YYYY-MM-DD")]);
      });
      renderToPage(results.filter(v => newFormat.includes(v.release_date)));
      form.reset();
    });
  });

// Render reults, dan masukan ke dalam DOM
function renderToPage(results) {
  thumb
    ? (toggleIcon.innerHTML = "view_agenda")
    : (toggleIcon.innerHTML = "dashboard");

  const reducer = results.map(async val => {
    const genreResult = await getGenre(val.genre_ids);
    caption.innerHTML = `${results.length} ${
      results.length > 1 ? "Results" : "Result"
    } found`;
    return !thumb
      ? `
      <ul class="collection">
          <li class="collection-item avatar">
            <div class="img-avatar">
              <img  class="circle" style="object-fit:cover;width:60px;height:60px;margin-top:10px" src="${POSTER_URL}${
          val.poster_path
        }">
        </div>
        <div class="content">
        <span class="title">${truncate(val.original_title, 40)}</span>
          <p>${dateFns.format(new Date(val.release_date), [
            (format = "d MMM YYYY")
          ])} 
            <br>
              ${genreResult.reduce((acc, v) => {
                return (acc += `<div class="chip list">
          ${v}
          </div>`);
              }, "")}
          </p>
        </div>
        </li>
      </ul>`
      : `<div class="col s12 m4">
    <div class="card">
    <div class="card-image waves-effect waves-block waves-light">
      <img style="height:375px;object-fit:cover" class="activator" src="${POSTER_URL}${
          val.poster_path
        }">
    </div>
    <div class="card-content">
    <p>${dateFns.format(new Date(val.release_date), [
      (format = "d MMM YYYY")
    ])}</p>
  <span class="card-title activator grey-text text-darken-4">${truncate(
    val.original_title,
    10
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
       <h5>Popularity</h5>
       ${val.popularity}
       <hr>
       <h5>Vote Count</h5>
       ${val.vote_count}
    </div>
    </div>
    </div>
     `;
  });

  function getTracks() {
    //Append playlist name to modal header
    const modalTitle = document.querySelector("h4.title");
    const buttons = document.querySelectorAll("a.modal-trigger");
    buttons.forEach(button => {
      button.addEventListener("click", e => {
        console.log("clicked");
        // Append Playlist name to modal title
        modalTitle.innerHTML = button.dataset.title;
        // Get the playlist url
        const url = button.dataset.link;
        const options = {
          headers: {
            Authorization: `Bearer ${_token}`
          }
        };
        // Fetch playlist url
        fetch(url, options)
          .then(response => response.json())
          .then(data => appendToModal(data));
      });
    });
  }

  Promise.all(reducer).then(values => {
    getTracks();
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

document.addEventListener("DOMContentLoaded", () => {
  var elems = document.querySelectorAll(".datepicker");
  var instances = M.Datepicker.init(elems, {
    format: "yyyy-mm-dd"
  });
});
