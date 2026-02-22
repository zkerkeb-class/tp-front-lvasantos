import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PokeCard from "../PokeCard/PokeCard";

import './index.css';

const PokeList = () => {
    const navigate = useNavigate();
    const [pokemons, setPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sortKey, setSortKey] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [page, setPage] = useState(1);
    const perPage = 20;

    useEffect(() => {
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
    }, [normalizedQuery, typeFilter, sortKey, sortOrder]);

    // Neon background: sincroniza classe do body com filtro ativo
    useEffect(() => {
        const body = document.body;
        // Remove classes filter-*
        body.classList.forEach((cls) => {
            if (cls.startsWith('filter-')) body.classList.remove(cls);
        });
        if (typeFilter && typeFilter !== 'all') {
            body.classList.add(`filter-${typeFilter}`);
        }
        // Limpeza ao desmontar
        return () => {
            body.classList.forEach((cls) => {
                if (cls.startsWith('filter-')) body.classList.remove(cls);
            });
        };
    }, [typeFilter]);

    const typeOptions = Array.from(
        new Set(
            pokemons
                .flatMap((pokemon) => pokemon?.type || [])
                .map((type) => String(type).toLowerCase())
        )
    ).sort();

    const filteredPokemons = pokemons.filter((pokemon) => {
        if (typeFilter !== "all") {
            const pokemonTypes = (pokemon?.type || []).map((type) => String(type).toLowerCase());
            if (!pokemonTypes.includes(typeFilter)) {
                return false;
            }
        }

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

    const sortedPokemons = [...filteredPokemons].sort((left, right) => {
        const direction = sortOrder === "desc" ? -1 : 1;
        if (sortKey === "id") {
            return direction * ((left?.id ?? 0) - (right?.id ?? 0));
        }
        if (sortKey === "name") {
            const leftName = left?.name?.english || left?.name || "";
            const rightName = right?.name?.english || right?.name || "";
            return direction * leftName.localeCompare(rightName);
        }
        if (sortKey === "hp") {
            return direction * ((left?.base?.HP ?? 0) - (right?.base?.HP ?? 0));
        }
        if (sortKey === "attack") {
            return direction * ((left?.base?.Attack ?? 0) - (right?.base?.Attack ?? 0));
        }
        if (sortKey === "defense") {
            return direction * ((left?.base?.Defense ?? 0) - (right?.base?.Defense ?? 0));
        }
        if (sortKey === "special-attack") {
            return direction * ((left?.base?.SpecialAttack ?? 0) - (right?.base?.SpecialAttack ?? 0));
        }
        if (sortKey === "special-defense") {
            return direction * ((left?.base?.SpecialDefense ?? 0) - (right?.base?.SpecialDefense ?? 0));
        }
        if (sortKey === "speed") {
            return direction * ((left?.base?.Speed ?? 0) - (right?.base?.Speed ?? 0));
        }
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(sortedPokemons.length / perPage));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * perPage;
    const paginatedPokemons = sortedPokemons.slice(startIndex, startIndex + perPage);

    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <div className="poke-list-container">
            <div className="poke-list-toolbar">
                <h2>Pokemon List</h2>
                <button
                    className="poke-list-create-button"
                    type="button"
                    onClick={() => navigate("/pokemonDetails")}
                >
                    Create Pokemon
                </button>
            </div>
            <div className="poke-list-controls">
                <input
                    className="poke-list-search-input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by ID or name"
                    aria-label="Search by ID or name"
                />
                <div className="poke-list-filters">
                    <label className="poke-list-filter">
                        <span className="poke-list-filter-label">Type</span>
                        <select
                            className="poke-list-select"
                            value={typeFilter}
                            onChange={(event) => setTypeFilter(event.target.value)}
                        >
                            <option value="all">All</option>
                            {typeOptions.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="poke-list-filter">
                        <span className="poke-list-filter-label">Sort</span>
                        <select
                            className="poke-list-select"
                            value={sortKey}
                            onChange={(event) => setSortKey(event.target.value)}
                        >
                            <option value="name">Name</option>
                            <option value="id">ID</option>
                            <option value="hp">HP</option>
                            <option value="attack">ATK</option>
                            <option value="defense">DEF</option>
                            <option value="special-attack">SPA</option>
                            <option value="special-defense">SPD</option>
                            <option value="speed">SPE</option>
                        </select>
                    </label>
                    <label className="poke-list-filter">
                        <span className="poke-list-filter-label">Order</span>
                        <select
                            className="poke-list-select"
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value)}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </label>
                </div>
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
