const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '3daaae70c8msh48067969f825d70p1d8549jsnbf90168841c9',
		'X-RapidAPI-Host': 'weather-by-api-ninjas.p.rapidapi.com'
	}
};

async function getWeather(city) {
    const url = 'https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city=' + city;
    cityName.innerHTML = city;
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      cloud_pct.innerHTML = result.cloud_pct;
      temp.innerHTML = result.temp;
      temp2.innerHTML = result.temp;
      humidity.innerHTML = result.humidity;
      humidity2.innerHTML = result.humidity;
      min_temp.innerHTML = result.min_temp;
      max_temp.innerHTML = result.max_temp;
      wind_speed.innerHTML = result.wind_speed;
      wind_speed2.innerHTML = result.wind_speed;
      wind_degrees.innerHTML = result.wind_degrees;
      sunrise.innerHTML = result.sunrise;
      sunset.innerHTML = result.sunset;
    } catch (error) {
      console.error(error);
    }
  }
  
  // Add an event listener to the submit button
  submit.addEventListener('click', (e) => {
    e.preventDefault();
    // const city = cityName.value; // Get the value of the search box
    // getWeather(city);
    getWeather(city.value)
  });
  
  getWeather("Nagpur");

const myModal = document.getElementById('myModal')
const myInput = document.getElementById('myInput')

myModal.addEventListener('click', () => {
  myInput.focus()
})
