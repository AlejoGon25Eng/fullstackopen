import Weather from './Weather'

const Country = ({ country }) => (
  <div>
    <h1>{country.name.common}</h1>
    <div>capital {country.capital && country.capital[0]}</div>
    <div>area {country.area}</div>
    <h3>languages</h3>
    <ul>
      {Object.values(country.languages || {}).map(language => (
        <li key={language}>{language}</li>
      ))}
    </ul>
    <img src={country.flags.png} alt={country.flags.alt || 'flag'} width="150" />
    {country.capital && <Weather city={country.capital[0]} />}
  </div>
)

export default Country
