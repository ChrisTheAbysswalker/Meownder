import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import Cat from './components/Meownder.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Cat />
    </>
  )
}

export default App
