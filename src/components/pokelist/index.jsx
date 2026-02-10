import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PokeCard from "../PokeCard/PokeCard";

import './index.css';

const PokeList = () => {
    const navigate = useNavigate();
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
        return <p>Loading...</p>
    }

    return (
        <div className="poke-list-container">
            <h2>Pokemon List</h2>
            <div className="poke-list-search">
                <input
                    className="poke-list-search-input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by ID or name"
                    aria-label="Search by ID or name"
                />
                <button
                    className="poke-list-create-button"
                    type="button"
                    onClick={() => navigate("/pokemonDetails")}
                >
                    Create Pokemon
                </button>
            </div>
            {filteredPokemons.length === 0 ? (
                <div className="poke-list-empty">
                    <img
                        className="poke-list-empty-image"
                        src="http://localhost:3000/assets/pokemons/missing-pokemon.png"
                        alt="Missing Pokemon"
                    />
                    <p className="poke-list-empty-text">No Pokemon found</p>
                </div>
            ) : (
                <>
                    <ul className="poke-list">
                        {paginatedPokemons.map((pokemon, index) => (
                            <PokeCard
                                key={pokemon?.id ?? pokemon?.name?.english ?? pokemon?.name ?? index}
                                pokemon={pokemon}
                            />
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
                </>
            )}
        </div>
    );
};

export default PokeList;
