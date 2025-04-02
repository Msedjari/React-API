import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";

import { ModelObject } from "../../models/ModelObject";
import { ModelData } from "../../models/ModelData";

import "./Home.css";

const API_URL = "http://192.168.236.234:8080/objects"; //S'ha de canviar localhost per la IP correcte

function Home() {
    const [objects, setObjects] = useState<ModelObject[]>([]); //Lista dels objectes a mostrar
    const [newObject, setNewObject] = useState<string>(""); //Control de l'input de les dades d'objecte
    const [objectId, setObjectId] = useState<string>(""); //Control de l'input de ID

    useEffect(() => {
        fetchObjects();
    }, []);

    const fetchObjects = async () => {
        //TODO Recuperar tots els objectes amb axios
        try {
            // Obtener todos los objetos de la API
            const response = await axios.get(API_URL);
            // Convertir los datos recibidos al modelo de objetos de la aplicación
            const objectsData = response.data.map((obj: any) => new ModelObject(obj.name, new ModelData(obj.data.photo, obj.data.description, obj.data.price), obj.id));
            // Actualizar el estado con los objetos obtenidos
            setObjects(objectsData);
        } catch (error) {
            console.error("Error recuperant els objectes:", error);
        }
    };
    
    const fetchObjectById = async () => {
        //TODO Recuperar un objecte per ID amb fetch
        // Buscar un objeto específico por su ID
        fetch(`${API_URL}/${objectId}`).then(response => {
                // Verificar si la respuesta del servidor es correcta
                if (!response.ok) {
                        throw new Error("Error en la resposta del servidor");
                }
                // Convertir la respuesta a formato JSON
                return response.json();
            })
            .then(obj => {
                // Crear un nuevo objeto con los datos recibidos
                const fetchedObject = new ModelObject(obj.name, new ModelData(obj.data.photo, obj.data.description, obj.data.price), obj.id);
                // Actualizar el estado con el objeto encontrado
                setObjects([fetchedObject]);
            })
            .catch(error => {
                // Manejar errores durante la búsqueda
                console.error("Error recuperant l'objecte:", error);
            })
            .finally(() => {
                // Limpiar el campo de ID después de la búsqueda
                setObjectId("");
            });
    };
    
    const createObject = async () => {
        //TODO Crear un objecte per ID amb axios
        // Verificar que hay datos para crear un objeto
        if (!newObject) return;
        try {
            // Separar los valores introducidos por comas
            const [name, photo, description, priceStr] = newObject.split(',');
            // Convertir el precio a número
            const price = parseFloat(priceStr);
            
            // Verificar que todos los campos necesarios están presentes
            if (!name || !photo || !description || isNaN(price)) {
                throw new Error("Todos los campos son obligatorios: nombre, foto, descripción y precio.");
            }

            // Crear un nuevo objeto con los datos proporcionados
            const newObj = new ModelObject(
                name.trim(), 
                new ModelData(photo.trim(), description.trim(), price)
            );

            // Enviar petición POST para crear el objeto en la API
            await axios.post(API_URL, newObj);
            
            // Actualizar la lista de objetos después de crear uno nuevo
            fetchObjects();
            // Limpiar el campo de entrada después de crear
            setNewObject(""); 
        } catch (error) {
            // Manejar errores durante la creación
            console.error("Error creant l'objecte:", error);
            alert(`Error al crear el objeto. ${(error as Error).message}`);
        }
    };
    
    const updateObject = async (id: string) => {
        //TODO Actualitzar un objecte per ID amb fetch
        // Verificar que existe un ID y datos para actualizar
        if (!id || !newObject) return;
        try {
            // Separar los valores introducidos por comas
            const [name, photo, description, priceStr] = newObject.split(',');
            // Convertir el precio a número
            const price = parseFloat(priceStr);
            
            // Verificar que todos los campos necesarios están presentes
            if (!name || !photo || !description || isNaN(price)) {
                throw new Error("Todos los campos son obligatorios: nombre, foto, descripción y precio.");
            }

            // Crear un objeto actualizado con los nuevos datos
            const updatedObj = new ModelObject(
                name.trim(), 
                new ModelData(photo.trim(), description.trim(), price), id
            );

            // Enviar petición PUT para actualizar el objeto en la API
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedObj),
            });
            
            // Comprobar si la respuesta es correcta
            if (!response.ok) {
                throw new Error("Error en actualitzar l'objecte");
            }
            
            // Actualizar la lista de objetos después de la actualización
            fetchObjects();
            // Limpiar el campo de entrada después de actualizar
            setNewObject(""); 
        } catch (error) {
            // Manejar errores durante la actualización
            console.error("Error actualitzant l'objecte:", error);
            alert(`Error al actualizar el objeto. ${(error as Error).message}`);
        }
    };
    
    const deleteObject = async (id: string) => {
        //TODO Eliminar un objecte per ID amb fetch o axios
        // Verificar que existe un ID para eliminar
        if (!id) return;
        try {
            // Enviar petición DELETE para eliminar el objeto de la API
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });
            
            // Comprobar si la respuesta es correcta
            if (!response.ok) {
                throw new Error("Error en eliminar l'objecte");
            }
            
            // Actualizar la lista de objetos después de eliminar
            fetchObjects();
        } catch (error) {
            // Manejar errores durante la eliminación
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