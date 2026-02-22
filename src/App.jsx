import { useEffect } from 'react';
import './App.css'
import Pokelist from './components/pokelist'
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate();
  console.log(navigate);

  useEffect(() => {
    console.log("App component mounted");

    // setTimeout(() =>
    // redirectToDetails()
    // , 5000);

  }, []);

  return (
    <div>
      <Pokelist></Pokelist>
    </div>
  )

}

export default App
