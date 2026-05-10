import mongoose, { Schema, models } from 'mongoose';

const SongSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        artist: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
            required: true,
        },
        audioFile: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Song = models.Song || mongoose.model('Song', SongSchema);
export default Song;