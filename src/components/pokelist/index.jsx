import { useState, useEffect } from "react";
import PokeCard from "../PokeCard/PokeCard";

import './index.css';

const PokeList = () => {
    const [pokemons, setPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 20;

    useEffect(() => {
        // fetch("https://pokeapi.co/api/v2/pokemon?limit=10000")
        fetch("http://localhost:3000/pokemons")
            .then((response) => response.json())
            .then((data) => {
                console.log("Données reçues:", data);
                setPokemons(data);
                console.log("Pokémons extraits:", data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erreur:", error);
                setLoading(false);
            });
    }, []);

    const normalizedQuery = query.trim().toLowerCase();

    useEffect(() => {
        setPage(1);
    }, [normalizedQuery]);

    const filteredPokemons = pokemons.filter((pokemon) => {
        if (!normalizedQuery) {
            return true;
        }

        const idMatch = String(pokemon.id).startsWith(normalizedQuery);
        if (/^\d+$/.test(normalizedQuery)) {
            return idMatch;
        }

        const names = [
            pokemon?.name?.english,
            pokemon?.name?.french,
            pokemon?.name?.japanese,
            pokemon?.name?.chinese,
            pokemon?.name,
        ]
            .filter(Boolean)
            .map((name) => String(name).toLowerCase());

        return names.some((name) => name.includes(normalizedQuery));
    });

    const totalPages = Math.max(1, Math.ceil(filteredPokemons.length / perPage));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * perPage;
    const paginatedPokemons = filteredPokemons.slice(startIndex, startIndex + perPage);

    if (loading) {
        return <p>Chargement...</p>
    }

    return (
        <div className="poke-list-container">
            <h2>Liste des Pokémon</h2>
            <div className="poke-list-search">
                <input
                    className="poke-list-search-input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por ID ou nome"
                    aria-label="Buscar por ID ou nome"
                />
            </div>
            <ul className="poke-list">
                {paginatedPokemons.map((pokemon, index) => (
                    <PokeCard key={index} pokemon={pokemon} />
                ))}
            </ul>
            <div className="poke-list-pagination">
                <button
                    className="poke-list-page-button"
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="poke-list-page-info">
                    Page {currentPage} / {totalPages}
                </span>
                <button
                    className="poke-list-page-button"
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PokeList;
