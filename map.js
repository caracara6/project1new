let map;
let singapore;
let lightMode;
let darkMode;
let randNum;
let mapCenter;
let userLocation;
let searchLayer = L.layerGroup();
let cyclingLayer = L.layerGroup();
let sportClusterLayer = L.markerClusterGroup();
let baseMaps;
let overlays;

async function main() {
  function init() {
    map = initMap();

    window.addEventListener("DOMContentLoaded", function () {
      document
            .getElementById("singaporeMap")
            .classList.remove("light-mode");
          document.getElementById("singaporeMap").classList.add("dark-mode");

          let colorChange = document.querySelectorAll(".color-change");
          for (let c of colorChange) {
            c.classList.remove("black");
            c.classList.add("white");
          }
      document.querySelector("#buddyBtn").classList.remove("filter-black");
          document.querySelector("#buddyBtn").classList.add("filter-white");


      map.on("baselayerchange", function (e) {
        if (e.layer.options.id == "mapbox/streets-v11") {
          document.getElementById("singaporeMap").classList.remove("dark-mode");
          document.getElementById("singaporeMap").classList.add("light-mode");
          let colorChange = document.querySelectorAll(".color-change");
          for (let c of colorChange) {
            c.classList.remove("white");
            c.classList.add("black");
          }
          document.querySelector("#buddyBtn").classList.remove("filter-white");
          document.querySelector("#buddyBtn").classList.add("filter-black");
        } else if (e.layer.options.id == "mapbox/dark-v10") {
          document
            .getElementById("singaporeMap")
            .classList.remove("light-mode");
          document.getElementById("singaporeMap").classList.add("dark-mode");

          let colorChange = document.querySelectorAll(".color-change");
          for (let c of colorChange) {
            c.classList.remove("black");
            c.classList.add("white");
          }
          document.querySelector("#buddyBtn").classList.remove("filter-black");
          document.querySelector("#buddyBtn").classList.add("filter-white");
        }
      });

      clearErrorMessage('#searchInput', 'keydown', '#searchValidation');

      let landingSearchBtn = document.querySelector("#landingSearchBtn");
      landingSearchBtn.addEventListener("click", async function () {
        //clear previous results
        clearResults();

        // search validation
        let emptySearch = false;
        let searchInput = document.querySelector("#searchInput").value;
        if (!searchInput) {
          emptySearch = true;
        }
        if (emptySearch) {
          let validation = document.querySelector("#searchValidation");
          validation.innerHTML = "Please enter a valid search term";
        } else {
          resetMap();
          showMapPage();
          mapCenter = map.getBounds().getCenter();

          // search results auto-dropdown for better UX
          document.querySelector("#dropdownButton").classList.add("show");
          document.querySelector("#infoTabSearchResults").classList.add("show");

          let response = await searchPlaces(
            mapCenter.lat,
            mapCenter.lng,
            searchInput,
            10
          );

          if (response.results.length == 0){
            let searchResultElement = document.querySelector("#infoTabSearchResults");
            let noResultElement = document.createElement('li');
            noResultElement.className = "resultList";
            noResultElement.innerHTML = "Try searching for something else!"
            searchResultElement.appendChild(noResultElement);
          }

          
          console.log(response.results);

          plotSearchCoordinates(response.results, "icons/search.svg", searchLayer);
          // searchLayer.addTo(map);
        }
      });

      clearErrorMessage('#mapSearchInput', 'keydown', '#mapSearchValidation');

      let mapSearchBtn = document.querySelector("#mapSearchBtn");
      mapSearchBtn.addEventListener("click", async function () {
        //clear previous results
        clearResults();

        // search validation
        let emptySearch = false;

        let searchInput = document.querySelector("#mapSearchInput").value;

        if (!searchInput) {
          emptySearch = true;
        }

        if (emptySearch) {
          let validation = document.querySelector("#mapSearchValidation");
          validation.innerHTML = "Please enter a valid search term";
        } else {
          resetMap();

          mapCenter = map.getBounds().getCenter();

          let response = await searchPlaces(
            mapCenter.lat,
            mapCenter.lng,
            searchInput,
            8
          );

          // search results auto-dropdown for better UX
          document.querySelector("#dropdownButton").classList.add("show");
          document.querySelector("#infoTabSearchResults").classList.add("show");

          // console.log(response.results);

          plotSearchCoordinates(response.results, "icons/search.svg", searchLayer);
          // searchLayer.addTo(map);
        }
      });

      let locationSearchBtn = document.querySelector("#locationSearchBtn");
      locationSearchBtn.addEventListener("click", async function () {
        //clear previous results
        clearResults();

        // search validation
        let emptySearch = false;

        let searchInput = document.querySelector("#mapSearchInput").value;

        if (!searchInput) {
          emptySearch = true;
        }

        if (emptySearch) {
          let validation = document.querySelector("#mapSearchValidation");
          validation.innerHTML = "Please enter a valid search term";
        } else {
          getLocation();
          resetMap();
          console.log(userLocation);
          // console.log(searchInput);

          let response = await searchPlaces(
            userLocation[0],
            userLocation[1],
            searchInput,
            8
          );

          // search results auto-dropdown for better UX
          document.querySelector("#dropdownButton").classList.add("show");
          document.querySelector("#infoTabSearchResults").classList.add("show");

          plotSearchCoordinates(response.results, "icons/search.svg", searchLayer);
          // searchLayer.addTo(map);
        }
      });

      let backBtn = document.querySelector("#backBtn");
      backBtn.addEventListener("click", function () {
        let validation = document.querySelector("#searchValidation");
        validation.innerHTML = "<br>";

        showLandingPage();
      });

      let gymBtn = document.querySelector("#gymBtn");
      gymBtn.addEventListener("click", async function () {
        resetMap();
        mapCenter = map.getBounds().getCenter();
        let response = await searchSport(mapCenter.lat, mapCenter.lng, "gym");
        plotSearchCoordinates(response.results, "icons/dumbbell.svg", sportClusterLayer);
        // sportClusterLayer.addTo(map);
      });

      let basketballBtn = document.querySelector("#basketballBtn");
      basketballBtn.addEventListener("click", async function () {
        clearResults();
        resetMap();
        mapCenter = map.getBounds().getCenter();
        let response = await searchSport(
          mapCenter.lat,
          mapCenter.lng,
          "basketball"
        );
        plotSearchCoordinates(response.results, "icons/basketball.svg", sportClusterLayer);
      });

      let golfBtn = document.querySelector("#golfBtn");
      golfBtn.addEventListener("click", async function () {
                clearResults();

        resetMap();
        mapCenter = map.getBounds().getCenter();
        let response = await searchSport(mapCenter.lat, mapCenter.lng, "golf");
        plotSearchCoordinates(response.results, "icons/golf.svg", sportClusterLayer);
      });

      let bowlingBtn = document.querySelector("#bowlingBtn");
      bowlingBtn.addEventListener("click", async function () {
                clearResults();
        resetMap();
        mapCenter = map.getBounds().getCenter();
        let response = await searchSport(
          mapCenter.lat,
          mapCenter.lng,
          "bowling"
        );
        plotSearchCoordinates(response.results, "icons/bowling.svg", sportClusterLayer);
      });

      let swimmingBtn = document.querySelector("#swimmingBtn");
      swimmingBtn.addEventListener("click", async function () {
                clearResults();
        resetMap();
        mapCenter = map.getBounds().getCenter();
        let response = await searchSport(
          mapCenter.lat,
          mapCenter.lng,
          "swimming"
        );
        plotSearchCoordinates(response.results, "icons/swimming.svg", sportClusterLayer);
      });

      let volleyballBtn = document.querySelector("#volleyballBtn");
      volleyballBtn.addEventListener("click", async function () {
        clearResults();
        resetMap();
        mapCenter = map.getBounds().getCenter();
        let response = await searchSport(
          mapCenter.lat,
          mapCenter.lng,
          "volleyball"
        );
        plotSearchCoordinates(response.results, "icons/volleyball.svg", sportClusterLayer);
      });

      let cyclingBtn = document.querySelector("#cyclingBtn");
      cyclingBtn.addEventListener("click", async function () {
        clearResults();
        resetMap();
        showCyclingPath();
        cyclingLayer.addTo(map);
      });

      let randomSportSearch;

      let surpriseMeBtn = document.querySelector("#surpriseMeBtn");
      surpriseMeBtn.addEventListener("click", function () {
        randomSportSearch = generateRandomSport();
      });

      let letsGoBtn = document.querySelector("#letsGoBtn");
      letsGoBtn.addEventListener("click", async function () {
                clearResults();
        resetMap();
        showMapPage();

        // let surpriseModal = bootstrap.Modal.getInstance(document.getElementById('surpriseModal'))
        // surpriseModal.hide();

        //         // let surpriseModal = document.getElementById('surpriseModal');
        //         // surpriseModal.hide();
        //         // close modal here

        mapCenter = map.getBounds().getCenter();

        let response = await searchPlaces(
          mapCenter.lat,
          mapCenter.lng,
          randomSportSearch,
          8
        );

        // search results auto-dropdown for better UX
        document.querySelector("#dropdownButton").classList.add("show");
        document.querySelector("#infoTabSearchResults").classList.add("show");

        plotSearchCoordinates(response.results, "icons/search.svg", searchLayer);
      });

      let buddyBtn = document.querySelector("#buddyBtn");
      buddyBtn.addEventListener("click", function () {
        document.querySelector('#submitResponse').innerHTML = `<span><br></span>`
        resetRadioBtn('radio');
        resetDate('date');
        resetCheckboxes('checkbox');
        resetTextInput('text');
        showBuddyForm();
      });

      let othersCheckbox = document.getElementById("othersCheckbox");
      othersCheckbox.addEventListener("click", function () {
        if (othersCheckbox.checked == true) {
          document.getElementById("whatOthers").style.display = "block";
        } else {
          document.getElementById("whatOthers").style.display = "none";
        }
      });

      let agreetNc = document.querySelector("#agreetNc");
      agreetNc.addEventListener("click", function () {
        document.querySelector("#tNcCheckbox").disabled = false;
      });

      let submitBtn = document.querySelector("#submitBtn");
      submitBtn.addEventListener("click", function () {

        //flags
        let flag = false;

        // name error
        let name = document.getElementById("name").value;

        if (!name || name.length < 3) {
          if (!name) {
            flag = true;
            document.getElementById("nameValidation").innerHTML =
              "<span>Please enter your name</span>";
          }
          if (name.length < 3) {
            flag = true;
            document.getElementById("nameValidation").innerHTML =
              "<span>Please enter a valid name</span>";
          }
        }

        // age error
        let dob = new Date(document.getElementById("dob").value);

        let today = new Date();
        let currentYear = today.getFullYear();
        let currentMonth = today.getMonth();
        let currentDay = today.getDate();

        let birthYear = dob.getFullYear();
        let birthMonth = dob.getMonth();
        let birthDay = dob.getDate();

        let ageYear = currentYear - birthYear;
        let ageMonth = currentMonth - birthMonth;
        let ageDay = currentDay - birthDay;

        if (dob == "Invalid Date") {
          flag = true;
          document.getElementById("ageValidation").innerHTML =
            "<span>Please enter your age</span>";
        } 
        if (ageYear > 100) {
          flag = true;
          document.getElementById("ageValidation").innerHTML =
            "<span>You can't be older than 100</span>";
        } 
        // if (ageYear == 18 && ageMonth <= 0 && ageDay <= 0) {
        //   flag = true;
        //   document.getElementById("ageValidation").innerHTML =
        //     "<span>You have to be older than 18</span>";
        // }
        if (ageMonth < 0 || (ageMonth == 0 && ageDay < 0)) {
          ageYear = parseInt(ageYear) - 1;
        }
        // if (ageYear < 18){
        //   flag = true;
        //   document.getElementById("ageValidation").innerHTML =
        //     "<span>You have to be older than 18</span>";
        // }

        // gender error
        let gender = null;
        for (let eachGender of document.querySelectorAll(".gender")) {
          if (eachGender.checked == true) {
            gender = eachGender.value;
            break;
          }
        }
        if (gender == null) {
          flag = true;
          document.getElementById("genderValidation").innerHTML =
            "<span>Please select your gender</span>";
        }

        //email error
        function validateEmail(email) {
          let validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
          if (email.match(validEmail)) {
            flag = false;
            document.querySelector("#emailValidation").innerHTML = '<br>'
            return true;
          } else if(!email){
            flag = true;
            document.querySelector("#emailValidation").innerHTML =
              "<span>Please enter your email</span>";
          }
          else {
            flag = true;
            document.querySelector("#emailValidation").innerHTML =
              "<span>Please enter a valid email</span>";
            return false;
          }
        }

        let email = document.getElementById("email").value;
        validateEmail(email);

        //activities error
        let allActivities = document.getElementsByClassName("activity");
        let selectedActivities = [];
        for (let activity of allActivities) {
          if (activity.checked == true) {
            selectedActivities.push(activity.value);
          }
        }

        if (selectedActivities.length == 0) {
          flag = true;
          document.querySelector(
            "#activityValidation"
          ).innerHTML = `<span>Please indicate at least one activity</span>`;
        }

        if(document.querySelector('#othersCheckbox').checked==true){
          let whatOthers = document.querySelector("#whatOthersInput").value;
          if (!whatOthers) {
            flag = true;
          document.querySelector("#activityValidation").innerHTML =
            "<span>Please let us know what activity you prefer</span>";
          }
        }

        //terms and conditions error
        let tNcCheckbox = document.querySelector("#tNcCheckbox");
        if (tNcCheckbox.checked == false) {
          flag = true;
          document.querySelector("#tNcValidation").innerHTML =
            "<span>Please agree to the terms and conditions</span>";
        }
        //if no errors
        if (flag == false){       
          document.querySelector('#submitResponse').innerHTML = `<span>We have received your response, and will contact you if there is a match!</span>`
          setTimeout(closeBuddyForm, 4000);
        } 
      });

      //clear error message
      function clearErrorMessage(inputID, event, errorID){
        document.querySelector(inputID).addEventListener(event, function(){
          document.querySelector(errorID).innerHTML='<br>'
        })
      }
      clearErrorMessage('#name', 'keydown', '#nameValidation');
      clearErrorMessage('#dob', 'click', '#ageValidation');
      clearErrorMessage('#male-gender', 'click', '#genderValidation');
      clearErrorMessage('#female-gender', 'click', '#genderValidation');
      clearErrorMessage('#email', 'keydown', '#emailValidation');
      let allActivitiesCheckboxes = document.getElementsByClassName("activity");
      let activitiesArray = Array.from(allActivitiesCheckboxes);
      activitiesArray.pop();
      let activitiesIDs = activitiesArray.map(function(activity){
        return activity.id
      })
      for(ID of activitiesIDs){
        clearErrorMessage('#'+ ID, 'click', '#activityValidation');
      }
      document.getElementById('othersCheckbox').addEventListener('click', function(){
        if(document.getElementById('othersCheckbox').checked == true){
          clearErrorMessage('#whatOthers', 'keydown', '#activityValidation')
        }
      })

      document.querySelector("#tNcCheckbox").addEventListener('click', function(){
        if(document.querySelector("#tNcCheckbox").checked == true){
          document.querySelector('#tNcValidation').innerHTML='<br>'
        }
      })

    });
  }

  function initMap() {
    // Initialise map
    singapore = [1.3069, 103.8189];
    map = L.map("singaporeMap");
    map.setView(singapore, 12);

    // Add light layer
    lightMode = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          "pk.eyJ1IjoiY2FyYWNhcmE2IiwiYSI6ImNrenV6anhiMjdyamYyd25mYXB3N2V6aGUifQ._MiXk72eEw378aB0cJnNng",
      }
    );
    

    // Add dark layer
    darkMode = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/dark-v10",
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          "pk.eyJ1IjoiY2FyYWNhcmE2IiwiYSI6ImNrenV6anhiMjdyamYyd25mYXB3N2V6aGUifQ._MiXk72eEw378aB0cJnNng",
      }
    );
    darkMode.addTo(map);
    // darkMode = L.tileLayer(
    //   "https://{s}.tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token={accessToken}",
    //   {
    //     attribution:
    //       '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //     minZoom: 0,
    //     maxZoom: 22,
    //     subdomains: "abcd",
    //     accessToken:
    //       "GSRGuSqDDcYgQnf3k9ESutlUBugw4YctZAzWNSE7iZLhxb0jQZLuHbOXq5etkVAQ",
    //   }
    // );

    let userMarker = L.marker(singapore, { draggable: true });
    let popup = userMarker.bindPopup("Hello");
    popup.addTo(map);

    // Set up base layers
    baseMaps = {
      '<i class="fa-solid fa-sun"></i>': lightMode,
      '<i class="fa-solid fa-cloud-moon"></i>' : darkMode,
    };

    // Set up overlays
    overlays = {
      // "Search Results": searchLayer
    };

    // {collapsed=false}??
    L.control
      .layers(baseMaps, overlays, { position: "bottomright" })
      .addTo(map);

    return map;
  }
  init();
}

main();
