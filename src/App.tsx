import { useState } from 'react'
import './App.css'
import { Link, Outlet } from 'react-router'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/list">List</Link>
          <Link to="/about">About</Link>
        </nav>
        <Outlet />
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          谭某颜值系数： {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App
