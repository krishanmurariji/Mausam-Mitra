// ==========================================
// MAUSAM MITRA - WEATHER APPLICATION
// Developed by: Krishan Murari
// Website: https://krishanmurari.live/
// Using: Open-Meteo API (Free, No API Key Required)
// ==========================================

// ==================== POPULAR CITIES ====================
const popularCities = [
  'Chandigarh', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
  'Patna', 'Surat', 'Vadodara', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Visakhapatnam', 'Varanasi', 'Amritsar', 'Allahabad', 'Ranchi', 'Gwalior',
  'London', 'New York', 'Paris', 'Tokyo', 'Dubai', 'Singapore', 'Sydney', 'Berlin',
  'Toronto', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Seattle', 'Boston',
  'Barcelona', 'Rome', 'Amsterdam', 'Madrid', 'Istanbul', 'Bangkok', 'Seoul',
  'San Francisco', 'Las Vegas', 'Orlando', 'Philadelphia', 'Phoenix', 'San Diego',
  'Manchester', 'Melbourne', 'Hong Kong', 'Shanghai', 'Beijing', 'Cairo', 'Moscow'
];

// ==================== MAIN WEATHER FUNCTION ====================

async function getWeather(city) {
    if (!city || city.trim() === '') {
        showError('Please enter a city name');
        return;
    }

    const cityName = city.trim();
    showLoading(true);
    
    try {
        // Step 1: Get city coordinates using geocoding
        const coordinates = await getCityCoordinates(cityName);
        
        if (!coordinates) {
            throw new Error('City not found');
        }
        
        // Step 2: Get weather data using coordinates
        const weatherData = await fetchWeatherData(coordinates);
        
        if (!weatherData) {
            throw new Error('Unable to fetch weather data');
        }
        
        // Step 3: Update UI with weather data
        updateWeatherUI(cityName, weatherData, coordinates);
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        showLoading(false);
        
        if (error.message === 'City not found') {
            showError(`City "${cityName}" not found. Please check spelling and try again.`);
        } else {
            showError(`Unable to fetch weather data for "${cityName}". Please try again later.`);
        }
    }
}

// ==================== GEOCODING - GET CITY COORDINATES ====================

async function getCityCoordinates(city) {
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        
        const response = await fetch(geoUrl);
        
        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            return null;
        }
        
        const result = data.results[0];
        
        return {
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            country: result.country || '',
            timezone: result.timezone || 'auto'
        };
        
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// ==================== FETCH WEATHER DATA ====================

