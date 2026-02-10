import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./pokemonDetails.css";

const emptyBase = {
    HP: 0,
    Attack: 0,
    Defense: 0,
    SpecialAttack: 0,
    SpecialDefense: 0,
    Speed: 0,
};

const PokemonDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        nameEnglish: "",
        image: "",
        type: "",
        base: { ...emptyBase },
    });

    const [newPokemon, setNewPokemon] = useState({
        id: "",
        nameEnglish: "",
        image: "",
        type: "",
        base: { ...emptyBase },
    });

    useEffect(() => {
        const fetchPokemon = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/pokemons/${id}`);
                if (!response.ok) {
                    throw new Error("Pokemon not found.");
                }
                const data = await response.json();
                setPokemon(data);
                setFormData({
                    nameEnglish: data?.name?.english || "",
                    image: data?.image || "",
                    type: (data?.type || []).join(", "),
                    base: {
                        HP: data?.base?.HP ?? 0,
                        Attack: data?.base?.Attack ?? 0,
                        Defense: data?.base?.Defense ?? 0,
                        SpecialAttack: data?.base?.SpecialAttack ?? 0,
                        SpecialDefense: data?.base?.SpecialDefense ?? 0,
                        Speed: data?.base?.Speed ?? 0,
                    },
                });
                setError("");
            } catch (err) {
                setError(err.message || "Failed to load the Pokemon.");
            } finally {
                setLoading(false);
            }
        };

        fetchPokemon();
    }, [id]);

    const parseTypes = (value) =>
        value
            .split(",")
            .map((type) => type.trim())
            .filter(Boolean);

    const handleBaseChange = (stateSetter, key, value) => {
        stateSetter((prev) => ({
            ...prev,
            base: {
                ...prev.base,
                [key]: Number(value),
            },
        }));
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        if (!pokemon?.id) {
            return;
        }

        setActionMessage("");
        setError("");

        try {
            const updatedPokemon = {
                ...pokemon,
                name: {
                    ...(typeof pokemon.name === "object" ? pokemon.name : {}),
                    english: formData.nameEnglish,
                },
                image: formData.image,
                type: parseTypes(formData.type).length ? parseTypes(formData.type) : pokemon.type,
                base: {
                    ...(pokemon.base || {}),
                    ...formData.base,
                },
            };

            const response = await fetch(`http://localhost:3000/pokemons/${pokemon.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedPokemon),
            });

            if (!response.ok) {
                throw new Error("Failed to update the Pokemon.");
            }

            const data = await response.json();
            setPokemon(data);
            setActionMessage("Pokemon updated successfully.");
        } catch (err) {
            setError(err.message || "Failed to update the Pokemon.");
        }
    };

    const handleDelete = async () => {
        if (!pokemon?.id) {
            return;
        }

        const confirmed = window.confirm("Are you sure you want to delete this Pokemon?");
        if (!confirmed) {
            return;
        }

        setActionMessage("");
        setError("");

        try {
            const response = await fetch(`http://localhost:3000/pokemons/${pokemon.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete the Pokemon.");
            }

            setActionMessage("Pokemon deleted successfully.");
            navigate("/");
        } catch (err) {
            setError(err.message || "Failed to delete the Pokemon.");
        }
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        setActionMessage("");
        setError("");

        try {
            const payload = {
                id: Number(newPokemon.id),
                name: {
                    english: newPokemon.nameEnglish,
                },
                type: parseTypes(newPokemon.type),
                image: newPokemon.image,
                base: {
                    ...newPokemon.base,
                },
            };

            const response = await fetch("http://localhost:3000/pokemons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to add the Pokemon.");
            }

            setActionMessage("Pokemon created successfully.");
            setNewPokemon({
                id: "",
                nameEnglish: "",
                image: "",
                type: "",
                base: { ...emptyBase },
            });
        } catch (err) {
            setError(err.message || "Failed to add the Pokemon.");
        }
    };

    if (loading) {
        return <p className="details-status">Loading Pokemon details...</p>;
    }

    if (error) {
        return (
            <div className="details-page">
                <div className="details-card">
                    <p className="details-status details-error">{error}</p>
                    <Link className="details-link" to="/">
                        Back to list
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="details-page">
            <div className="details-card">
                <header className="details-header">
                    <div>
                        <h1 className="details-title">Pokemon Details</h1>
                        <p className="details-subtitle">Edit or manage Pokemon data</p>
                    </div>
                    {pokemon?.image && (
                        <img className="details-preview" src={pokemon.image} alt={pokemon?.name?.english || ""} />
                    )}
                </header>
                {pokemon && (
                    <section className="details-section">
                        <h2 className="details-section-title">Edit {pokemon?.name?.english || pokemon?.name}</h2>
                        <form className="details-form" onSubmit={handleUpdate}>
                            <label className="details-field">
                                <span className="details-label">Name (English)</span>
                                <input
                                    className="details-input"
                                    type="text"
                                    value={formData.nameEnglish}
                                    onChange={(event) =>
                                        setFormData((prev) => ({ ...prev, nameEnglish: event.target.value }))
                                    }
                                />
                            </label>
                            <label className="details-field">
                                <span className="details-label">Image (URL)</span>
                                <input
                                    className="details-input"
                                    type="text"
                                    value={formData.image}
                                    onChange={(event) =>
                                        setFormData((prev) => ({ ...prev, image: event.target.value }))
                                    }
                                />
                            </label>
                            <label className="details-field">
                                <span className="details-label">Types (comma separated)</span>
                                <input
                                    className="details-input"
                                    type="text"
                                    value={formData.type}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                                />
                            </label>
                            <div className="details-grid">
                                <label className="details-field">
                                    <span className="details-label">HP</span>
                                    <input
                                        className="details-input"
                                        type="number"
                                        value={formData.base.HP}
                                        onChange={(event) => handleBaseChange(setFormData, "HP", event.target.value)}
                                    />
                                </label>
                                <label className="details-field">
                                    <span className="details-label">ATK</span>
                                    <input
                                        className="details-input"
                                        type="number"
                                        value={formData.base.Attack}
                                        onChange={(event) => handleBaseChange(setFormData, "Attack", event.target.value)}
                                    />
                                </label>
                                <label className="details-field">
                                    <span className="details-label">DEF</span>
                                    <input
                                        className="details-input"
                                        type="number"
                                        value={formData.base.Defense}
                                        onChange={(event) => handleBaseChange(setFormData, "Defense", event.target.value)}
                                    />
                                </label>
                                <label className="details-field">
                                    <span className="details-label">SPA</span>
                                    <input
                                        className="details-input"
                                        type="number"
                                        value={formData.base.SpecialAttack}
                                        onChange={(event) =>
                                            handleBaseChange(setFormData, "SpecialAttack", event.target.value)
                                        }
                                    />
                                </label>
                                <label className="details-field">
                                    <span className="details-label">SPD</span>
                                    <input
                                        className="details-input"
                                        type="number"
                                        value={formData.base.SpecialDefense}
                                        onChange={(event) =>
                                            handleBaseChange(setFormData, "SpecialDefense", event.target.value)
                                        }
                                    />
                                </label>
                                <label className="details-field">
                                    <span className="details-label">SPE</span>
                                    <input
                                        className="details-input"
                                        type="number"
                                        value={formData.base.Speed}
                                        onChange={(event) => handleBaseChange(setFormData, "Speed", event.target.value)}
                                    />
                                </label>
                            </div>
                            <div className="details-actions">
                                <button className="details-button" type="submit">
                                    Save changes
                                </button>
                                <button className="details-button details-button-danger" type="button" onClick={handleDelete}>
                                    Delete Pokemon
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="details-section">
                    <h2 className="details-section-title">Add new Pokemon</h2>
                    <form className="details-form" onSubmit={handleCreate}>
                        <label className="details-field">
                            <span className="details-label">ID</span>
                            <input
                                className="details-input"
                                type="number"
                                value={newPokemon.id}
                                onChange={(event) =>
                                    setNewPokemon((prev) => ({ ...prev, id: event.target.value }))
                                }
                            />
                        </label>
                        <label className="details-field">
                            <span className="details-label">Name (English)</span>
                            <input
                                className="details-input"
                                type="text"
                                value={newPokemon.nameEnglish}
                                onChange={(event) =>
                                    setNewPokemon((prev) => ({ ...prev, nameEnglish: event.target.value }))
                                }
                            />
                        </label>
                        <label className="details-field">
                            <span className="details-label">Image (URL)</span>
                            <input
                                className="details-input"
                                type="text"
                                value={newPokemon.image}
                                onChange={(event) =>
                                    setNewPokemon((prev) => ({ ...prev, image: event.target.value }))
                                }
                            />
                        </label>
                        <label className="details-field">
                            <span className="details-label">Types (comma separated)</span>
                            <input
                                className="details-input"
                                type="text"
                                value={newPokemon.type}
                                onChange={(event) =>
                                    setNewPokemon((prev) => ({ ...prev, type: event.target.value }))
                                }
                            />
                        </label>
                        <div className="details-grid">
                            <label className="details-field">
                                <span className="details-label">HP</span>
                                <input
                                    className="details-input"
                                    type="number"
                                    value={newPokemon.base.HP}
                                    onChange={(event) => handleBaseChange(setNewPokemon, "HP", event.target.value)}
                                />
                            </label>
                            <label className="details-field">
                                <span className="details-label">ATK</span>
                                <input
                                    className="details-input"
                                    type="number"
                                    value={newPokemon.base.Attack}
                                    onChange={(event) => handleBaseChange(setNewPokemon, "Attack", event.target.value)}
                                />
                            </label>
                            <label className="details-field">
                                <span className="details-label">DEF</span>
                                <input
                                    className="details-input"
                                    type="number"
                                    value={newPokemon.base.Defense}
                                    onChange={(event) => handleBaseChange(setNewPokemon, "Defense", event.target.value)}
                                />
                            </label>
                            <label className="details-field">
                                <span className="details-label">SPA</span>
                                <input
                                    className="details-input"
                                    type="number"
                                    value={newPokemon.base.SpecialAttack}
                                    onChange={(event) =>
                                        handleBaseChange(setNewPokemon, "SpecialAttack", event.target.value)
                                    }
                                />
                            </label>
                            <label className="details-field">
                                <span className="details-label">SPD</span>
                                <input
                                    className="details-input"
                                    type="number"
                                    value={newPokemon.base.SpecialDefense}
                                    onChange={(event) =>
                                        handleBaseChange(setNewPokemon, "SpecialDefense", event.target.value)
                                    }
                                />
                            </label>
                            <label className="details-field">
                                <span className="details-label">SPE</span>
                                <input
                                    className="details-input"
                                    type="number"
                                    value={newPokemon.base.Speed}
                                    onChange={(event) => handleBaseChange(setNewPokemon, "Speed", event.target.value)}
                                />
                            </label>
                        </div>
                        <div className="details-actions">
                            <button className="details-button" type="submit">
                                Add Pokemon
                            </button>
                        </div>
                    </form>
                </section>

                {actionMessage && <p className="details-message">{actionMessage}</p>}
                <Link className="details-link" to="/">
                    Back to list
                </Link>
            </div>
        </div>
    );
};

export default PokemonDetails;