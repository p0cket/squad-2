import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function FireInput() {
    const [inputs, setInputs] = useState([{ key: "", value: "" }]);
    const [data, setData] = useState(null);

    const handleInputChange = (index, event) => {
        const values = [...inputs];
        values[index][event.target.name] = event.target.value;
        setInputs(values);
        console.log("Inputs updated:", values); // Logging input changes
    };

    const addNewDoc = async (formData) => {
        try {
            console.log("Attempting to add document to Firestore..."); // Log attempt
            const ref = collection(db, "posts"); // Collection reference
            const docRef = await addDoc(ref, formData);
            console.log("Document successfully written with ID:", docRef.id); // Log success
            setData(formData); // Set the form data to state
        } catch (error) {
            console.error("Error adding document:", error); // Log the error
        }
    };

    const loadDoc = async (docId) => {
        try {
            console.log("Attempting to load document from Firestore..."); // Log attempt
            const docRef = doc(db, "posts", docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data()); // Log document data
                setData(docSnap.data());
            } else {
                console.log("No such document!"); // Log if no document found
            }
        } catch (error) {
            console.error("Error loading document:", error); // Log the error
        }
    };

    const handleSave = () => {
        const formData = inputs.reduce((acc, input) => {
            acc[input.key] = input.value;
            return acc;
        }, {});
        addNewDoc(formData);
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Firestore Data Entry</h1>
            <div className="space-y-4 mb-6 w-full max-w-md">
                {inputs.map((input, index) => (
                    <div key={index} className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Key"
                            name="key"
                            value={input.key}
                            onChange={(e) => handleInputChange(index, e)}
                            className="w-1/2 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                        />
                        <input
                            type="text"
                            placeholder="Value"
                            name="value"
                            value={input.value}
                            onChange={(e) => handleInputChange(index, e)}
                            className="w-1/2 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>
                ))}
            </div>
            <div className="space-x-4 mb-4">
                <button
                    onClick={handleSave}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                >
                    Save
                </button>
                <button
                    onClick={() => loadDoc("your-doc-id-here")}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                >
                    Load
                </button>
            </div>
            <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-700">Data</h2>
                <div className="text-gray-600">
                    {data ? Object.keys(data).map((key) => (
                        <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span>{data[key]}</span>
                        </div>
                    )) : "No data loaded"}
                </div>
            </div>
        </div>
    );
}

export default FireInput;