async function fetchWeatherData(coordinates) {
    try {
        const { latitude, longitude, timezone } = coordinates;
        
        // Open-Meteo API URL with all required parameters
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=${timezone}`;
        
        const response = await fetch(weatherUrl);
        
        if (!response.ok) {
            throw new Error(`Weather API failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.current) {
            throw new Error('Invalid weather data received');
        }
        
        // Process and return weather data
        return {
            temp: Math.round(data.current.temperature_2m),
            feels_like: Math.round(data.current.apparent_temperature),
            min_temp: Math.round(data.daily.temperature_2m_min[0]),
            max_temp: Math.round(data.daily.temperature_2m_max[0]),
            humidity: Math.round(data.current.relative_humidity_2m),
            wind_speed: Math.round(data.current.wind_speed_10m),
            wind_degrees: Math.round(data.current.wind_direction_10m),
            cloud_pct: Math.round(data.current.cloud_cover),
            pressure: Math.round(data.current.pressure_msl),
            precipitation: data.current.precipitation || 0,
            weather_code: data.current.weather_code,
            sunrise: data.daily.sunrise[0],
            sunset: data.daily.sunset[0]
        };
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

// ==================== GET WEATHER DESCRIPTION ====================

function getWeatherDescription(weatherCode) {
    const weatherCodes = {
        0: { icon: 'fa-sun', desc: 'Clear Sky', color: '#FFD700' },
        1: { icon: 'fa-sun', desc: 'Mainly Clear', color: '#FFD700' },
        2: { icon: 'fa-cloud-sun', desc: 'Partly Cloudy', color: '#87CEEB' },
        3: { icon: 'fa-cloud', desc: 'Overcast', color: '#B0C4DE' },
        45: { icon: 'fa-smog', desc: 'Foggy', color: '#A9A9A9' },
        48: { icon: 'fa-smog', desc: 'Depositing Rime Fog', color: '#A9A9A9' },
        51: { icon: 'fa-cloud-rain', desc: 'Light Drizzle', color: '#4682B4' },
        53: { icon: 'fa-cloud-rain', desc: 'Moderate Drizzle', color: '#4682B4' },
        55: { icon: 'fa-cloud-showers-heavy', desc: 'Dense Drizzle', color: '#4169E1' },
        61: { icon: 'fa-cloud-rain', desc: 'Slight Rain', color: '#4682B4' },
        63: { icon: 'fa-cloud-rain', desc: 'Moderate Rain', color: '#4682B4' },
        65: { icon: 'fa-cloud-showers-heavy', desc: 'Heavy Rain', color: '#4169E1' },
        71: { icon: 'fa-snowflake', desc: 'Slight Snow', color: '#ADD8E6' },
        73: { icon: 'fa-snowflake', desc: 'Moderate Snow', color: '#87CEEB' },
        75: { icon: 'fa-snowflake', desc: 'Heavy Snow', color: '#4682B4' },
        77: { icon: 'fa-snowflake', desc: 'Snow Grains', color: '#B0C4DE' },
        80: { icon: 'fa-cloud-showers-heavy', desc: 'Slight Rain Showers', color: '#4682B4' },
        81: { icon: 'fa-cloud-showers-heavy', desc: 'Moderate Rain Showers', color: '#4169E1' },
        82: { icon: 'fa-cloud-showers-heavy', desc: 'Violent Rain Showers', color: '#1E90FF' },
        85: { icon: 'fa-snowflake', desc: 'Slight Snow Showers', color: '#ADD8E6' },
        86: { icon: 'fa-snowflake', desc: 'Heavy Snow Showers', color: '#4682B4' },
        95: { icon: 'fa-bolt', desc: 'Thunderstorm', color: '#FFD700' },
        96: { icon: 'fa-bolt', desc: 'Thunderstorm with Slight Hail', color: '#FFA500' },
        99: { icon: 'fa-bolt', desc: 'Thunderstorm with Heavy Hail', color: '#FF4500' }
    };
    
    return weatherCodes[weatherCode] || { icon: 'fa-cloud', desc: 'Unknown', color: '#87CEEB' };
}

// ==================== UI UPDATE FUNCTION ====================

function updateWeatherUI(city, result, coordinates) {
    showLoading(false);
    
    // Update city name with country
    const cityNameElement = document.getElementById('cityName');
    cityNameElement.style.opacity = '0';
    setTimeout(() => {
        cityNameElement.innerHTML = `${city}${coordinates.country ? ', ' + coordinates.country : ''}`;
        cityNameElement.style.opacity = '1';
    }, 200);
    
    // Get weather description
    const weather = getWeatherDescription(result.weather_code);
    
    // Temperature data
    document.getElementById('temp').innerHTML = result.temp;
    document.getElementById('temp2').innerHTML = result.temp;
    document.getElementById('min_temp').innerHTML = result.min_temp;
    document.getElementById('max_temp').innerHTML = result.max_temp;
    
    // Humidity data
    document.getElementById('humidity').innerHTML = result.humidity;
    document.getElementById('humidity2').innerHTML = result.humidity;
    
    // Wind data
    document.getElementById('wind_speed').innerHTML = result.wind_speed;
    document.getElementById('wind_speed2').innerHTML = result.wind_speed;
    document.getElementById('wind_degrees').innerHTML = result.wind_degrees;
    
    // Cloud data
    document.getElementById('cloud_pct').innerHTML = result.cloud_pct;
    
    // Format sunrise time (ISO 8601 format from Open-Meteo)
    if (result.sunrise) {
        const sunriseDate = new Date(result.sunrise);
        const sunriseTime = sunriseDate.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
        document.getElementById('sunrise').innerHTML = sunriseTime;
    } else {
        document.getElementById('sunrise').innerHTML = '--';
    }
    
    // Format sunset time
    if (result.sunset) {
        const sunsetDate = new Date(result.sunset);
        const sunsetTime = sunsetDate.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
        document.getElementById('sunset').innerHTML = sunsetTime;
    } else {
        document.getElementById('sunset').innerHTML = '--';
    }
    
    // Show weather condition in success message
    showSuccess(`${weather.desc} • ${result.temp}°C • Loaded from Open-Meteo`);
    
    // Add weather icon to the page (optional enhancement)
    updateWeatherIcon(weather);
}

// ==================== UPDATE WEATHER ICON (OPTIONAL) ====================

function updateWeatherIcon(weather) {
    // Find or create weather icon element
    let iconElement = document.querySelector('.current-weather-icon');
    
    if (!iconElement) {
        iconElement = document.createElement('i');
        iconElement.className = 'fas current-weather-icon';
        const cityNameElement = document.getElementById('cityName');
        if (cityNameElement) {
            cityNameElement.insertAdjacentElement('beforebegin', iconElement);
        }
    }
    
    iconElement.className = `fas ${weather.icon} current-weather-icon me-2`;
    iconElement.style.color = weather.color;
    iconElement.style.fontSize = '2rem';
}

// ==================== LOADING STATE ====================

function showLoading(isLoading) {
    const spinnerHTML = `
        <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    
    if (isLoading) {
        document.getElementById('temp2').innerHTML = spinnerHTML;
        document.getElementById('humidity2').innerHTML = spinnerHTML;
        document.getElementById('wind_speed2').innerHTML = spinnerHTML;
        
        const submitBtn = document.getElementById('submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
    } else {
        const submitBtn = document.getElementById('submit');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
        }
    }
}

// ==================== AUTOCOMPLETE FUNCTIONALITY ====================

function setupAutocomplete() {
    const input = document.getElementById('city');
    if (!input) return;
    
    const suggestionsList = document.createElement('div');
    suggestionsList.className = 'autocomplete-suggestions';
    suggestionsList.style.cssText = `
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: var(--bg-primary);
        border-radius: 16px;
        max-height: 320px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 12px 12px 24px var(--shadow-dark), -12px -12px 24px var(--shadow-light);
        display: none;
        animation: fadeInDown 0.3s ease-out;
    `;
    
    const searchContainer = input.closest('.search-container');
    if (searchContainer) {
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(suggestionsList);
    }
    
    input.addEventListener('input', function() {
        const value = this.value.trim().toLowerCase();
        suggestionsList.innerHTML = '';
        
        if (value.length < 2) {
            suggestionsList.style.display = 'none';
            return;
        }
        
        const filtered = popularCities.filter(city => 
            city.toLowerCase().includes(value)
        ).slice(0, 10);
        
        if (filtered.length > 0) {
            filtered.forEach(city => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.style.cssText = `
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-radius: 12px;
                    margin: 6px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                `;
                
                const regex = new RegExp(`(${value})`, 'gi');
                const highlightedCity = city.replace(regex, '<strong style="color: var(--accent-blue);">$1</strong>');
                
                item.innerHTML = `
                    <i class="fas fa-map-marker-alt" style="color: var(--accent-blue); font-size: 14px;"></i>
                    <span style="color: var(--text-primary); font-weight: 500;">${highlightedCity}</span>
                `;
                
                item.addEventListener('mouseenter', function() {
                    this.style.background = 'rgba(91, 124, 255, 0.1)';
                    this.style.transform = 'translateX(4px)';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.background = 'transparent';
                    this.style.transform = 'translateX(0)';
                });
                
                item.addEventListener('click', function() {
                    input.value = city;
                    suggestionsList.style.display = 'none';
                    getWeather(city);
                });
                
                suggestionsList.appendChild(item);
            });
            
            suggestionsList.style.display = 'block';
        } else {
            suggestionsList.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                    <i class="fas fa-search mb-2" style="font-size: 24px; opacity: 0.5;"></i>
                    <p style="margin: 0;">No cities found matching "${value}"</p>
                </div>
            `;
            suggestionsList.style.display = 'block';
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.style.display = 'none';
        }
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            suggestionsList.style.display = 'none';
        }
    });
}

