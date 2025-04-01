import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";

import { ModelObject } from "../../models/ModelObject";
import { ModelData } from "../../models/ModelData";

import "./Home.css";

const API_URL = "http://192.168.238.42:8080/objects"; //S'ha de canviar localhost per la IP correcte

function Home() {
    const [objects, setObjects] = useState<ModelObject[]>([]); //Lista dels objectes a mostrar
    const [newObject, setNewObject] = useState<string>(""); //Control de l'input de les dades d'objecte
    const [objectId, setObjectId] = useState<string>(""); //Control de l'input de ID

    useEffect(() => {
        fetchObjects();
    }, []);

    const fetchObjects = async () => {
        try {
            const response = await axios.get(API_URL);
            const objectsData = response.data.map((obj: any) => new ModelObject(obj.name, new ModelData(obj.data.photo, obj.data.description, obj.data.price), obj.id));
            setObjects(objectsData);
        } catch (error) {
            console.error("Error recuperant els objectes:", error);
        }
    };
    
    const fetchObjectById = async () => {
        if (!objectId) return;
        try {
            const response = await fetch(`${API_URL}/${objectId}`);
            if (!response.ok) {
                throw new Error("Error en la resposta del servidor");
            }
            const obj = await response.json();
            const fetchedObject = new ModelObject(obj.name, new ModelData(obj.data.photo, obj.data.description, obj.data.price), obj.id);
           
            // Mostrar solo el objeto buscado en la pantalla
            setObjects([fetchedObject]);
            
            // Limpiar el campo de búsqueda después de encontrar el objeto
            setObjectId("");
            
            console.log("Objeto encontrado:", fetchedObject);
        } catch (error) {
            console.error("Error recuperant l'objecte:", error);
            alert("No se ha encontrado el objeto con el ID especificado");
        }
    };
    
    const createObject = async () => {
        if (!newObject) return;
        try {
            // Parse comma-separated values instead of JSON
            const [name, photo, description, priceStr] = newObject.split(',');
            const price = parseFloat(priceStr);
            
            // Verificar que el objeto tiene los campos necesarios
            if (!name || !photo || !description || isNaN(price)) {
                throw new Error("Todos los campos son obligatorios: nombre, foto, descripción y precio.");
            }

            const newObj = new ModelObject(
                name.trim(), 
                new ModelData(photo.trim(), description.trim(), price)
            );

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newObj)
            });

            if (!response.ok) {
                throw new Error("Error en crear l'objecte");
            }

            fetchObjects();
            setNewObject(""); // Limpiar el campo después de crear
        } catch (error) {
            console.error("Error creant l'objecte:", error);
            alert(`Error al crear el objeto. ${(error as Error).message}`);
        }
    };
    
    const updateObject = async (id: string) => {
        if (!id || !newObject) return;
        try {
            // Parse comma-separated values instead of JSON
            const [name, photo, description, priceStr] = newObject.split(',');
            const price = parseFloat(priceStr);
            
            // Verificar que el objeto tiene los campos necesarios
            if (!name || !photo || !description || isNaN(price)) {
                throw new Error("Todos los campos son obligatorios: nombre, foto, descripción y precio.");
            }

            const updatedObj = new ModelObject(
                name.trim(), 
                new ModelData(photo.trim(), description.trim(), price), 
                id
            );

            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedObj),
            });
            
            if (!response.ok) {
                throw new Error("Error en actualitzar l'objecte");
            }
            
            fetchObjects();
            setNewObject(""); // Limpiar el campo después de actualizar
        } catch (error) {
            console.error("Error actualitzant l'objecte:", error);
            alert(`Error al actualizar el objeto. ${(error as Error).message}`);
        }
    };
    
    const deleteObject = async (id: string) => {
        if (!id) return;
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            if (response.status !== 200) {
                throw new Error("Error en eliminar l'objecte");
            }
            fetchObjects();
        } catch (error) {
            console.error("Error eliminant l'objecte:", error);
        }
    };
    
    

    //Actualitzar el valor de l'objecte de l'input
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewObject(e.target.value);
    };

    //Actualitzar el valor de l'ID de l'input
    const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setObjectId(e.target.value);
    };

    return (
        <div className="container">
            <h1>Online Store</h1>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Nom, foto, descripció, preu"
                    value={newObject}
                    onChange={handleInputChange}
                />
                <button onClick={createObject}>Crear producte</button>
            </div>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="ID producte"
                    value={objectId}
                    onChange={handleIdChange}
                />
                <button onClick={fetchObjectById}>Buscar per ID</button>
            </div>
            <button className="refresh-btn" onClick={fetchObjects}>
                Mostrar tots els productes
            </button>
            <div className="object-list">
                {objects.map((obj) => (
                    <div key={obj.id} className="object-card">
                        <img src={obj.data.photo} alt={obj.name} className="object-photo" />
                        <div className="object-details">
                            <h2>{obj.name}</h2>
                            <p>{obj.data.description}</p>
                            <p className="object-price">{obj.data.getFormattedPrice()}</p>
                            <button onClick={() => updateObject(obj.id!)}>Actualitzar</button>
                            <button
                                className="delete-btn"
                                onClick={() => deleteObject(obj.id!)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
