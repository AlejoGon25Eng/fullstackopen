import axios from 'axios'

const apiKey = import.meta.env.VITE_WEATHER_KEY

const getByCity = city =>
  axios
    .get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, units: 'metric', appid: apiKey }
    })
    .then(response => response.data)

export default { getByCity }
