var storage =
  JSON.parse(localStorage.getItem("storage")) ??
  localStorage.setItem("storage", JSON.stringify([]));
var currentCity = localStorage.getItem("currentCity") ?? "";

function getStorage() {
  var storedCities = JSON.parse(localStorage.getItem("storage"));
  if (storedCities !== null) {
    storage = storedCities;
  }
  if (currentCity !== null) {
    displayWeatherInfo(currentCity);
  }
  renderButtons();
}

function renderButtons() {
  $("#history").empty();
  if (storage.length === 0) {
    return;
  } else {
    for (var i = 0; i < storage?.length; i++) {
      if (storage.indexOf(storage[i]) !== i) {
        continue;
      }
      var storageBtn = $(
        `<button type="button" class="btn btn-success" data-city="${storage[i]}"> ${storage[i]}</button>`
      );
      $("#history").append(storageBtn);
    }
  }
}

function displayWeatherInfo(query_param) {
  $("#today").empty();
  var appID = "efcd1288b0985a2cd6003a2f2c69dd30";
  var query_param = query_param.toLowerCase();
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    query_param +
    "&APPID=" +
    appID +
    "&units=metric";
  if (query_param === "") {
    return;
  } else if (storage.includes(query_param)) {
    storage.splice(storage.indexOf(query_param), 1);
    storage.push(query_param);
    localStorage.setItem("storage", JSON.stringify(storage));
  } else {
    storage?.push(query_param);
    localStorage.setItem("storage", JSON.stringify(storage));
  }
  fetch(queryURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.cod === "404") {
        alert("City Name Not Found");
        storage.pop();
        localStorage.setItem("storage", JSON.stringify(storage));
        renderButtons();
        return;
      }
      currentCity = data.name;
      localStorage.setItem("currentCity", currentCity);
      var headerEl = $("<div>");
      headerEl.addClass("d-flex align-items-center");
      var HeadingEl = $(
        `<h3>${data.name}</h3>
        <div class="badge bg-success ms-2">(${dayjs().format(
          "DD/MM/YYYY"
        )})</div>
        `
      );
      HeadingEl.addClass("fw-bold");
      var iconEl = $('<img src="" alt="weather icon">');
      iconEl.attr(
        "src",
        "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png"
      );
      headerEl.append(iconEl, HeadingEl);
      var tempEl = $(`<p>Temperature: ${data.main.temp} °C</p>`);
      var windEl = $(`<p>Wind: ${data.wind.speed} KPH</p>`);
      var humidityEl = $(`<p>Humidity: ${data.main.humidity} %</p>`);
      $("#today").append(headerEl, tempEl, windEl, humidityEl);

      var lat = data.coord.lat;
      var lon = data.coord.lon;
      var forecastQueryURL =
        "https://api.openweathermap.org/data/2.5/forecast?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=" +
        appID +
        "&units=metric";
      fetch(forecastQueryURL)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          $("#forecast").empty();
          for (var i = 0; i < data.list.length; i++) {
            var dates = dayjs(data.list[i].dt_txt).format("DD/MM/YYYY");
            var currentDate = dayjs().format("DD/MM/YYYY");
            if (
              dates !== currentDate &&
              data.list[i].dt_txt.includes("00:00:00")
            ) {
              var colEl = $("<div>");
              colEl.addClass("col");
              var cardEl = $("<div>");
              cardEl.addClass("card text-bg-success h-100");
              var cardBodyEl = $("<div>");
              cardBodyEl.addClass("card-body");
              colEl.append(cardEl);
              cardEl.append(cardBodyEl);
              var currentDate = dayjs(data.list[i].dt_txt).format("DD/MM/YYYY");
              var HeadingEl = $(`<h4>${currentDate}</h4>`);
              var iconEl = $('<img src="" alt="weather icon">');
              iconEl.attr(
                "src",
                "https://openweathermap.org/img/w/" +
                  data.list[i].weather[0].icon +
                  ".png"
              );
              var tempEl = $(
                `<p>Temperature: ${data.list[i].main.temp} °C</p>`
              );
              var windEl = $(`<p>Wind: ${data.list[i].wind.speed} KPH</p>`);
              var humidityEl = $(
                `<p>Humidity: ${data.list[i].main.humidity} %</p>`
              );
              cardBodyEl.append(HeadingEl, iconEl, tempEl, windEl, humidityEl);
              $("#forecast").append(colEl);
            }
          }
        });
    });
}

getStorage();

$("#history").on("click", "button", function () {
  $("#today").empty();
  var city = $(this).attr("data-city");
  displayWeatherInfo(city);
  renderButtons();
});

$("#search-button").on("click", function (event) {
  event.preventDefault();
  displayWeatherInfo($("#search-input").val().trim());
  $("#search-input").val("");
  renderButtons();
});
