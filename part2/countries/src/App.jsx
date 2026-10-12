import { useState, useEffect } from 'react'
import countryService from './services/countries'
import Country from './components/Country'

const App = () => {
  const [countries, setCountries] = useState([])
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    countryService.getAll().then(data => setCountries(data))
  }, [])

  const handleFilterChange = event => {
    setFilter(event.target.value)
    setSelected(null)
  }

  const matches = countries.filter(c =>
    c.name.common.toLowerCase().includes(filter.toLowerCase())
  )

  let content = null

  if (filter === '') {
    content = null
  } else if (selected) {
    content = <Country country={selected} />
  } else if (matches.length > 10) {
    content = <p>Too many matches, specify another filter</p>
  } else if (matches.length > 1) {
    content = matches.map(c => (
      <div key={c.name.common}>
        {c.name.common} <button onClick={() => setSelected(c)}>show</button>
      </div>
    ))
  } else if (matches.length === 1) {
    content = <Country country={matches[0]} />
  } else {
    content = <p>No matches</p>
  }

  return (
    <div>
      find countries <input value={filter} onChange={handleFilterChange} />
      {content}
    </div>
  )
}

export default App
