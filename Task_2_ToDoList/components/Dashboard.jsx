"use client";

import Navbar from './Navbar'
import Footer from './footer'
import { useState, useEffect } from "react";
import { Shippori_Antique } from "next/font/google";

const shipporiFont = Shippori_Antique({
    weight: "400",
    subsets: ["latin"]
});


export default function Dashboard({ username }) {
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const storageKey = `todos_${username}`;


    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) setTodos(JSON.parse(stored));
    }, [storageKey]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(todos));
    }, [todos, storageKey]);

    const addTodo = () => {
        if (!title.trim()) return;

        setTodos([
            {
                id: Date.now().toString(),
                title,
                description,
                date,
                completed: false,
            },
            ...todos,
        ]);

        setTitle("");
        setDescription("");
        setDate("");
    };

    const toggleTodo = (id) => {
        setTodos(
            todos.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t
            )
        );
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter((t) => t.id !== id));
        setConfirmDelete(null);
    };

    return (
        <div className={`${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300 min-h-screen`}>
            <Navbar toggleTheme={() => setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode} />
            <div className={`flex py-10 ${isDarkMode ? 'bg-gray-900' : 'bg-[#f6f7f9]'} transition-colors duration-300`}>


                <main className="flex-1 px-6 py-8 max-w-3xl mx-auto">

                    <div className="mb-8">
                        <h2 className={`${shipporiFont.className} text-2xl font-extrabold  tracking-tight`}>
                            Good to see you, {username}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Organize your day with clarity.
                        </p>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border rounded-2xl p-5 mb-8 space-y-3 shadow-sm transition-colors duration-300`}>

                        <input
                            className={`w-full text-sm border-b py-2 outline-none bg-transparent transition-colors duration-300 ${isDarkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-gray-900 placeholder-gray-400'}`}
                            placeholder="What do you need to do?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            className={`w-full text-sm border-b py-2 outline-none bg-transparent resize-none transition-colors duration-300 ${isDarkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-gray-900 placeholder-gray-400'}`}
                            placeholder="Add a note (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <div className="flex justify-between items-center pt-2">
                            <input
                                type="date"
                                className={`text-sm outline-none bg-transparent ${isDarkMode ? 'text-gray-400 [color-scheme:dark]' : 'text-gray-500'}`}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />

                            <button
                                onClick={addTodo}
                                className={`text-sm px-4 py-2 rounded-full transition-colors ${isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:opacity-90'}`}
                            >
                                Add task
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">

                        {todos.length === 0 && (
                            <p className="text-sm text-gray-400 text-center mt-10">
                                No tasks yet. Add something meaningful.
                            </p>
                        )}

                        {todos.map((todo) => (
                            <div
                                key={todo.id}
                                className={`group border rounded-xl p-4 flex justify-between items-start hover:shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100'}`}
                            >
                                <div>
                                    <h3
                                        className={`text-sm font-medium ${todo.completed
                                            ? "line-through text-gray-500"
                                            : (isDarkMode ? "text-gray-200" : "text-gray-900")
                                            }`}
                                    >
                                        {todo.title}
                                    </h3>

                                    {todo.description && (
                                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {todo.description}
                                        </p>
                                    )}

                                    {todo.date && (
                                        <p className={`text-[11px] mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            Due {todo.date}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition">

                                    <button
                                        onClick={() => toggleTodo(todo.id)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm transition-colors ${todo.completed
                                            ? "bg-green-500 text-white border-green-500"
                                            : (isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "hover:bg-gray-100")
                                            }`}
                                    >
                                        ✓
                                    </button>

                                    <button
                                        onClick={() => setConfirmDelete(todo.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border text-sm text-red-500 hover:bg-red-50"
                                    >
                                        ✕
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>


                    {confirmDelete && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className={`rounded-xl p-5 w-80 shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>

                                <h2 className="text-sm font-semibold">
                                    Delete this task?
                                </h2>

                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    This action cannot be undone.
                                </p>

                                <div className="flex justify-end gap-2 mt-5">

                                    <button
                                        onClick={() => setConfirmDelete(null)}
                                        className={`text-xs px-3 py-1 rounded-md border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={() => deleteTodo(confirmDelete)}
                                        className="text-xs px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
                                    >
                                        Delete
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}

                </main>

            </div>
            <Footer isDarkMode={isDarkMode} />
        </div>
    );
}