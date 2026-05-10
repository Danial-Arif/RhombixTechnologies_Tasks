'use client';

import Navbar from '@/components/navbar';
import About from '@/components/about';
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function Upload() {
    const [form, setForm] = useState({
        title: '',
        artist: '',
    });

    const [coverImage, setCoverImage] = useState(null);
    const [audioFile, setAudioFile] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('title', form.title);
        formData.append('artist', form.artist);

        if (coverImage) formData.append('cover_image', coverImage);
        if (audioFile) formData.append('audio_file', audioFile);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData, // ✅ IMPORTANT
            });

            if (res.ok) {
                alert('Song uploaded successfully');
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white md:ml-[260px] overflow-y-auto scrollbar-hide">
            <Navbar />
            <About />

            <div className="px-6 py-10">
                <div className="m-10">
                    <h1 className="text-4xl font-extrabold">Upload your music</h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Add a song to your library and share your vibe.
                    </p>
                </div>

                <div className="flex items-center justify-center py-10">
                    <form
                        onSubmit={handleSubmit}
                        className="flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-md"
                    >
                        {/* Title */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-300">Song title</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                className="rounded-lg bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#6FFBBE]"
                            />
                        </div>

                        {/* Artist */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-300">Artist</label>
                            <input
                                type="text"
                                name="artist"
                                value={form.artist}
                                onChange={handleChange}
                                className="rounded-lg bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#6FFBBE]"
                            />
                        </div>

                        {/* Cover Image */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-300">Cover image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                                className="rounded-lg bg-black/40 px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#6FFBBE] file:px-4 file:py-2 file:text-black"
                            />
                        </div>

                        {/* Audio */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-300">Audio file</label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                className="rounded-lg bg-black/40 px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#6FFBBE] file:px-4 file:py-2 file:text-black"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="mt-2 rounded-lg bg-[#6FFBBE] py-3 font-semibold text-black transition hover:opacity-70"
                        >
                            Upload Song
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}