// ==================== FORM SUBMIT HANDLER ====================

document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cityInput = document.getElementById('city');
            const city = cityInput ? cityInput.value.trim() : '';
            
            if (city) {
                getWeather(city);
            } else {
                showError('Please enter a city name!');
                cityInput.focus();
            }
        });
    }
    
    setupAutocomplete();
    getWeather("Chandigarh");
    
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: 'ease-out'
        });
    }
    
    document.documentElement.style.scrollBehavior = 'smooth';
});

// ==================== KEYBOARD SHORTCUTS ====================

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const cityInput = document.getElementById('city');
        if (cityInput) {
            cityInput.focus();
            cityInput.select();
        }
    }
});

// ==================== CSS ANIMATIONS ====================

// ==================== CSS ANIMATIONS ====================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    #cityName {
        transition: opacity 0.3s ease;
    }
    
    .autocomplete-suggestions::-webkit-scrollbar {
        width: 8px;
    }
    
    .autocomplete-suggestions::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .autocomplete-suggestions::-webkit-scrollbar-thumb {
        background: var(--shadow-dark);
        border-radius: 10px;
    }
    
    .autocomplete-suggestions::-webkit-scrollbar-thumb:hover {
        background: var(--accent-blue);
    }
    
    .current-weather-icon {
        animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
    }
    
    /* Toast Container */
    #toastContainer {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
    }
    
    /* Toast Styles */
    .weather-toast {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: var(--bg-primary);
        border-radius: 16px;
        box-shadow: 
            12px 12px 24px var(--shadow-dark),
            -12px -12px 24px var(--shadow-light);
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        min-width: 300px;
    }
    
    .weather-toast.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .toast-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 
            inset 4px 4px 8px var(--shadow-dark),
            inset -4px -4px 8px var(--shadow-light);
    }
    
    .toast-success .toast-icon {
        background: linear-gradient(135deg, #10b981, #059669);
    }
    
    .toast-success .toast-icon i {
        color: white;
        font-size: 1.2rem;
    }
    
    .toast-danger .toast-icon {
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    .toast-danger .toast-icon i {
        color: white;
        font-size: 1.2rem;
    }
    
    .toast-content {
        flex: 1;
    }
    
    .toast-title {
        display: block;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    
    .toast-message {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.4;
    }
    
    .toast-close {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: var(--bg-primary);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        box-shadow: 
            4px 4px 8px var(--shadow-dark),
            -4px -4px 8px var(--shadow-light);
    }
    
    .toast-close:hover {
        color: var(--accent-blue);
        box-shadow: 
            inset 4px 4px 8px var(--shadow-dark),
            inset -4px -4px 8px var(--shadow-light);
    }
    
    /* Mobile responsive */
    @media (max-width: 576px) {
        #toastContainer {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }
        
        .weather-toast {
            min-width: auto;
        }
    }
`;
document.head.appendChild(style);




// ==================== IMPROVED ALERT FUNCTIONS ====================

function showError(message) {
    showAlert(message, 'danger', 'fa-exclamation-circle');
}

function showSuccess(message) {
    showAlert(message, 'success', 'fa-check-circle');
}

function showAlert(message, type, icon) {
    // Remove existing alert
    const existingAlert = document.getElementById('weatherAlert');
    if (existingAlert) existingAlert.remove();
    
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.id = 'weatherAlert';
    toast.className = `weather-toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="toast-content">
            <strong class="toast-title">${type === 'danger' ? 'Error' : 'Success'}!</strong>
            <p class="toast-message">${message}</p>
        </div>
        <button type="button" class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto dismiss
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, type === 'success' ? 4000 : 6000);
}
