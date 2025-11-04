const lukko = document.getElementById("lukittu");
// Näytetään aluksi pelkkä tiedonhaku palkki
//lukko.style.display = "none";

const limited = [
  "AAPL", "TSLA", "AMZN", "MSFT", "NVDA", "GOOGL", "META", "NFLX", "JPM", "V",
  "BAC", "AMD", "PYPL", "DIS", "T", "PFE", "COST", "INTC", "KO", "TGT", "NKE",
  "SPY", "BA", "BABA", "XOM", "WMT", "GE", "CSCO", "VZ", "JNJ", "CVX", "PLTR",
  "SQ", "SHOP", "SBUX", "SOFI", "HOOD", "RBLX", "SNAP", "UBER", "FDX", "ABBV",
  "ETSY", "MRNA", "LMT", "GM", "F", "RIVN", "LCID", "CCL", "DAL", "UAL", "AAL",
  "TSM", "SONY", "ET", "NOK", "MRO", "COIN", "SIRI", "RIOT", "CPRX", "VWO",
  "SPYG", "ROKU", "VIAC", "ATVI", "BIDU", "DOCU", "ZM", "PINS", "TLRY", "WBA",
  "MGM", "NIO", "C", "GS", "WFC", "ADBE", "PEP", "UNH", "CARR", "FUBO", "HCA",
  "TWTR", "BILI", "RKT"
];

const logo = document.getElementById("logo");

const lomake = document.getElementById("lomake");
lomake.addEventListener('submit', function(e) {
    e.preventDefault(); // estää sivun latautumisen

    let syote = lomake.elements["kentta"].value.trim().toUpperCase();

    if (syote.length === 0) {
        alert("Kenttä ei voi olla tyhjä!");
        return;
    }

    // Näytetään loppuosa sivusta
    lukko.style.display = "block";

    var tieto = new XMLHttpRequest();
    tieto.open('GET', `https://financialmodelingprep.com/stable/profile?symbol=${syote}&apikey=SNVbYoxdJgjGTpUbtP0U1Hj8eMs1eEtv`, true);

    tieto.onreadystatechange = function() {
        if (tieto.readyState === 4 && tieto.status === 200) {
            let data = JSON.parse(tieto.responseText);

            // Logon lisäys
            let kuva = document.createElement("img");
            kuva.src = data[0].image;
            kuva.width = 100;
            logo.innerHTML = "";
            logo.appendChild(kuva);

            // Yrityksen nimi
             document.getElementById("nimi").textContent = data[0].companyName;

            // symbooli
             document.getElementById("symbol").textContent = data[0].symbol;

            // Ala / sektori
             document.getElementById("sector").textContent = data[0].sector;

            // Pörssilistaus
             document.getElementById("porssi").textContent = data[0].exchange;

            // Tallennetaan valuutta
            valuutta = data[0].currency;

            // tallennetaan nykyinen hinta
            nykhinta = data[0].price;
            document.getElementById("hinta").textContent = nykhinta + " " + valuutta;

            // Vaihdon määrä
            document.getElementById("vaihto").textContent = data[0].volume;
            
            // Yrityksen kuvaus
             document.getElementById("info").textContent = data[0].description;
        }
    };
    tieto.send(); // Kutsu send() tämän ulkopuolella

    // Nollataan rajoitetut tiedot ettei tosen osakkeen tiedot jää näkyviin jos käyttäjä hakee toista osaketta joole ei ole saatavissa hinta tietoja
    document.getElementById("aloitushinta").textContent = "-";
    document.getElementById("ylin").textContent = "-";
    document.getElementById("alin").textContent = "-";

    // Jos ticker löytyy limited listasta haetaan tarkemmat hintatiedot
    if (limited.includes(syote)){
        var hintaTieto = new XMLHttpRequest();
        hintaTieto.open('GET', `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${syote}&apikey=SNVbYoxdJgjGTpUbtP0U1Hj8eMs1eEtv`, true);

        hintaTieto.onreadystatechange = function() {
            if (hintaTieto.readyState === 4 && hintaTieto.status === 200) {
                let hintadata = JSON.parse(hintaTieto.responseText);

                // tallennetaan Päivän avushinta
                avshinta = hintadata[0].open;
                document.getElementById("aloitushinta").textContent = `(Open ${avshinta} ${valuutta})`;
                // Päivän Ylin hinta
                document.getElementById("ylin").textContent = hintadata[0].high + " " + valuutta;
                // Päivän Alin hinta
                document.getElementById("alin").textContent = hintadata[0].low + " " + valuutta;

                // Lasketaan tuottoprosentti ja muokataan tyyli -/+
                prosenttilaskut(nykhinta, avshinta, "pricemuutos")
                prosenttilaskut(nykhinta, avshinta, "maxmuutos")
                prosenttilaskut(nykhinta, avshinta, "minmuutos")


            };
        };
        hintaTieto.send();
    }

    // Prosenttien laskeminen ja tulostus

    function prosenttilaskut(hinta, hinnasta, id) {
        const element = document.getElementById(id);
        const icon = element.querySelector('i');

        // lasketaan muutos prosentteina
        let muutos = ((hinnasta - hinta) / hinta) * 100;

        // jos negatiivinen
        if (muutos < 0) {
            muutos *= -1;

            // muokataan tyyli
            element.classList.remove('bg-success');
            element.classList.add('bg-danger');
            icon.className = 'fas fa-arrow-down me-1';
        } else {
            element.classList.remove('bg-danger');
            element.classList.add('bg-success');
            icon.className = 'fas fa-arrow-up me-1';
        }

        // asetetaan luku i-elementin perään
        element.innerHTML = `<i class="${icon.className}"></i> ${muutos.toFixed(1)}%`;
    }

    
});

// hinta chart
var chartsLine = document.querySelectorAll(".chart-line");

chartsLine.forEach(function(chart) {
  if (!chart.getAttribute('data-chart-initialized')) {

      var ctx = chart.getContext("2d");

      var gradient = ctx.createLinearGradient(0, 0, 0, 225);
      gradient.addColorStop(0, "rgba(215, 227, 244, 1)");
      gradient.addColorStop(1, "rgba(215, 227, 244, 0)");

      new Chart(ctx, {
          type: "line",
          data: {
              labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
              datasets: [{
                  label: "Sales ($)",
                  fill: true,
                  backgroundColor: gradient,
                  borderColor: "#007bff",
                  data: [2115,1562,1584,1892,1587,1923,2566,2448,2805,3438,2917,3327]
              }]
          },
          options: {
              maintainAspectRatio: false,
              interaction: {
                  intersect: false
              },
              plugins: {
                  legend: {
                      display: false
                  },
                  filler: {
                      propagate: false
                  }
              },
              scales: {
                  x: {
                      reverse: true,
                      grid: {
                          display: false
                      }
                  },
                  y: {
                      ticks: { stepSize: 10 },
                      border: { dash: [3,3] },
                      grid: { display: false }
                  }
              }
          }
      });

      chart.setAttribute("data-chart-initialized", "true");
  }
});