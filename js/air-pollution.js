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

const OWM_KEY = "3499debf8404c6fe9a44f9785b68b0ad";
fetch(
  `https://api.openweathermap.org/data/2.5/weather?lat=26.4525&lon=87.2718&appid=${OWM_KEY}&units=metric`,
)
  .then((r) => r.json())
  .then((d) => {
    const temp = Math.round(d.main?.temp ?? 0);
    const icon = d.weather?.[0]?.icon;
    document.getElementById("aqiWeatherText").textContent =
      `${temp}°C  Biratnagar`;
    if (icon) {
      const img = document.getElementById("aqiWeatherIcon");
      img.src = `https://openweathermap.org/img/wn/${icon}.png`;
      img.style.display = "inline";
    }
  })
  .catch(() => {});
