import React from "react"

function ParentComponent() {
  const parentData = [
    { id: 1, name: "John", details: { age: 30, location: "New York" } },
    { id: 2, name: "Jane", details: { age: 25, location: "London" } },
    { id: 3, name: "Mike", details: { age: 35, location: "San Francisco" } },
  ]

  return <ChildComponent data={parentData} />
}

function ChildComponent({ data }) {
  return (
    <div>
      <h2>List of People</h2>
      <ul>
        {data.map(person => (
          <li key={person.id}>
            <strong>{person.name}</strong> ({person.details.age} years old) -{" "}
            {person.details.location}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ParentComponent
