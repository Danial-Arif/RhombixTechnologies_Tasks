import mongoose, { Schema, models } from 'mongoose';

const PlaylistSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            default: '',
        },

        coverImage: {
            type: String,
            default: '',
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        songs: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Song',
            },
        ],

        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Playlist =  models.Playlist || mongoose.model('Playlist', PlaylistSchema);

export default Playlist;