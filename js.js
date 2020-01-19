const getData = data => {
  const items = data.items;
  items.reduce((accumulator, item) => {
    // console.log(item);
    const holder =
      accumulator +
      `
  <div class="col s12 m6 l4 xl4">
  <div class="card">
    <div class="card-image">
      <img src="${item.images[0].url}">
    </div>
    <div class="card-content">
      <a class="black-text playlist-name">${truncate(`${item.name}`, 20)}</a>
    </div>
    <div class="card-action ">
      <a href="#modal1" class="right-align track btn black white-text modal-trigger" data-link="${
        item.tracks.href
      }" data-title="${item.name}">Tracks list</a>
      <a href="#" class="select yellow darken-1 btn white-text" data-link="${
        item.tracks.href
      }">Select</a>
    </div>
  </div>
  </div>
  `;
    return (output.innerHTML = holder);
  }, "");

  // Function get Track List
  function getTracks() {
    //Append playlist name to modal header
    const modalTitle = document.querySelector("h4.title");
    const buttons = document.querySelectorAll("a.track");
    buttons.forEach(button => {
      button.addEventListener("click", e => {
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
  getTracks();
  select();
};
