import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    personService.getAll().then(initialPersons => setPersons(initialPersons))
  }, [])

  const notify = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const addPerson = event => {
    event.preventDefault()
    const existing = persons.find(p => p.name === newName)

    if (existing) {
      if (
        window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        personService
          .update(existing.id, { ...existing, number: newNumber })
          .then(updated => {
            setPersons(persons.map(p => (p.id === existing.id ? updated : p)))
            setNewName('')
            setNewNumber('')
            notify(`Changed number of ${updated.name}`)
          })
          .catch(error => {
            if (error.response?.status === 404) {
              notify(
                `Information of ${existing.name} has already been removed from server`,
                'error'
              )
              setPersons(persons.filter(p => p.id !== existing.id))
            } else {
              notify(error.response?.data?.error || 'Update failed', 'error')
            }
          })
      }
      return
    }

    personService
      .create({ name: newName, number: newNumber })
      .then(created => {
        setPersons(persons.concat(created))
        setNewName('')
        setNewNumber('')
        notify(`Added ${created.name}`)
      })
      .catch(error => {
        notify(error.response?.data?.error || 'Creation failed', 'error')
      })
  }

  const deletePerson = person => {
    if (window.confirm(`Delete ${person.name} ?`)) {
      personService
        .remove(person.id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== person.id))
          notify(`Deleted ${person.name}`)
        })
        .catch(() => {
          notify(
            `Information of ${person.name} has already been removed from server`,
            'error'
          )
          setPersons(persons.filter(p => p.id !== person.id))
        })
    }
  }

  const personsToShow = persons.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification notification={notification} />
      <Filter value={filter} onChange={e => setFilter(e.target.value)} />
      <h3>Add a new</h3>
      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        onNameChange={e => setNewName(e.target.value)}
        newNumber={newNumber}
        onNumberChange={e => setNewNumber(e.target.value)}
      />
      <h3>Numbers</h3>
      <Persons persons={personsToShow} onDelete={deletePerson} />
    </div>
  )
}

export default App
