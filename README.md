# GeoGuess

A 3-minute brain exercise where players guess flags, capitals, and countries through interactive quiz rounds, complete with live scores, random challenges, and a confetti celebration at the end.

**[Play GeoGuess Live](https://geo-guess-sepia-two.vercel.app/)**

---

## Project Overview

This was my first experiment working with APIs! Building GeoGuess introduced me to the world of REST APIs and how to consume real-world data to create an interactive application. What started as a learning project evolved into a fully functional geography quiz game that demonstrates core REST principles and API integration patterns.

---

## API Documentation

### 1. Service Provider

**API Name:** Country State City API  
**Provider:** Reliable API Services  
**Base URL:** `https://api.countrystatecity.in`  
**Documentation:** [Country State City API Docs](https://countrystatecity.in/)

---

### 2. Basic Functionality

The Country State City API provides comprehensive geographic data about countries, states, and cities worldwide. For the GeoGuess project, we specifically consume country information including:

- **Country Names** - Official names of all countries
- **Country Codes** - ISO 2-letter country codes (e.g., US, FR, JP)
- **Capital Cities** - The capital city of each country

This data powers all three rounds of our quiz: flag identification, capital guessing, and country-to-capital matching.

---

### 3. Accessing the Service via REST Client

#### 3.1 Understanding REST Principles

REST (Representational State Transfer) is an architectural style for designing networked applications. Here are the core principles we use in GeoGuess:

##### **Service as a Resource**
In REST, everything is a resource. The Country State City API treats geographic entities (countries, states, cities) as resources that can be accessed and manipulated through HTTP requests.

##### **Root Resource URL**
```
https://api.countrystatecity.in
```

The root URL represents the API service itself. All endpoints are built from this base, following a hierarchical path structure.

##### **API Paths and Hierarchy**
```
https://api.countrystatecity.in/v1/countries
```

Breaking this down:
- `/v1/` - API version (current version is 1)
- `/countries` - The resource we're requesting (all countries)

Additional path examples for reference:
```
https://api.countrystatecity.in/v1/countries/{country_id}/states
https://api.countrystatecity.in/v1/countries/{country_id}/states/{state_id}/cities
```

#### 3.2 HTTP Methods and Request Structure

The Country State City API primarily uses the **GET** method for retrieving data (read-only operations).

##### **Making a Request with Postman**

**Step 1: Open Postman and Create a New Request**
- Method: `GET`
- URL: `https://api.countrystatecity.in/v1/countries`

**Step 2: Add Required Headers**
The API requires authentication via an API key. Add the following header:

| Header Key | Value |
|---|---|
| `X-CSCAPI-KEY` | `f564f0796fb4c157ee7a41044ecb59bc87993ea1ac762047d160c6c9d4bbee94` |

**Step 3: Send the Request**

```
GET https://api.countrystatecity.in/v1/countries
Headers: X-CSCAPI-KEY: [your-api-key]
```

**Alternative: Advanced Rest Client**
1. Select **GET** from the HTTP method dropdown
2. Paste the URL: `https://api.countrystatecity.in/v1/countries`
3. Add header: `X-CSCAPI-KEY: [your-api-key]`
4. Click "Send"

#### 3.3 Response Representation

The API returns data in **JSON format**, which is the standard for modern APIs. JSON (JavaScript Object Notation) is flexible and easily parsed by JavaScript.

##### **Sample Response Structure**

```json
[
  {
    "id": 1,
    "name": "United States",
    "iso3": "USA",
    "iso2": "US",
    "numeric_code": "840",
    "phone_code": "+1",
    "capital": "Washington",
    "currency": "USD",
    "currency_name": "Dollar",
    "currency_symbol": "$",
    "tld": ".us",
    "native": "United States",
    "region": "Americas",
    "subregion": "Northern America",
    "latitude": 37.0902,
    "longitude": -95.7129,
    "emoji": "🇺🇸"
  },
  {
    "id": 2,
    "name": "France",
    "iso3": "FRA",
    "iso2": "FR",
    "numeric_code": "250",
    "phone_code": "+33",
    "capital": "Paris",
    "currency": "EUR",
    "currency_name": "Euro",
    "currency_symbol": "€",
    "tld": ".fr",
    "native": "France",
    "region": "Europe",
    "subregion": "Western Europe",
    "latitude": 46.2276,
    "longitude": 2.2137,
    "emoji": "🇫🇷"
  }
]
```

##### **API Flexibility: Content Negotiation**

While the Country State City API primarily returns JSON, REST APIs typically support multiple representation formats. The flexibility allows clients to request data in their preferred format:

- **JSON** (default) - `Accept: application/json`
- **XML** - `Accept: application/xml`

To request a specific format, add the `Accept` header:

```
GET https://api.countrystatecity.in/v1/countries
Headers: 
  X-CSCAPI-KEY: [your-api-key]
  Accept: application/json
```

---

### 4. Query Parameters

Query parameters modify the API response without changing the endpoint path. They are appended to the URL using the `?` symbol, with multiple parameters separated by `&`.

#### **General Query Parameter Structure**

```
https://api.countrystatecity.in/v1/countries?param1=value1&param2=value2
```

#### **Common Parameters in REST APIs** (examples for future expansion):

| Parameter | Example | Purpose |
|---|---|---|
| `limit` | `?limit=10` | Limit results to 10 records |
| `offset` | `?offset=5` | Skip first 5 records |
| `sort` | `?sort=name` | Sort by country name |
| `search` | `?search=United` | Search for countries containing "United" |

#### **Current GeoGuess Usage**

For GeoGuess, we request all countries without additional filters:

```javascript
// Fetching all countries
const response = await fetch(
  "https://api.countrystatecity.in/v1/countries",
  {
    headers: { "X-CSCAPI-KEY": "f564f0796fb4c157ee7a41044ecb59bc87993ea1ac762047d160c6c9d4bbee94" }
  }
);

const data = await response.json();
```

---

## 5. Real-World Scenario: How GeoGuess Uses the API

#### **The Challenge**

Building an engaging geography quiz requires:
1. Access to accurate country data (names, capitals, flags)
2. Ability to randomly select countries
3. Display of flag images and geographic information
4. Real-time validation of user answers

#### **The Solution: API Integration**

**Step 1: Fetch All Countries**
When the application loads, we make a single API call to retrieve all countries:

```javascript
async function fetchCountries() {
  const response = await fetch(
    "https://api.countrystatecity.in/v1/countries",
    {
      headers: { "X-CSCAPI-KEY": "f564f0796fb4c157ee7a41044ecb59bc87993ea1ac762047d160c6c9d4bbee94" }
    }
  );
  
  const data = await response.json();
  
  // Transform API response into our quiz format
  countries = data
    .map(country => ({
      name: country.name,
      code: country.iso2.toLowerCase(),    // Used for flag images
      capital: country.capital               // Used for capital questions
    }))
    .filter(country => country.capital);    // Only countries with capitals
}
```

**Step 2: Generate Quiz Questions**

The same data powers three different quiz rounds:

1. **Flags Round**: 
   - Question: "Which country does this flag belong to?"
   - Using the `code` field, we build flag image URLs: `https://flagcdn.com/w640/us.png`

2. **Capitals Round**:
   - Question: "Which country has this capital city?"
   - Display the capital name, user selects the country

3. **Countries Round**:
   - Question: "What is the capital city of this country?"
   - Display the country name, user selects the capital

**Step 3: Real-Time Feedback**

When a user answers:
```javascript
// Check answer against API-sourced data
if (userAnswer === currentCorrectAnswer) {
  score += 1;  // Correct!
  // Show visual feedback
} else {
  // Show which answer was correct
}
```

#### **Benefits of This API-Driven Approach**

- **Single Source of Truth**: All quiz data comes from one authoritative API
- **Scalability**: Automatically supports all 195+ countries
- **Consistency**: Country names, capitals, and codes always match
- **Low Maintenance**: No need to manually update geography data

---

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: Country State City API (REST)
- **Hosting**: Vercel
- **Data Format**: JSON
- **HTTP Method**: GET with custom headers

---

## How to Run Locally

1. Clone or download this repository
2. Navigate to the `assignment1` folder
3. Open `index.html` in a web browser
4. Start playing!
                              OR
**[Play GeoGuess Live](https://geo-guess-sepia-two.vercel.app/)** I deployed it for you to try :)

The application automatically fetches country data on load, so no additional setup is required.

---

## Future Enhancements

- Add query parameters to filter countries by region
- Integrate additional endpoints for states and cities
- Implement caching to reduce API calls
- Add difficulty levels with different country pools
- Include additional geographic data (population, area, etc.)

---

**Built with curiosity and code. Happy guessing!** 🌍
