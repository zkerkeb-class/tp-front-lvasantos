import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/neon-effects.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PokemonDetails from './screens/pokemonDetails.jsx';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/pokemonDetails" element={<PokemonDetails />} />
            <Route path="/pokemonDetails/:id" element={<PokemonDetails />} />
        </Routes>
    </BrowserRouter>
    ,
)
