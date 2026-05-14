// Air Quality + Weather for Biratnagar
const AQI_LABELS = {
  1: "Good",
  2: "Fair",
  3: "Moderate",
  4: "Poor",
  5: "Very Poor",
};
const AQI_COLORS = {
  1: "#2ecc71",
  2: "#f1c40f",
  3: "#e67e22",
  4: "#e74c3c",
  5: "#8e44ad",
};

fetch("php/air-pollution.php?city=biratnagar")
  .then((r) => r.json())
  .then((data) => {
    const city = data.cities?.[0];
    if (!city) return;
    const aqi = city.aqi;
    const pm25 = city.components?.pm2_5?.toFixed(1) ?? "—";
    const color = AQI_COLORS[aqi] || "#aaa";
    const label = AQI_LABELS[aqi] || "—";
    const valEl = document.getElementById("aqiValue");
    valEl.textContent = `${pm25} µg/m³ — ${label}`;
    valEl.style.color = color;
    valEl.style.fontWeight = "700";
  })
  .catch(() => {});

// Weather - fetch through PHP proxy (API key stays server-side)
fetch("php/air-pollution.php?city=biratnagar&action=weather")
  .then((r) => r.json())
  .then((d) => {
    if (!d.ok) return;
    document.getElementById("aqiWeatherText").textContent =
      `${d.temp}°C  Biratnagar`;
    if (d.icon) {
      const img = document.getElementById("aqiWeatherIcon");
      img.src = `https://openweathermap.org/img/wn/${d.icon}.png`;
      img.style.display = "inline";
    }
  })
  .catch(() => {});
