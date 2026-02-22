import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PokeCard.css";
import PokeTitle from "./pokeTitle";
import PokeImage from "./PokeImage";

const PokeCard = ({ pokemon }) => {
    const navigate = useNavigate();
    const [pokeState, setPokeState] = useState({});
    const [activeTab, setActiveTab] = useState("stats");
    const [tabData, setTabData] = useState({});
    const [tabLoading, setTabLoading] = useState(false);
    const [tabError, setTabError] = useState(null);
    const [pokeApiData, setPokeApiData] = useState(null);

    useEffect(() => {

        if (pokemon.id) {
            // fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`)
            fetch(`http://localhost:3000/pokemons/${pokemon.id}`)
                .then((response) => response.json())
                .then((data) => {
                    setPokeState(data);
                    console.log("Détails du Pokémon reçus:", data);
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération des détails du Pokémon:", error);
                });
        } else if (pokemon.name) {
            // fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
            fetch(`http://localhost:3000/pokemon/name/${pokemon.name.english}`)
                .then((response) => response.json())
                .then((data) => {
                    setPokeState(data);
                    console.log("Détails du Pokémon reçus:", data);
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération des détails du Pokémon:", error);
                });
        }
    }, [pokemon]);


    const displayName =
        pokemon?.name?.english || pokemon?.name || pokeState?.name?.english || pokeState?.name || "Pokemon";
    const imageUrl =
        pokemon?.image ||
        pokeState?.sprites?.other?.["official-artwork"]?.front_default ||
        pokeState?.sprites?.front_default ||
        "";
    const types =
        pokemon?.type || pokeState?.types?.map((type) => type?.type?.name).filter(Boolean) || [];

    const primaryType = (types[0] || "grass").toLowerCase();
    const typeColorMap = {
        normal: "168 168 120",
        fire: "255 120 48",
        water: "104 144 240",
        electric: "248 208 48",
        grass: "120 200 80",
        ice: "152 216 216",
        fighting: "192 48 40",
        poison: "160 64 160",
        ground: "224 192 104",
        flying: "168 144 240",
        psychic: "248 88 136",
        bug: "168 184 32",
        rock: "184 160 56",
        ghost: "112 88 152",
        dragon: "112 56 248",
        dark: "112 88 72",
        steel: "184 184 208",
        fairy: "238 153 172",
    };
    const cardStyle = {
        "--type-rgb": typeColorMap[primaryType] || "34 255 42",
    };

    const pokeApiKey =
        pokemon?.name?.english ||
        pokemon?.name ||
        pokeState?.name?.english ||
        pokeState?.name ||
        pokemon?.id ||
        pokeState?.id ||
        "";

    const isCustomPokemon = Boolean(pokemon?.isCustom || pokeState?.isCustom);

    useEffect(() => {
        setActiveTab("stats");
        setTabData({});
        setTabError(null);
        setTabLoading(false);
        setPokeApiData(null);
    }, [pokeApiKey]);

    const fetchJson = async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
    };

    const ensurePokeApiData = async () => {
        if (pokeApiData) {
            return pokeApiData;
        }
        const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${pokeApiKey}`);
        setPokeApiData(data);
        return data;
    };

    const parseEvolutionChain = (chain) => {
        const names = [];
        let node = chain;
        while (node) {
            if (node.species?.name) {
                names.push(node.species.name);
            }
            node = node.evolves_to?.[0];
        }
        return names;
    };

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        if (isCustomPokemon) {
            if (tab === "abilities") {
                setTabData((prev) => ({ ...prev, abilities: [] }));
            }
            if (tab === "attacks") {
                setTabData((prev) => ({ ...prev, attacks: [] }));
            }
            if (tab === "evolutions") {
                setTabData((prev) => ({ ...prev, evolutions: [] }));
            }
            return;
        }
        if (!pokeApiKey || tabData[tab]) {
            return;
        }

        setTabLoading(true);
        setTabError(null);

        try {
            if (tab === "evolutions") {
                let evolutionDetails = [];
                try {
                    const species = await fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${pokeApiKey}`);
                    const evolution = await fetchJson(species.evolution_chain.url);
                    const chain = parseEvolutionChain(evolution.chain);
                    if (chain.length > 1) {
                        evolutionDetails = await Promise.all(
                            chain.map(async (name) => {
                                const evoData = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${name}`);
                                return {
                                    name,
                                    image:
                                        evoData?.sprites?.other?.["official-artwork"]?.front_default ||
                                        evoData?.sprites?.front_default ||
                                        "",
                                };
                            })
                        );
                    }
                } catch (error) {
                    evolutionDetails = [];
                }
                setTabData((prev) => ({ ...prev, evolutions: evolutionDetails }));
            } else {
                const data = await ensurePokeApiData();

                if (tab === "abilities") {
                    const abilities = data.abilities?.map((item) => item.ability.name) || [];
                    setTabData((prev) => ({ ...prev, abilities }));
                }

                if (tab === "attacks") {
                    const moves = data.moves?.map((item) => item.move.name) || [];
                    setTabData((prev) => ({ ...prev, attacks: moves.slice(0, 12) }));
                }

                if (tab === "stats") {
                    const statColorMap = {
                        hp: "stat-bar-hp",
                        attack: "stat-bar-attack",
                        defense: "stat-bar-defense",
                        "special-attack": "stat-bar-special-attack",
                        "special-defense": "stat-bar-special-defense",
                        speed: "stat-bar-speed",
                    };
                    const mappedStats = (data.stats || []).map((stat) => {
                        const labelMap = {
                            hp: "HP",
                            attack: "ATK",
                            defense: "DEF",
                            "special-attack": "SPA",
                            "special-defense": "SPD",
                            speed: "SPE",
                        };
                        return {
                            label: labelMap[stat.stat.name] || stat.stat.name.toUpperCase(),
                            value: stat.base_stat,
                            max: 255,
                            color: statColorMap[stat.stat.name] || "stat-bar-attack",
                        };
                    });
                    setTabData((prev) => ({ ...prev, stats: mappedStats }));
                }
            }
        } catch (error) {
            setTabError("Nao foi possivel carregar os dados da PokeAPI.");
        } finally {
            setTabLoading(false);
        }
    };

    const stats = useMemo(() => {
        if (pokemon?.base) {
            return [
                { label: "HP", value: pokemon.base.HP ?? 0, max: 255, color: "stat-bar-hp" },
                { label: "ATK", value: pokemon.base.Attack ?? 0, max: 190, color: "stat-bar-attack" },
                { label: "DEF", value: pokemon.base.Defense ?? 0, max: 190, color: "stat-bar-defense" },
                { label: "SPA", value: pokemon.base.SpecialAttack ?? 0, max: 190, color: "stat-bar-special-attack" },
                { label: "SPD", value: pokemon.base.SpecialDefense ?? 0, max: 190, color: "stat-bar-special-defense" },
                { label: "SPE", value: pokemon.base.Speed ?? 0, max: 190, color: "stat-bar-speed" },
            ];
        }

        if (pokeState?.stats?.length) {
            const findStat = (name) => pokeState.stats.find((stat) => stat?.stat?.name === name)?.base_stat ?? 0;
            return [
                { label: "HP", value: findStat("hp"), max: 255, color: "stat-bar-hp" },
                { label: "ATK", value: findStat("attack"), max: 190, color: "stat-bar-attack" },
                { label: "DEF", value: findStat("defense"), max: 190, color: "stat-bar-defense" },
                { label: "SPA", value: findStat("special-attack"), max: 190, color: "stat-bar-special-attack" },
                { label: "SPD", value: findStat("special-defense"), max: 190, color: "stat-bar-special-defense" },
                { label: "SPE", value: findStat("speed"), max: 190, color: "stat-bar-speed" },
            ];
        }

        return [];
    }, [pokemon, pokeState]);

    const handleCardClick = () => {
        const pokemonId = pokemon?.id || pokeState?.id;
        if (!pokemonId) {
            return;
        }
        navigate(`/pokemonDetails/${pokemonId}`);
    };

    return (
        <article className="poke-card" style={cardStyle} onClick={handleCardClick}>
            <header className="poke-card-header">
                <div className="poke-card-header-content">
                    <PokeTitle name={displayName} />
                </div>
            </header>

            <section className="poke-card-top">
                <div className="poke-card-types">
                    {types.map((type) => (
                        <span key={type} className={`poke-type-chip poke-type-${type.toLowerCase()}`}>
                            {type}
                        </span>
                    ))}
                </div>

                <div className="poke-card-body">
                    <div className="poke-card-image-frame">
                        {imageUrl ? (
                            <PokeImage imageUrl={imageUrl} />
                        ) : (
                            <span className="poke-card-image-placeholder">Image</span>
                        )}
                    </div>
                </div>
            </section>

            <nav className="poke-card-tabs">
                <button
                    className={`poke-tab ${activeTab === "abilities" ? "poke-tab-active" : ""}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleTabChange("abilities");
                    }}
                >
                    Abilities
                </button>
                <button
                    className={`poke-tab ${activeTab === "attacks" ? "poke-tab-active" : ""}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleTabChange("attacks");
                    }}
                >
                    Attacks
                </button>
                <button
                    className={`poke-tab ${activeTab === "evolutions" ? "poke-tab-active" : ""}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleTabChange("evolutions");
                    }}
                >
                    Evolutions
                </button>
                <button
                    className={`poke-tab ${activeTab === "stats" ? "poke-tab-active" : ""}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleTabChange("stats");
                    }}
                >
                    Stats
                </button>
            </nav>

            <section className="poke-card-content">
                {tabLoading && <p className="poke-card-loading">Loading...</p>}
                {tabError && <p className="poke-card-error">{tabError}</p>}

                {!tabLoading && !tabError && activeTab === "stats" && (
                    <div className="poke-card-stats squada-one-regular">
                        {(tabData.stats || stats).map((stat) => (
                            <div className="stat-row" key={stat.label}>
                                <span className="stat-label squada-one-regular">{stat.label}</span>
                                <div className="stat-bar">
                                    <span
                                        className={`stat-bar-fill ${stat.color}`}
                                        style={{ width: `${Math.min(100, (stat.value / stat.max) * 100)}%` }}
                                    />
                                </div>
                                <span className="stat-value">
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {!tabLoading && !tabError && activeTab === "abilities" && (
                    <ul className="poke-card-list">
                        {(tabData.abilities || []).map((item) => (
                            <li className="poke-card-list-item" key={item}>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}

                {!tabLoading && !tabError && activeTab === "attacks" && (
                    <ul className="poke-card-list">
                        {(tabData.attacks || []).map((item) => (
                            <li className="poke-card-list-item" key={item}>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}

                {!tabLoading && !tabError && activeTab === "evolutions" && (
                    (tabData.evolutions || []).length ? (
                        <ul className="poke-card-list">
                            {(tabData.evolutions || []).map((item) => (
                                <li className="poke-card-list-item poke-card-evolution" key={item.name}>
                                    {item.image && (
                                        <img className="poke-card-evolution-image" src={item.image} alt={item.name} />
                                    )}
                                    <span className="poke-card-evolution-name">{item.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="poke-card-loading">No evolutions for this pokemon</p>
                    )
                )}
            </section>
        </article>
    );
}

export default PokeCard;