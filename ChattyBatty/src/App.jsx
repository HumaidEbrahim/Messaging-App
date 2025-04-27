import { useState } from 'react'
import { BigHeader } from '@/components/common'

function App() {
  const [count, setCount] = useState(0)

  return (
   <div> 
    <BigHeader text={'Welcome to ChattyBatty'} />
    <button className="btn">Default</button>
   </div>
  )
}

export default App
